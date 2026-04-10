package service

import (
	"errors"

	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"gorm.io/gorm"
)

type MaintenanceService struct {
	db *gorm.DB
}

func NewMaintenanceService(db *gorm.DB) *MaintenanceService {
	return &MaintenanceService{db: db}
}

func (s *MaintenanceService) List(query model.MaintenanceQueryDTO) (*model.PageResult[model.RoomMaintenance], error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.PageSize < 1 {
		query.PageSize = 10
	}
	q := s.db.Model(&model.RoomMaintenance{}).Preload("Room")
	if query.RoomID != nil {
		q = q.Where("room_id = ?", *query.RoomID)
	}
	if query.Status != "" {
		q = q.Where("status = ?", query.Status)
	}
	if query.MaintenanceType != "" {
		q = q.Where("maintenance_type = ?", query.MaintenanceType)
	}
	if query.StartTime != "" {
		q = q.Where("start_time >= ?", query.StartTime)
	}
	if query.EndTime != "" {
		q = q.Where("end_time <= ?", query.EndTime)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}
	var rows []model.RoomMaintenance
	offset := (query.Page - 1) * query.PageSize
	if err := q.Order("id DESC").Offset(offset).Limit(query.PageSize).Find(&rows).Error; err != nil {
		return nil, err
	}
	return &model.PageResult[model.RoomMaintenance]{Total: total, Rows: rows}, nil
}

func (s *MaintenanceService) BatchDelete(ids []int64) error {
	if len(ids) == 0 {
		return errors.New("no ids")
	}
	return s.db.Where("id IN ?", ids).Delete(&model.RoomMaintenance{}).Error
}

func (s *MaintenanceService) UpdateStatus(id int64, status string) error {
	return s.db.Model(&model.RoomMaintenance{}).Where("id = ?", id).Update("status", status).Error
}
