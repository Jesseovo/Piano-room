package service

import (
	"time"

	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"gorm.io/gorm"
)

type ReportService struct {
	db *gorm.DB
}

func NewReportService(db *gorm.DB) *ReportService {
	return &ReportService{db: db}
}

func (s *ReportService) reportTimeRange(dto model.CountReservationsDTO) (start, end time.Time) {
	now := time.Now()
	switch dto.Range {
	case "WEEK":
		start = now.AddDate(0, 0, -7)
		end = now
	case "MONTH":
		start = now.AddDate(0, -1, 0)
		end = now
	case "CUSTOM":
		if dto.Start != "" {
			start, _ = time.ParseInLocation("2006-01-02", dto.Start, time.Local)
		}
		if dto.End != "" {
			end, _ = time.ParseInLocation("2006-01-02", dto.End, time.Local)
			end = end.Add(24 * time.Hour)
		}
		if end.IsZero() {
			end = now
		}
		if start.IsZero() {
			start = now.AddDate(0, 0, -30)
		}
		return start, end
	default: // TODAY
		start = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		end = start.Add(24 * time.Hour)
		return start, end
	}
	if end.IsZero() {
		end = now
	}
	if start.IsZero() {
		start = now.AddDate(0, 0, -7)
	}
	return start, end
}

// CountReservations groups reservations by calendar day in the selected range.
func (s *ReportService) CountReservations(dto model.CountReservationsDTO) ([]model.ReservationCountVO, error) {
	start, end := s.reportTimeRange(dto)
	q := s.db.Model(&model.Reservation{}).Where("start_time >= ? AND start_time < ?", start, end)
	if dto.Status != "" {
		q = q.Where("status = ?", dto.Status)
	}
	type row struct {
		Day string
		Cnt int64
	}
	var rows []row
	err := q.Select("DATE(start_time) as day, COUNT(*) as cnt").
		Group("DATE(start_time)").
		Order("day").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	out := make([]model.ReservationCountVO, len(rows))
	for i, r := range rows {
		out[i] = model.ReservationCountVO{Date: r.Day, Count: int(r.Cnt)}
	}
	return out, nil
}

func (s *ReportService) GetBookingOverview() (*model.BookingOverview, error) {
	now := time.Now()
	dayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	dayEnd := dayStart.Add(24 * time.Hour)
	var booked int64
	s.db.Model(&model.Reservation{}).
		Where("start_time >= ? AND start_time < ? AND status <> ?", dayStart, dayEnd, "cancelled").
		Count(&booked)
	var totalRooms int64
	s.db.Model(&model.Room{}).Where("status = ?", int8(1)).Count(&totalRooms)
	var busy int64
	s.db.Raw(`
SELECT COUNT(DISTINCT room_id) FROM reservations
WHERE status IN (?, ?) AND start_time <= ? AND end_time > ?`,
		"approved", "occupied", now, now).Scan(&busy)
	avail := int(totalRooms) - int(busy)
	if avail < 0 {
		avail = 0
	}
	return &model.BookingOverview{
		BookedToday:    int(booked),
		AvailableToday: avail,
	}, nil
}

