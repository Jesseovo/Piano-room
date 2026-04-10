package service

import (
	"encoding/json"
	"errors"

	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"gorm.io/gorm"
)

type SystemService struct {
	db *gorm.DB
}

func NewSystemService(db *gorm.DB) *SystemService {
	return &SystemService{db: db}
}

const (
	sysKeyBasic        = "basic_settings"
	sysKeyReservation  = "reservation_settings"
	sysKeySecurity     = "security_settings"
)

func defaultBasic() model.BasicSetting {
	return model.BasicSetting{
		SystemName:       "Jiaxin Room",
		SlotStartHour:    8,
		SlotEndHour:      22,
		SlotDurationMins: 60,
	}
}

func defaultReservation() model.ReservationSetting {
	return model.ReservationSetting{
		MaxAdvanceDays: 7,
		SignInGrace:    15,
		MaxNoShow:      3,
	}
}

func defaultSecurity() model.SecuritySetting {
	return model.SecuritySetting{
		TokenExpireHours:  24,
		MinPasswordLength: 6,
	}
}

func loadJSON[T any](db *gorm.DB, key string, def T) (T, error) {
	var row model.SystemConfig
	err := db.Where("system_name = ?", key).First(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return def, nil
	}
	if err != nil {
		var zero T
		return zero, err
	}
	if row.Description == nil || *row.Description == "" {
		return def, nil
	}
	var out T
	if err := json.Unmarshal([]byte(*row.Description), &out); err != nil {
		return def, nil
	}
	return out, nil
}

func saveJSON(db *gorm.DB, key string, v interface{}) error {
	b, err := json.Marshal(v)
	if err != nil {
		return err
	}
	desc := string(b)
	var row model.SystemConfig
	err = db.Where("system_name = ?", key).First(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		row = model.SystemConfig{
			SystemName:  key,
			Description: &desc,
		}
		return db.Create(&row).Error
	}
	if err != nil {
		return err
	}
	return db.Model(&row).Update("description", desc).Error
}

func (s *SystemService) GetBasicSettings() (model.BasicSetting, error) {
	return loadJSON(s.db, sysKeyBasic, defaultBasic())
}

func (s *SystemService) SaveBasicSettings(bs model.BasicSetting) error {
	return saveJSON(s.db, sysKeyBasic, bs)
}

func (s *SystemService) GetReservationSettings() (model.ReservationSetting, error) {
	return loadJSON(s.db, sysKeyReservation, defaultReservation())
}

func (s *SystemService) SaveReservationSettings(rs model.ReservationSetting) error {
	return saveJSON(s.db, sysKeyReservation, rs)
}

func (s *SystemService) GetSecuritySettings() (model.SecuritySetting, error) {
	return loadJSON(s.db, sysKeySecurity, defaultSecurity())
}

func (s *SystemService) SaveSecuritySettings(ss model.SecuritySetting) error {
	return saveJSON(s.db, sysKeySecurity, ss)
}
