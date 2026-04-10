package model

import "time"

type User struct {
	ID             int64      `json:"id" gorm:"primaryKey;autoIncrement"`
	Username       string     `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password       string     `json:"-" gorm:"size:255;not null"`
	RealName       string     `json:"realName" gorm:"column:real_name;size:50;not null"`
	StudentID      *string    `json:"studentId" gorm:"column:student_id;uniqueIndex;size:20"`
	Email          string     `json:"email" gorm:"size:100;not null"`
	Phone          *string    `json:"phone" gorm:"size:20"`
	Grade          *string    `json:"grade" gorm:"size:20"`
	Major          *string    `json:"major" gorm:"size:50"`
	UserType       string     `json:"userType" gorm:"column:user_type;type:enum('student','teacher','admin','super_admin');default:'student';not null"`
	DepartmentID   *int64     `json:"departmentId" gorm:"column:department_id"`
	AvatarURL      *string    `json:"avatarUrl" gorm:"column:avatar_url;size:255"`
	Status         int8       `json:"status" gorm:"default:1;not null"`
	ViolationCount int        `json:"violationCount" gorm:"column:violation_count;default:0;not null"`
	BanUntil       *time.Time `json:"banUntil" gorm:"column:ban_until"`
	LastLoginTime  *time.Time `json:"lastLoginTime" gorm:"column:last_login_time"`
	LastLoginIP    *string    `json:"lastLoginIp" gorm:"column:last_login_ip;size:50"`
	CreatedAt      time.Time  `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt      time.Time  `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

func (User) TableName() string { return "users" }

type UserInfoVO struct {
	ID             int64      `json:"id"`
	Username       string     `json:"username"`
	RealName       string     `json:"realName"`
	StudentID      *string    `json:"studentId"`
	Email          string     `json:"email"`
	Phone          *string    `json:"phone"`
	Grade          *string    `json:"grade"`
	Major          *string    `json:"major"`
	UserType       string     `json:"userType"`
	DepartmentID   *int64     `json:"departmentId"`
	AvatarURL      *string    `json:"avatarUrl"`
	Status         int8       `json:"status"`
	ViolationCount int        `json:"violationCount"`
	BanUntil       *time.Time `json:"banUntil"`
	LastLoginTime  *time.Time `json:"lastLoginTime"`
	CreatedAt      time.Time  `json:"createdAt"`
}

type UserLoginDTO struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Captcha  string `json:"captcha"`
}

type RegisterDTO struct {
	Username    string `json:"username" binding:"required"`
	StudentID   string `json:"studentId"`
	Password    string `json:"password" binding:"required,min=6"`
	RealName    string `json:"realName" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	EmailCode   string `json:"emailCode"`
	CaptchaCode string `json:"captchaCode"`
	DeptID      *int64 `json:"deptId"`
}

type UserQueryDTO struct {
	UserType                     string `form:"userType"`
	Status                       *int   `form:"status"`
	UsernameOrRealNameOrStudentId string `form:"usernameOrRealNameOrStudentId"`
	Page                         int    `form:"page,default=1"`
	PageSize                     int    `form:"pageSize,default=10"`
}

type UserStatusDTO struct {
	UserID int64 `json:"userId" binding:"required"`
	Status int   `json:"status" binding:"required"`
}

type ResetPasswordDTO struct {
	ID          int64  `json:"id"`
	OldPassword string `json:"oldPassword" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6"`
	AgainPassword string `json:"againPassword" binding:"required"`
}

type UserReservationStatsVO struct {
	TotalReservations     int `json:"totalReservations"`
	CompletedReservations int `json:"completedReservations"`
	CancelledReservations int `json:"cancelledReservations"`
	ViolationCount        int `json:"violationCount"`
	TotalPracticeMinutes  int `json:"totalPracticeMinutes"`
}