// GetActiveUsers returns users with most reservations recently.
func (s *ReportService) GetActiveUsers(limit int) ([]model.User, error) {
	if limit <= 0 {
		limit = 10
	}
	since := time.Now().AddDate(0, 0, -30)
	type uid struct {
		UserID int64
		Cnt    int64
	}
	var rows []uid
	err := s.db.Model(&model.Reservation{}).
		Select("user_id, COUNT(*) as cnt").
		Where("start_time >= ?", since).
		Group("user_id").
		Order("cnt DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	var users []model.User
	for _, r := range rows {
		var u model.User
		if err := s.db.First(&u, r.UserID).Error; err != nil {
			continue
		}
		users = append(users, u)
	}
	return users, nil
}

func (s *ReportService) GetRegisteredUsers() (int64, error) {
	var c int64
	err := s.db.Model(&model.User{}).Count(&c).Error
	return c, err
}

func (s *ReportService) GetClassroomUsageRate() (*model.RoomUsageSummaryDTO, error) {
	var total int64
	s.db.Model(&model.Room{}).Count(&total)
	now := time.Now()
	var occupied int64
	s.db.Raw(`
SELECT COUNT(DISTINCT room_id) FROM reservations
WHERE status IN (?, ?) AND start_time <= ? AND end_time > ?`,
		"approved", "occupied", now, now).Scan(&occupied)
	free := int64(total) - occupied
	if free < 0 {
		free = 0
	}
	var rate float64
	if total > 0 {
		rate = float64(occupied) / float64(total)
	}
	return &model.RoomUsageSummaryDTO{
		OccupiedCount: int(occupied),
		FreeCount:     int(free),
		OccupiedRate:  rate,
		FreeRate:      1 - rate,
	}, nil
}

func (s *ReportService) GetClassroomDistribution() ([]model.RoomTypeUsageDTO, error) {
	var types []model.RoomType
	if err := s.db.Find(&types).Error; err != nil {
		return nil, err
	}
	now := time.Now()
	out := make([]model.RoomTypeUsageDTO, 0, len(types))
	for _, rt := range types {
		var totalRooms int64
		s.db.Model(&model.Room{}).Where("room_type_id = ?", rt.ID).Count(&totalRooms)
		var occupied int64
		s.db.Raw(`
SELECT COUNT(DISTINCT reservations.room_id) FROM reservations
INNER JOIN rooms ON rooms.id = reservations.room_id
WHERE rooms.room_type_id = ? AND reservations.status IN (?, ?)
AND reservations.start_time <= ? AND reservations.end_time > ?`,
			rt.ID, "approved", "occupied", now, now).Scan(&occupied)
		free := totalRooms - occupied
		if free < 0 {
			free = 0
		}
		var rate float64
		if totalRooms > 0 {
			rate = float64(occupied) / float64(totalRooms)
		}
		out = append(out, model.RoomTypeUsageDTO{
			TypeName:      rt.TypeName,
			TotalRooms:    int(totalRooms),
			OccupiedCount: int(occupied),
			FreeCount:     int(free),
			OccupiedRate:  rate,
			FreeRate:      1 - rate,
		})
	}
	return out, nil
}

func (s *ReportService) GetReservationStatusDistribution() (map[string]int64, error) {
	type row struct {
		Status string
		Cnt    int64
	}
	var rows []row
	err := s.db.Model(&model.Reservation{}).
		Select("status, COUNT(*) as cnt").
		Group("status").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	m := map[string]int64{}
	for _, r := range rows {
		m[r.Status] = r.Cnt
	}
	return m, nil
}

// GetWeekly aggregates reservations by weekday (0=Sunday .. 6=Saturday).
func (s *ReportService) GetWeekly() ([]model.DayOfWeekCountVO, error) {
	since := time.Now().AddDate(0, 0, -56)
	var resvs []model.Reservation
	if err := s.db.Where("start_time >= ?", since).Find(&resvs).Error; err != nil {
		return nil, err
	}
	var counts [7]int64
	for i := range resvs {
		counts[int(resvs[i].StartTime.Weekday())]++
	}
	out := make([]model.DayOfWeekCountVO, 7)
	for d := 0; d < 7; d++ {
		out[d] = model.DayOfWeekCountVO{DayOfWeek: d, Count: int(counts[d])}
	}
	return out, nil
}

// GetTimeSlotReport buckets reservations into 2-hour windows by start hour.
func (s *ReportService) GetTimeSlotReport() ([]model.TimeSlotReport, error) {
	buckets := map[string]int{}
	var resvs []model.Reservation
	s.db.Where("start_time >= ?", time.Now().AddDate(0, -1, 0)).Find(&resvs)
	for i := range resvs {
		h := resvs[i].StartTime.Hour()
		slot := (h / 2) * 2
		label := time.Date(2000, 1, 1, slot, 0, 0, 0, time.Local).Format("15:04") + "-" +
			time.Date(2000, 1, 1, slot+2, 0, 0, 0, time.Local).Format("15:04")
		buckets[label]++
	}
	out := make([]model.TimeSlotReport, 0, len(buckets))
	for k, v := range buckets {
		out = append(out, model.TimeSlotReport{TimeSlot: k, ReservationCount: v})
	}
	return out, nil
}

func (s *ReportService) GetTotalPracticeHours() (float64, error) {
	var resvs []model.Reservation
	s.db.Where("status = ?", "completed").Find(&resvs)
	totalMin := 0.0
	for i := range resvs {
		r := &resvs[i]
		if r.SignStartTime != nil && r.SignEndTime != nil {
			totalMin += r.SignEndTime.Sub(*r.SignStartTime).Minutes()
		} else {
			totalMin += r.EndTime.Sub(r.StartTime).Minutes()
		}
	}
	return totalMin / 60.0, nil
}

// GetApprovalRate returns completed / (completed + cancelled) in the last 90 days.
func (s *ReportService) GetApprovalRate() (float64, error) {
	since := time.Now().AddDate(0, 0, -90)
	var completed, cancelled int64
	s.db.Model(&model.Reservation{}).Where("status = ? AND start_time >= ?", "completed", since).Count(&completed)
	s.db.Model(&model.Reservation{}).Where("status = ? AND start_time >= ?", "cancelled", since).Count(&cancelled)
	denom := completed + cancelled
	if denom == 0 {
		return 1.0, nil
	}
	return float64(completed) / float64(denom), nil
}

// GetPendingReservations counts future reservations not yet completed or cancelled (scheduled/approved pipeline).
func (s *ReportService) GetPendingReservations() (int64, error) {
	now := time.Now()
	var c int64
	err := s.db.Model(&model.Reservation{}).
		Where("status IN ? AND start_time > ?", []string{"approved", "occupied"}, now).
		Count(&c).Error
	return c, err
}

func (s *ReportService) GetTypeUsage() ([]model.TypeCountDTO, error) {
	type row struct {
		Name  string
		Count int64
	}
	var rows []row
	err := s.db.Model(&model.Reservation{}).
		Select("room_types.type_name as name, COUNT(*) as count").
		Joins("JOIN rooms ON rooms.id = reservations.room_id").
		Joins("LEFT JOIN room_types ON room_types.id = rooms.room_type_id").
		Group("room_types.type_name").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	out := make([]model.TypeCountDTO, 0, len(rows))
	for _, r := range rows {
		if r.Name == "" {
			r.Name = "unknown"
		}
		out = append(out, model.TypeCountDTO{TypeName: r.Name, Count: int(r.Count)})
	}
	return out, nil
}
