package service

import (
	"errors"

	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"gorm.io/gorm"
)

type DeptService struct {
	db *gorm.DB
}

func NewDeptService(db *gorm.DB) *DeptService {
	return &DeptService{db: db}
}

func (s *DeptService) List() ([]model.Department, error) {
	var list []model.Department
	err := s.db.Order("id").Find(&list).Error
	return list, err
}

func (s *DeptService) Create(dept *model.Department) error {
	if dept == nil || dept.Name == "" {
		return errors.New("invalid department")
	}
	return s.db.Create(dept).Error
}

func (s *DeptService) GetByID(id int64) (*model.Department, error) {
	var d model.Department
	if err := s.db.First(&d, id).Error; err != nil {
		return nil, err
	}
	return &d, nil
}

func (s *DeptService) Update(dept *model.Department) error {
	if dept == nil || dept.ID == 0 {
		return errors.New("invalid department")
	}
	return s.db.Model(&model.Department{}).Where("id = ?", dept.ID).Updates(map[string]interface{}{
		"name": dept.Name,
		"code": dept.Code,
	}).Error
}

func (s *DeptService) Delete(id int64) error {
	return s.db.Delete(&model.Department{}, id).Error
}
