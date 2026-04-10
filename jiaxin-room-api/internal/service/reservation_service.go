package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jiaxin-room/jiaxin-room-api/internal/cache"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"gorm.io/gorm"
)

type ReservationService struct {
	db *gorm.DB
}

func NewReservationService(db *gorm.DB) *ReservationService {
	return &ReservationService{db: db}
}

func reservationLockKey(roomID int64, start time.Time) string {
	return fmt.Sprintf("resv:%d:%d", roomID, start.Unix())
}

func (s *ReservationService) hasOverlap(roomID int64, start, end time.Time, excludeID int64) (bool, error) {
	q := s.db.Model(&model.Reservation{}).
		Where("room_id = ? AND status <> ?", roomID, "cancelled").
		Where("start_time < ? AND end_time > ?", end, start)
	if excludeID > 0 {
		q = q.Where("id <> ?", excludeID)
	}
	var c int64
	if err := q.Count(&c).Error; err != nil {
		return false, err
	}
	return c > 0, nil
}

// Create creates a reservation using a Redis distributed lock on room+start.
func (s *ReservationService) Create(dto model.ReservationDTO, userId int64) (*model.Reservation, error) {
	if dto.EndTime.Before(dto.StartTime) || dto.EndTime.Equal(dto.StartTime) {
		return nil, errors.New("invalid time range")
	}
	ctx := context.Background()
	lockKey := reservationLockKey(dto.RoomID, dto.StartTime)
	ok, err := cache.AcquireLock(ctx, lockKey, 15*time.Second)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, errors.New("could not acquire lock, try again")
	}
	defer func() { _ = cache.ReleaseLock(ctx, lockKey) }()

	if overlap, err := s.hasOverlap(dto.RoomID, dto.StartTime, dto.EndTime, 0); err != nil {
		return nil, err
	} else if overlap {
		return nil, errors.New("time slot conflict")
	}

	r := model.Reservation{
		UserID:    userId,
		RoomID:    dto.RoomID,
		Title:     dto.Title,
		Purpose:   dto.Purpose,
		StartTime: dto.StartTime,
		EndTime:   dto.EndTime,
		Attendees: dto.Attendees,
		Status:    "approved",
	}
	if r.Attendees <= 0 {
		r.Attendees = 1
	}
	if dto.Remarks != "" {
		r.Remarks = &dto.Remarks
	}
	if err := s.db.Create(&r).Error; err != nil {
		return nil, err
	}
	return &r, nil
}

// QuickCreate creates a reservation with default title/purpose.
func (s *ReservationService) QuickCreate(dto model.QuickReservationDTO, userId int64) (*model.Reservation, error) {
	full := model.ReservationDTO{
		RoomID:    dto.RoomID,
		Title:     "Quick booking",
		Purpose:   "Practice",
		StartTime: dto.StartTime,
		EndTime:   dto.EndTime,
		Attendees: dto.Attendees,
		Remarks:   dto.Remarks,
	}
	return s.Create(full, userId)
}

func (s *ReservationService) Cancel(id int64, reason model.CancelReason) error {
	updates := map[string]interface{}{
		"status": "cancelled",
	}
	if reason.Remarks != "" {
		updates["remarks"] = reason.Remarks
	}
	return s.db.Model(&model.Reservation{}).Where("id = ?", id).Updates(updates).Error
}

func (s *ReservationService) GetByID(id int64) (*model.Reservation, error) {
	var r model.Reservation
	if err := s.db.Preload("User").Preload("Room").First(&r, id).Error; err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *ReservationService) List(query model.ReservationQueryDTO) (*model.PageResult[model.Reservation], error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.PageSize < 1 {
		query.PageSize = 10
	}
	q := s.db.Model(&model.Reservation{}).Preload("User").Preload("Room")
	if query.UserID != nil {
		q = q.Where("user_id = ?", *query.UserID)
	}
	if query.RoomID != nil {
		q = q.Where("room_id = ?", *query.RoomID)
	}
	if query.Status != "" {
		q = q.Where("status = ?", query.Status)
	}
	if query.StartDate != "" {
		if t, err := time.ParseInLocation("2006-01-02", query.StartDate, time.Local); err == nil {
			q = q.Where("start_time >= ?", t)
		}
	}
	if query.EndDate != "" {
		if t, err := time.ParseInLocation("2006-01-02", query.EndDate, time.Local); err == nil {
			q = q.Where("end_time < ?", t.Add(24*time.Hour))
		}
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}
	var rows []model.Reservation
	offset := (query.Page - 1) * query.PageSize
	if err := q.Order("start_time DESC").Offset(offset).Limit(query.PageSize).Find(&rows).Error; err != nil {
		return nil, err
	}
	return &model.PageResult[model.Reservation]{Total: total, Rows: rows}, nil
}

// GetAvailability returns coarse hourly slots for a room on a given calendar date (local server TZ).
func (s *ReservationService) GetAvailability(roomId int64, date string) ([]model.TimeSlot, error) {
	day, err := time.ParseInLocation("2006-01-02", date, time.Local)
	if err != nil {
		return nil, err
	}
	var blocked []model.Reservation
	s.db.Where("room_id = ? AND status <> ?", roomId, "cancelled").
		Where("start_time < ? AND end_time > ?", day.Add(24*time.Hour), day).
		Find(&blocked)

	slots := make([]model.TimeSlot, 0, 24)
	for h := 0; h < 24; h++ {
		st := day.Add(time.Duration(h) * time.Hour)
		et := st.Add(time.Hour)
		conflict := ""
		for i := range blocked {
			b := &blocked[i]
			if b.StartTime.Before(et) && b.EndTime.After(st) {
				conflict = "reserved"
				break
			}
		}
		slots = append(slots, model.TimeSlot{
			StartTime:      st,
			EndTime:        et,
			Available:      conflict == "",
			ConflictReason: conflict,
		})
	}
	return slots, nil
}

