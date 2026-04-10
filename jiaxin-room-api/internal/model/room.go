package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

type Room struct {
	ID            int64      `json:"id" gorm:"primaryKey;autoIncrement"`
	RoomNumber    string     `json:"roomNumber" gorm:"column:room_number;uniqueIndex;size:20;not null"`
	Name          string     `json:"name" gorm:"size:100;not null"`
	Floor         *int       `json:"floor"`
	Capacity      int        `json:"capacity" gorm:"default:1;not null"`
	RoomTypeID    *int64     `json:"roomTypeId" gorm:"column:room_type_id"`
	Facilities    JSONMap    `json:"facilities" gorm:"type:text"`
	Status        int8       `json:"status" gorm:"default:1;not null"`
	Description   *string    `json:"description" gorm:"type:text"`
	Longitude     *float64   `json:"longitude" gorm:"type:decimal(10,7)"`
	Latitude      *float64   `json:"latitude" gorm:"type:decimal(10,7)"`
	CheckInRadius int        `json:"checkInRadius" gorm:"column:check_in_radius;default:100"`
	CreatedAt     time.Time  `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt     time.Time  `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`

	RoomType *RoomType `json:"roomType,omitempty" gorm:"foreignKey:RoomTypeID"`
}

func (Room) TableName() string { return "rooms" }

type RoomType struct {
	ID          int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	TypeName    string    `json:"typeName" gorm:"column:type_name;uniqueIndex;size:50;not null"`
	Description *string   `json:"description" gorm:"size:200"`
	CreatedAt   time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

func (RoomType) TableName() string { return "room_types" }

type RoomMaintenance struct {
	ID              int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	RoomID          int64     `json:"roomId" gorm:"column:room_id;not null;index"`
	StartTime       time.Time `json:"startTime" gorm:"column:start_time;not null"`
	EndTime         time.Time `json:"endTime" gorm:"column:end_time;not null"`
	Reason          string    `json:"reason" gorm:"type:text;not null"`
	MaintenanceType string    `json:"maintenanceType" gorm:"column:maintenance_type;type:enum('定期维护','设备维护','设备升级','其他');not null"`
	Status          string    `json:"status" gorm:"type:enum('未开始','进行中','已完成','已取消');default:'未开始';not null"`
	CreatedAt       time.Time `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt       time.Time `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`

	Room *Room `json:"room,omitempty" gorm:"foreignKey:RoomID"`
}

func (RoomMaintenance) TableName() string { return "room_maintenance" }

type RoomQueryDTO struct {
	ID               *int64  `form:"id"`
	Status           *int    `form:"status"`
	RoomTypeID       *int64  `form:"roomTypeId"`
	RoomNumberOrName string  `form:"roomNumberOrName"`
	Page             int     `form:"page,default=1"`
	PageSize         int     `form:"pageSize,default=10"`
}

type MaintenanceQueryDTO struct {
	RoomID          *int64 `form:"roomId"`
	Status          string `form:"status"`
	MaintenanceType string `form:"maintenanceType"`
	StartTime       string `form:"startTime"`
	EndTime         string `form:"endTime"`
	Page            int    `form:"page,default=1"`
	PageSize        int    `form:"pageSize,default=10"`
}

type HotRoomVO struct {
	RoomID           int64  `json:"roomId"`
	RoomName         string `json:"roomName"`
	BuildingName     string `json:"buildingName"`
	ReservationCount int    `json:"reservationCount"`
}

// JSONMap is a helper for JSON columns
type JSONMap map[string]interface{}

func (j JSONMap) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	b, err := json.Marshal(j)
	return string(b), err
}

func (j *JSONMap) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case string:
		bytes = []byte(v)
	case []byte:
		bytes = v
	}
	return json.Unmarshal(bytes, j)
}
