package service

import (
	"errors"

	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"gorm.io/gorm"
)

// ClassTypeService manages room types (class types).
type ClassTypeService struct {
	db *gorm.DB
}

func NewClassTypeService(db *gorm.DB) *ClassTypeService {
	return &ClassTypeService{db: db}
}

func (s *ClassTypeService) ListAll() ([]model.RoomType, error) {
	var list []model.RoomType
	err := s.db.Order("id").Find(&list).Error
	return list, err
}

func (s *ClassTypeService) Create(rt *model.RoomType) error {
	if rt == nil || rt.TypeName == "" {
		return errors.New("invalid room type")
	}
	return s.db.Create(rt).Error
}

func (s *ClassTypeService) Update(rt *model.RoomType) error {
	if rt == nil || rt.ID == 0 {
		return errors.New("invalid room type")
	}
	return s.db.Model(&model.RoomType{}).Where("id = ?", rt.ID).Updates(map[string]interface{}{
		"type_name":   rt.TypeName,
		"description": rt.Description,
	}).Error
}

func (s *ClassTypeService) Delete(id int64) error {
	return s.db.Delete(&model.RoomType{}, id).Error
}

func (s *ClassTypeService) Page(page, pageSize int) (*model.PageResult[model.RoomType], error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	var total int64
	if err := s.db.Model(&model.RoomType{}).Count(&total).Error; err != nil {
		return nil, err
	}
	var rows []model.RoomType
	offset := (page - 1) * pageSize
	err := s.db.Order("id DESC").Offset(offset).Limit(pageSize).Find(&rows).Error
	if err != nil {
		return nil, err
	}
	return &model.PageResult[model.RoomType]{Total: total, Rows: rows}, nil
}

func (s *ClassTypeService) GetByID(id int64) (*model.RoomType, error) {
	var rt model.RoomType
	if err := s.db.First(&rt, id).Error; err != nil {
		return nil, err
	}
	return &rt, nil
}
