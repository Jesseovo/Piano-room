package service

import (
	"crypto/md5"
	"encoding/hex"
	"errors"
	"time"

	"github.com/jiaxin-room/jiaxin-room-api/internal/config"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	jwtpkg "github.com/jiaxin-room/jiaxin-room-api/pkg/jwt"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

func md5Hex(s string) string {
	h := md5.Sum([]byte(s))
	return hex.EncodeToString(h[:])
}

// LoginResult is returned on successful login (JWT + public user info).
type LoginResult struct {
	Token string            `json:"token"`
	User  model.UserInfoVO `json:"user"`
}

func (s *UserService) Login(dto model.UserLoginDTO) (*LoginResult, error) {
	var u model.User
	if err := s.db.Where("username = ?", dto.Username).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid username or password")
		}
		return nil, err
	}
	if u.Password != md5Hex(dto.Password) {
		return nil, errors.New("invalid username or password")
	}
	if u.BanUntil != nil && u.BanUntil.After(time.Now()) {
		return nil, errors.New("account banned")
	}
	if u.Status != 1 {
		return nil, errors.New("account disabled")
	}
	now := time.Now()
	ip := ""
	_ = s.db.Model(&model.User{}).Where("id = ?", u.ID).Updates(map[string]interface{}{
		"last_login_time": &now,
		"last_login_ip":   &ip,
	}).Error

	cfg := config.AppConfig.JWT
	token, err := jwtpkg.GenerateToken(u.ID, u.Username, u.UserType, cfg.Secret, cfg.ExpireHours)
	if err != nil {
		return nil, err
	}
	return &LoginResult{Token: token, User: userToVO(&u)}, nil
}

