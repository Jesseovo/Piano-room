package service

import (
	"errors"

	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"gorm.io/gorm"
)

type PenaltyService struct {
	db *gorm.DB
}

func NewPenaltyService(db *gorm.DB) *PenaltyService {
	return &PenaltyService{db: db}
}

func (s *PenaltyService) GetRules() ([]model.PenaltyRule, error) {
	var rules []model.PenaltyRule
	err := s.db.Order("violation_count").Find(&rules).Error
	return rules, err
}

func (s *PenaltyService) UpdateRule(rule *model.PenaltyRule) error {
	if rule == nil {
		return errors.New("nil rule")
	}
	if rule.ID == 0 {
		return s.db.Create(rule).Error
	}
	return s.db.Model(&model.PenaltyRule{}).Where("id = ?", rule.ID).Updates(map[string]interface{}{
		"violation_count": rule.ViolationCount,
		"ban_days":        rule.BanDays,
		"description":     rule.Description,
	}).Error
}

// UnbanUser clears ban_until and optionally resets violation count.
func (s *PenaltyService) UnbanUser(userId int64) error {
	return s.db.Model(&model.User{}).Where("id = ?", userId).Updates(map[string]interface{}{
		"ban_until":       nil,
		"violation_count": 0,
	}).Error
}
