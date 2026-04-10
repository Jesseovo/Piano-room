package model

import "time"

type SystemConfig struct {
	ID           int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	SystemName   string    `json:"systemName" gorm:"column:system_name;uniqueIndex;size:100;not null"`
	LogoURL      *string   `json:"logoUrl" gorm:"column:logo_url;size:255"`
	Description  *string   `json:"description" gorm:"type:json"`
	AdminEmail   *string   `json:"adminEmail" gorm:"column:admin_email;size:100"`
	ContactPhone *string   `json:"contactPhone" gorm:"column:contact_phone;size:20"`
	CreatedAt    time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

func (SystemConfig) TableName() string { return "system_config" }

type OperationLog struct {
	ID              int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	Username        string    `json:"username" gorm:"size:50;not null"`
	OperationModule *string   `json:"operationModule" gorm:"column:operation_module;size:100"`
	OperationType   *string   `json:"operationType" gorm:"column:operation_type;size:100"`
	OperationDesc   *string   `json:"operationDesc" gorm:"column:operation_desc;type:text"`
	RequestURL      *string   `json:"requestUrl" gorm:"column:request_url;size:255"`
	RequestMethod   *string   `json:"requestMethod" gorm:"column:request_method;size:10"`
	RequestIP       *string   `json:"requestIp" gorm:"column:request_ip;size:50"`
	RequestParam    *string   `json:"requestParam" gorm:"column:request_param;type:text"`
	ResponseResult  *string   `json:"responseResult" gorm:"column:response_result;type:text"`
	Status          *int8     `json:"status" gorm:"default:1"`
	ErrorMsg        *string   `json:"errorMsg" gorm:"column:error_msg;type:text"`
	CreatedAt       time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
}

func (OperationLog) TableName() string { return "operation_logs" }

type PenaltyRule struct {
	ID             int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	ViolationCount int       `json:"violationCount" gorm:"column:violation_count;uniqueIndex;not null"`
	BanDays        int       `json:"banDays" gorm:"column:ban_days;default:0;not null"`
	Description    *string   `json:"description" gorm:"size:200"`
	CreatedAt      time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt      time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

func (PenaltyRule) TableName() string { return "penalty_rules" }

type Department struct {
	ID        int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	Name      string    `json:"name" gorm:"size:100;not null"`
	Code      string    `json:"code" gorm:"size:50"`
	CreatedAt time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

func (Department) TableName() string { return "departments" }

type LogQueryDTO struct {
	Page            int    `form:"page,default=1"`
	PageSize        int    `form:"pageSize,default=10"`
	Username        string `form:"username"`
	OperationModule string `form:"operationModule"`
	OperationType   string `form:"operationType"`
	Status          *int   `form:"status"`
	StartTime       string `form:"startTime"`
	EndTime         string `form:"endTime"`
}

// Settings sub-structures (stored as JSON in system_config.description)

type BasicSetting struct {
	SystemName       string `json:"systemName"`
	Description      string `json:"description"`
	PrimaryColor     string `json:"primaryColor"`
	Logo             string `json:"logo"`
	Favicon          string `json:"favicon"`
	Email            string `json:"email"`
	Phone            string `json:"phone"`
	Copyright        string `json:"copyright"`
	SlotStartHour    int    `json:"slotStartHour"`
	SlotEndHour      int    `json:"slotEndHour"`
	SlotDurationMins int    `json:"slotDurationMinutes"`
	BookingResetHour int    `json:"bookingResetHour"`
}

type ReservationSetting struct {
	MaxAdvanceDays int `json:"maxAdvanceDays"`
	SignInGrace    int `json:"signInGrace"`
	MaxNoShow      int `json:"maxNoShow"`
}

type SecuritySetting struct {
	TokenExpireHours  int `json:"tokenExpireHours"`
	MinPasswordLength int `json:"minPasswordLength"`
}

// Pagination helper
type PageResult[T any] struct {
	Total int64 `json:"total"`
	Rows  []T   `json:"rows"`
}

// Booking overview for dashboard
type BookingOverview struct {
	BookedToday    int `json:"bookedToday"`
	AvailableToday int `json:"availableToday"`
}

// Report DTOs
type CountReservationsDTO struct {
	Range     string `form:"range,default=TODAY"`
	Start     string `form:"start"`
	End       string `form:"end"`
	Status    string `form:"status"`
	StartTime string `form:"startTime"`
	EndTime   string `form:"endTime"`
}

type RoomUsageSummaryDTO struct {
	OccupiedCount int     `json:"occupiedCount"`
	FreeCount     int     `json:"freeCount"`
	OccupiedRate  float64 `json:"occupiedRate"`
	FreeRate      float64 `json:"freeRate"`
}

type RoomTypeUsageDTO struct {
	TypeName      string  `json:"typeName"`
	TotalRooms    int     `json:"totalRooms"`
	OccupiedCount int     `json:"occupiedCount"`
	FreeCount     int     `json:"freeCount"`
	OccupiedRate  float64 `json:"occupiedRate"`
	FreeRate      float64 `json:"freeRate"`
}

type TypeCountDTO struct {
	TypeName string `json:"typeName"`
	Count    int    `json:"count"`
}