func (s *ReservationService) SignIn(id int64) error {
	now := time.Now()
	return s.db.Model(&model.Reservation{}).Where("id = ?", id).Updates(map[string]interface{}{
		"sign_start_time": &now,
	}).Error
}

func (s *ReservationService) SignOut(id int64) error {
	now := time.Now()
	return s.db.Model(&model.Reservation{}).Where("id = ?", id).Updates(map[string]interface{}{
		"sign_end_time": &now,
	}).Error
}

// GetUserStatistics returns aggregate counts for a user's reservations.
func (s *ReservationService) GetUserStatistics(userId int64) (map[string]int64, error) {
	out := map[string]int64{}
	var total, completed, cancelled int64
	s.db.Model(&model.Reservation{}).Where("user_id = ?", userId).Count(&total)
	s.db.Model(&model.Reservation{}).Where("user_id = ? AND status = ?", userId, "completed").Count(&completed)
	s.db.Model(&model.Reservation{}).Where("user_id = ? AND status = ?", userId, "cancelled").Count(&cancelled)
	out["total"] = total
	out["completed"] = completed
	out["cancelled"] = cancelled
	return out, nil
}

// ListPracticeDuration lists completed sessions with computed practice minutes.
func (s *ReservationService) ListPracticeDuration(userId int64, query model.ReservationQueryDTO) (*model.PageResult[model.PracticeDurationVO], error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.PageSize < 1 {
		query.PageSize = 10
	}
	q := s.db.Model(&model.Reservation{}).Preload("Room").
		Where("user_id = ? AND status = ?", userId, "completed")
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}
	var resvs []model.Reservation
	offset := (query.Page - 1) * query.PageSize
	if err := q.Order("start_time DESC").Offset(offset).Limit(query.PageSize).Find(&resvs).Error; err != nil {
		return nil, err
	}
	rows := make([]model.PracticeDurationVO, 0, len(resvs))
	for i := range resvs {
		r := &resvs[i]
		name := ""
		if r.Room != nil {
			name = r.Room.Name
		}
		mins := 0
		if r.SignStartTime != nil && r.SignEndTime != nil {
			mins = int(r.SignEndTime.Sub(*r.SignStartTime).Minutes())
		} else {
			mins = int(r.EndTime.Sub(r.StartTime).Minutes())
		}
		if mins < 0 {
			mins = 0
		}
		rows = append(rows, model.PracticeDurationVO{
			ReservationID:    r.ID,
			RoomName:         name,
			StartTime:        r.StartTime,
			EndTime:          r.EndTime,
			SignStartTime:    r.SignStartTime,
			SignEndTime:      r.SignEndTime,
			PracticeDuration: mins,
		})
	}
	return &model.PageResult[model.PracticeDurationVO]{Total: total, Rows: rows}, nil
}

// GetAvailableByTypeAndTime finds rooms of a type free for the given interval.
func (s *ReservationService) Update(id int64, dto model.ReservationDTO) (*model.Reservation, error) {
	if dto.EndTime.Before(dto.StartTime) || dto.EndTime.Equal(dto.StartTime) {
		return nil, errors.New("invalid time range")
	}
	var existing model.Reservation
	if err := s.db.First(&existing, id).Error; err != nil {
		return nil, err
	}
	if existing.Status == "cancelled" {
		return nil, errors.New("cannot update cancelled reservation")
	}
	ctx := context.Background()
	lockKey := reservationLockKey(dto.RoomID, dto.StartTime)
	ok, err := cache.AcquireLock(ctx, lockKey, 15*time.Second)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, errors.New("could not acquire lock, try again")
	}
	defer func() { _ = cache.ReleaseLock(ctx, lockKey) }()

	if overlap, err := s.hasOverlap(dto.RoomID, dto.StartTime, dto.EndTime, id); err != nil {
		return nil, err
	} else if overlap {
		return nil, errors.New("time slot conflict")
	}

	att := dto.Attendees
	if att <= 0 {
		att = 1
	}
	updates := map[string]interface{}{
		"room_id":    dto.RoomID,
		"title":      dto.Title,
		"purpose":    dto.Purpose,
		"start_time": dto.StartTime,
		"end_time":   dto.EndTime,
		"attendees":  att,
	}
	if dto.Remarks != "" {
		updates["remarks"] = dto.Remarks
	}
	if err := s.db.Model(&model.Reservation{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return nil, err
	}
	return s.GetByID(id)
}

func (s *ReservationService) GetAvailableByTypeAndTime(qo model.AvailableRoomQO) ([]model.Room, error) {
	if qo.EndTime.Before(qo.StartTime) || qo.EndTime.Equal(qo.StartTime) {
		return nil, errors.New("invalid time range")
	}
	q := s.db.Model(&model.Room{}).Where("status = ?", int8(1))
	if qo.RoomTypeID != nil {
		q = q.Where("room_type_id = ?", *qo.RoomTypeID)
	}
	var rooms []model.Room
	if err := q.Find(&rooms).Error; err != nil {
		return nil, err
	}
	available := make([]model.Room, 0)
	for i := range rooms {
		overlap, err := s.hasOverlap(rooms[i].ID, qo.StartTime, qo.EndTime, 0)
		if err != nil {
			return nil, err
		}
		if !overlap {
			available = append(available, rooms[i])
		}
	}
	return available, nil
}
