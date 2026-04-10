package service

import (
	"errors"

	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"gorm.io/gorm"
)

type AdminService struct {
	db *gorm.DB
}

func NewAdminService(db *gorm.DB) *AdminService {
	return &AdminService{db: db}
}

func (s *AdminService) ListAdmins(page, pageSize int) (*model.PageResult[model.User], error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	q := s.db.Model(&model.User{}).Where("user_type IN ?", []string{"admin", "super_admin"})
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}
	var rows []model.User
	offset := (page - 1) * pageSize
	if err := q.Order("id DESC").Offset(offset).Limit(pageSize).Find(&rows).Error; err != nil {
		return nil, err
	}
	return &model.PageResult[model.User]{Total: total, Rows: rows}, nil
}

func (s *AdminService) CreateAdmin(user *model.User) error {
	if user == nil || user.Username == "" {
		return errors.New("invalid user")
	}
	user.UserType = "admin"
	if user.Password != "" {
		user.Password = md5Hex(user.Password)
	}
	return s.db.Create(user).Error
}

func (s *AdminService) GetAdmin(id int64) (*model.User, error) {
	var u model.User
	if err := s.db.Where("id = ? AND user_type IN ?", id, []string{"admin", "super_admin"}).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *AdminService) UpdateAdmin(user *model.User) error {
	if user == nil || user.ID == 0 {
		return errors.New("invalid user")
	}
	updates := map[string]interface{}{
		"real_name":   user.RealName,
		"email":       user.Email,
		"phone":       user.Phone,
		"user_type":   user.UserType,
		"department_id": user.DepartmentID,
		"avatar_url":  user.AvatarURL,
	}
	if user.Password != "" {
		updates["password"] = md5Hex(user.Password)
	}
	return s.db.Model(&model.User{}).Where("id = ? AND user_type IN ?", user.ID, []string{"admin", "super_admin"}).Updates(updates).Error
}

func (s *AdminService) DeleteAdmin(id int64) error {
	return s.db.Where("id = ? AND user_type IN ?", id, []string{"admin", "super_admin"}).Delete(&model.User{}).Error
}

func (s *AdminService) UpdateAdminStatus(id int64, status int8) error {
	return s.db.Model(&model.User{}).
		Where("id = ? AND user_type IN ?", id, []string{"admin", "super_admin"}).
		Update("status", status).Error
}

func (s *AdminService) UpdateAdminInfo(user *model.User) error {
	if user == nil || user.ID == 0 {
		return errors.New("invalid user")
	}
	updates := map[string]interface{}{
		"real_name":     user.RealName,
		"email":         user.Email,
		"phone":         user.Phone,
		"avatar_url":    user.AvatarURL,
		"department_id": user.DepartmentID,
	}
	return s.db.Model(&model.User{}).Where("id = ? AND user_type IN ?", user.ID, []string{"admin", "super_admin"}).Updates(updates).Error
}