func (s *UserService) Register(dto model.RegisterDTO) (*model.User, error) {
	var n int64
	s.db.Model(&model.User{}).Where("username = ?", dto.Username).Count(&n)
	if n > 0 {
		return nil, errors.New("username already exists")
	}
	if dto.StudentID != "" {
		s.db.Model(&model.User{}).Where("student_id = ?", dto.StudentID).Count(&n)
		if n > 0 {
			return nil, errors.New("student id already registered")
		}
	}
	u := model.User{
		Username:     dto.Username,
		Password:     md5Hex(dto.Password),
		RealName:     dto.RealName,
		Email:        dto.Email,
		UserType:     "student",
		Status:       1,
		ViolationCount: 0,
	}
	if dto.StudentID != "" {
		u.StudentID = &dto.StudentID
	}
	if dto.DeptID != nil {
		u.DepartmentID = dto.DeptID
	}
	if err := s.db.Create(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func userToVO(u *model.User) model.UserInfoVO {
	return model.UserInfoVO{
		ID:             u.ID,
		Username:       u.Username,
		RealName:       u.RealName,
		StudentID:      u.StudentID,
		Email:          u.Email,
		Phone:          u.Phone,
		Grade:          u.Grade,
		Major:          u.Major,
		UserType:       u.UserType,
		DepartmentID:   u.DepartmentID,
		AvatarURL:      u.AvatarURL,
		Status:         u.Status,
		ViolationCount: u.ViolationCount,
		BanUntil:       u.BanUntil,
		LastLoginTime:  u.LastLoginTime,
		CreatedAt:      u.CreatedAt,
	}
}

func (s *UserService) GetUserInfo(id int64) (*model.UserInfoVO, error) {
	var u model.User
	if err := s.db.First(&u, id).Error; err != nil {
		return nil, err
	}
	vo := userToVO(&u)
	return &vo, nil
}

func (s *UserService) ListUsers(query model.UserQueryDTO) (*model.PageResult[model.UserInfoVO], error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.PageSize < 1 {
		query.PageSize = 10
	}
	q := s.db.Model(&model.User{})
	if query.UserType != "" {
		q = q.Where("user_type = ?", query.UserType)
	}
	if query.Status != nil {
		q = q.Where("status = ?", *query.Status)
	}
	if query.UsernameOrRealNameOrStudentId != "" {
		kw := "%" + query.UsernameOrRealNameOrStudentId + "%"
		q = q.Where("username LIKE ? OR real_name LIKE ? OR student_id LIKE ?", kw, kw, kw)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}
	var users []model.User
	offset := (query.Page - 1) * query.PageSize
	if err := q.Order("id DESC").Offset(offset).Limit(query.PageSize).Find(&users).Error; err != nil {
		return nil, err
	}
	rows := make([]model.UserInfoVO, 0, len(users))
	for i := range users {
		rows = append(rows, userToVO(&users[i]))
	}
	return &model.PageResult[model.UserInfoVO]{Total: total, Rows: rows}, nil
}

func (s *UserService) UpdateUserInfo(user *model.User) error {
	if user == nil || user.ID == 0 {
		return errors.New("invalid user")
	}
	updates := map[string]interface{}{
		"real_name":     user.RealName,
		"email":         user.Email,
		"phone":         user.Phone,
		"grade":         user.Grade,
		"major":         user.Major,
		"avatar_url":    user.AvatarURL,
		"department_id": user.DepartmentID,
	}
	if user.Password != "" {
		updates["password"] = md5Hex(user.Password)
	}
	return s.db.Model(&model.User{}).Where("id = ?", user.ID).Updates(updates).Error
}

func (s *UserService) ResetPassword(dto model.ResetPasswordDTO) error {
	if dto.NewPassword != dto.AgainPassword {
		return errors.New("passwords do not match")
	}
	var u model.User
	if err := s.db.First(&u, dto.ID).Error; err != nil {
		return err
	}
	if u.Password != md5Hex(dto.OldPassword) {
		return errors.New("old password incorrect")
	}
	return s.db.Model(&model.User{}).Where("id = ?", dto.ID).Update("password", md5Hex(dto.NewPassword)).Error
}

func (s *UserService) UpdateStatus(dto model.UserStatusDTO) error {
	return s.db.Model(&model.User{}).Where("id = ?", dto.UserID).Update("status", int8(dto.Status)).Error
}

func (s *UserService) DeleteUsers(ids []int64) error {
	if len(ids) == 0 {
		return nil
	}
	return s.db.Where("id IN ?", ids).Delete(&model.User{}).Error
}

func (s *UserService) GetReservationStats(userId int64) (*model.UserReservationStatsVO, error) {
	var vo model.UserReservationStatsVO
	var c1, c2, c3 int64
	if err := s.db.Model(&model.Reservation{}).Where("user_id = ?", userId).Count(&c1).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&model.Reservation{}).Where("user_id = ? AND status = ?", userId, "completed").Count(&c2).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&model.Reservation{}).Where("user_id = ? AND status = ?", userId, "cancelled").Count(&c3).Error; err != nil {
		return nil, err
	}
	vo.TotalReservations = int(c1)
	vo.CompletedReservations = int(c2)
	vo.CancelledReservations = int(c3)

	var u model.User
	if err := s.db.First(&u, userId).Error; err == nil {
		vo.ViolationCount = u.ViolationCount
	}

	var rows []model.Reservation
	if err := s.db.Where("user_id = ? AND status = ?", userId, "completed").Find(&rows).Error; err != nil {
		return nil, err
	}
	minutes := 0
	for i := range rows {
		r := &rows[i]
		if r.SignStartTime != nil && r.SignEndTime != nil {
			d := r.SignEndTime.Sub(*r.SignStartTime).Minutes()
			if d > 0 {
				minutes += int(d)
			}
		} else {
			d := r.EndTime.Sub(r.StartTime).Minutes()
			if d > 0 {
				minutes += int(d)
			}
		}
	}
	vo.TotalPracticeMinutes = minutes
	return &vo, nil
}

func (s *UserService) ResetPasswordByEmail(email, code, newPassword string) error {
	// TODO: validate email code via Redis / cache in production
	_ = code
	var u model.User
	if err := s.db.Where("email = ?", email).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("邮箱未注册")
		}
		return err
	}
	return s.db.Model(&model.User{}).Where("id = ?", u.ID).Update("password", md5Hex(newPassword)).Error
}

func (s *UserService) AddUser(user *model.User) error {
	if user == nil || user.Username == "" {
		return errors.New("invalid user")
	}
	var n int64
	s.db.Model(&model.User{}).Where("username = ?", user.Username).Count(&n)
	if n > 0 {
		return errors.New("username already exists")
	}
	if user.Password != "" {
		user.Password = md5Hex(user.Password)
	}
	if user.UserType == "" {
		user.UserType = "student"
	}
	return s.db.Create(user).Error
}
