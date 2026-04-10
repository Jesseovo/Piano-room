package model

import "time"

type Reservation struct {
	ID            int64      `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID        int64      `json:"userId" gorm:"column:user_id;not null;index"`
	RoomID        int64      `json:"roomId" gorm:"column:room_id;not null;index"`
	Title         string     `json:"title" gorm:"size:200;not null"`
	Purpose       string     `json:"purpose" gorm:"type:text;not null"`
	StartTime     time.Time  `json:"startTime" gorm:"column:start_time;not null;index"`
	EndTime       time.Time  `json:"endTime" gorm:"column:end_time;not null"`
	Attendees     int        `json:"attendees" gorm:"default:1;not null"`
	Status        string     `json:"status" gorm:"type:enum('approved','cancelled','completed','occupied');default:'approved';not null;index"`
	SignStartTime *time.Time `json:"signStartTime" gorm:"column:sign_start_time"`
	SignEndTime   *time.Time `json:"signEndTime" gorm:"column:sign_end_time"`
	Remarks       *string    `json:"remarks" gorm:"type:text"`
	ReviewerID    *int64     `json:"reviewerId" gorm:"column:reviewer_id"`
	ReviewTime    *time.Time `json:"reviewTime" gorm:"column:review_time"`
	ReviewRemarks *string    `json:"reviewRemarks" gorm:"column:review_remarks;type:text"`
	CreatedAt     time.Time  `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt     time.Time  `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`

	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Room *Room `json:"room,omitempty" gorm:"foreignKey:RoomID"`
}

func (Reservation) TableName() string { return "reservations" }

type ReservationDTO struct {
	RoomID    int64     `json:"roomId" binding:"required"`
	Title     string    `json:"title" binding:"required"`
	Purpose   string    `json:"purpose" binding:"required"`
	StartTime time.Time `json:"startTime" binding:"required"`
	EndTime   time.Time `json:"endTime" binding:"required"`
	Attendees int       `json:"attendees,default=1"`
	Remarks   string    `json:"remarks"`
	UserID    int64     `json:"userId"`
}

type QuickReservationDTO struct {
	RoomID    int64     `json:"roomId" binding:"required"`
	StartTime time.Time `json:"startTime" binding:"required"`
	EndTime   time.Time `json:"endTime" binding:"required"`
	Remarks   string    `json:"remarks"`
	Attendees int       `json:"attendees,default=1"`
}

type ReservationQueryDTO struct {
	UserID    *int64 `form:"userId"`
	RoomID    *int64 `form:"roomId"`
	Status    string `form:"status"`
	StartDate string `form:"startDate"`
	EndDate   string `form:"endDate"`
	Page      int    `form:"page,default=1"`
	PageSize  int    `form:"pageSize,default=10"`
}

type CancelReason struct {
	Remarks string `json:"remarks"`
}

type TimeSlot struct {
	StartTime      time.Time `json:"startTime"`
	EndTime        time.Time `json:"endTime"`
	Available      bool      `json:"available"`
	ConflictReason string    `json:"conflictReason,omitempty"`
}

type AvailableRoomQO struct {
	RoomTypeID *int64    `json:"roomTypeId"`
	StartTime  time.Time `json:"startTime" binding:"required"`
	EndTime    time.Time `json:"endTime" binding:"required"`
}

type PracticeDurationVO struct {
	ReservationID    int64     `json:"reservationId"`
	RoomName         string    `json:"roomName"`
	StartTime        time.Time `json:"startTime"`
	EndTime          time.Time `json:"endTime"`
	SignStartTime    *time.Time `json:"signStartTime"`
	SignEndTime      *time.Time `json:"signEndTime"`
	PracticeDuration int       `json:"practiceDuration"` // minutes
}

type ReservationCountVO struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

type DayOfWeekCountVO struct {
	DayOfWeek int `json:"dayOfWeek"`
	Count     int `json:"count"`
}

type TimeSlotReport struct {
	TimeSlot         string `json:"timeSlot"`
	ReservationCount int    `json:"reservationCount"`
}
