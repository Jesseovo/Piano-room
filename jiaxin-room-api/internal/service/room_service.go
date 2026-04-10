package service

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/csv"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jiaxin-room/jiaxin-room-api/internal/cache"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"gorm.io/gorm"
)

type RoomService struct {
	db *gorm.DB
}

func NewRoomService(db *gorm.DB) *RoomService {
	return &RoomService{db: db}
}

const roomListTTL = 2 * time.Minute
const roomHotTTL = 5 * time.Minute

func roomQueryKey(q model.RoomQueryDTO) string {
	b, _ := json.Marshal(q)
	h := sha256.Sum256(b)
	return cache.PrefixRoomList + ":" + hex.EncodeToString(h[:])
}

func (s *RoomService) invalidateRoomCaches() {
	ctx := context.Background()
	_ = cache.DelPattern(ctx, cache.PrefixRoomList+"*")
	_ = cache.DelPattern(ctx, cache.PrefixRoomHot+"*")
}

// ListRooms returns paginated rooms with optional Redis cache.
func (s *RoomService) ListRooms(query model.RoomQueryDTO) (*model.PageResult[model.Room], error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.PageSize < 1 {
		query.PageSize = 10
	}
	key := roomQueryKey(query)
	ctx := context.Background()
	var cached model.PageResult[model.Room]
	if cache.Available() {
		if err := cache.Get(ctx, key, &cached); err == nil {
			return &cached, nil
		}
	}

	q := s.db.Model(&model.Room{}).Preload("RoomType")
	if query.ID != nil {
		q = q.Where("id = ?", *query.ID)
	}
	if query.Status != nil {
		q = q.Where("status = ?", int8(*query.Status))
	}
	if query.RoomTypeID != nil {
		q = q.Where("room_type_id = ?", *query.RoomTypeID)
	}
	if query.RoomNumberOrName != "" {
		kw := "%" + query.RoomNumberOrName + "%"
		q = q.Where("room_number LIKE ? OR name LIKE ?", kw, kw)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}
	var rooms []model.Room
	offset := (query.Page - 1) * query.PageSize
	if err := q.Order("id DESC").Offset(offset).Limit(query.PageSize).Find(&rooms).Error; err != nil {
		return nil, err
	}
	out := &model.PageResult[model.Room]{Total: total, Rows: rooms}
	if cache.Available() {
		_ = cache.Set(ctx, key, out, roomListTTL)
	}
	return out, nil
}

func (s *RoomService) GetRoom(id int64) (*model.Room, error) {
	var r model.Room
	if err := s.db.Preload("RoomType").First(&r, id).Error; err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *RoomService) CreateRoom(room *model.Room) error {
	if room == nil {
		return errors.New("nil room")
	}
	err := s.db.Create(room).Error
	if err == nil {
		s.invalidateRoomCaches()
	}
	return err
}

func (s *RoomService) UpdateRoom(room *model.Room) error {
	if room == nil || room.ID == 0 {
		return errors.New("invalid room")
	}
	err := s.db.Model(&model.Room{}).Where("id = ?", room.ID).Updates(room).Error
	if err == nil {
		s.invalidateRoomCaches()
	}
	return err
}

func (s *RoomService) DeleteRoom(id int64) error {
	err := s.db.Delete(&model.Room{}, id).Error
	if err == nil {
		s.invalidateRoomCaches()
	}
	return err
}

func (s *RoomService) UpdateRoomStatus(id int64, status int8) error {
	err := s.db.Model(&model.Room{}).Where("id = ?", id).Update("status", status).Error
	if err == nil {
		s.invalidateRoomCaches()
	}
	return err
}

// GetHotToday returns rooms with most reservations today (cached in Redis).
func (s *RoomService) GetHotToday(limit int) ([]model.HotRoomVO, error) {
	if limit <= 0 {
		limit = 10
	}
	key := fmt.Sprintf("%s:%d", cache.PrefixRoomHot, limit)
	ctx := context.Background()
	var cached []model.HotRoomVO
	if cache.Available() {
		if err := cache.Get(ctx, key, &cached); err == nil {
			return cached, nil
		}
	}

	start := time.Now().Truncate(24 * time.Hour)
	end := start.Add(24 * time.Hour)

	type row struct {
		RoomID int64
		Cnt    int64
	}
	var rows []row
	err := s.db.Model(&model.Reservation{}).
		Select("room_id, COUNT(*) as cnt").
		Where("start_time >= ? AND start_time < ? AND status <> ?", start, end, "cancelled").
		Group("room_id").
		Order("cnt DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make([]model.HotRoomVO, 0, len(rows))
	for _, r := range rows {
		var room model.Room
		if err := s.db.First(&room, r.RoomID).Error; err != nil {
			continue
		}
		out = append(out, model.HotRoomVO{
			RoomID:           r.RoomID,
			RoomName:         room.Name,
			BuildingName:     "",
			ReservationCount: int(r.Cnt),
		})
	}
	if cache.Available() {
		_ = cache.Set(ctx, key, out, roomHotTTL)
	}
	return out, nil
}

// SearchRooms searches by keyword in number or name (simple LIKE).
func (s *RoomService) SearchRooms(keyword string) ([]model.Room, error) {
	if keyword == "" {
		return nil, nil
	}
	kw := "%" + keyword + "%"
	var rooms []model.Room
	err := s.db.Preload("RoomType").
		Where("room_number LIKE ? OR name LIKE ?", kw, kw).
		Order("id DESC").
		Limit(50).
		Find(&rooms).Error
	return rooms, err
}

// ExportRooms returns CSV bytes of all rooms (no cache).
func (s *RoomService) ExportRooms() ([]byte, error) {
	var rooms []model.Room
	if err := s.db.Preload("RoomType").Order("id").Find(&rooms).Error; err != nil {
		return nil, err
	}
	buf := &bytes.Buffer{}
	w := csv.NewWriter(buf)
	_ = w.Write([]string{"id", "room_number", "name", "floor", "capacity", "status", "room_type"})
	for _, r := range rooms {
		rt := ""
		if r.RoomType != nil {
			rt = r.RoomType.TypeName
		}
		fl := ""
		if r.Floor != nil {
			fl = fmt.Sprintf("%d", *r.Floor)
		}
		_ = w.Write([]string{
			fmt.Sprintf("%d", r.ID),
			r.RoomNumber,
			r.Name,
			fl,
			fmt.Sprintf("%d", r.Capacity),
			fmt.Sprintf("%d", r.Status),
			rt,
		})
	}
	w.Flush()
	return buf.Bytes(), w.Error()
}
