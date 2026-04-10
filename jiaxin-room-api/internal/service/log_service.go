package service

import (
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"gorm.io/gorm"
)

type LogService struct {
	db *gorm.DB
}

func NewLogService(db *gorm.DB) *LogService {
	return &LogService{db: db}
}

func (s *LogService) PageList(query model.LogQueryDTO) (*model.PageResult[model.OperationLog], error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.PageSize < 1 {
		query.PageSize = 10
	}
	q := s.db.Model(&model.OperationLog{})
	if query.Username != "" {
		q = q.Where("username LIKE ?", "%"+query.Username+"%")
	}
	if query.OperationModule != "" {
		q = q.Where("operation_module = ?", query.OperationModule)
	}
	if query.OperationType != "" {
		q = q.Where("operation_type = ?", query.OperationType)
	}
	if query.Status != nil {
		q = q.Where("status = ?", int8(*query.Status))
	}
	if query.StartTime != "" {
		q = q.Where("created_at >= ?", query.StartTime)
	}
	if query.EndTime != "" {
		q = q.Where("created_at <= ?", query.EndTime)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}
	var rows []model.OperationLog
	offset := (query.Page - 1) * query.PageSize
	if err := q.Order("id DESC").Offset(offset).Limit(query.PageSize).Find(&rows).Error; err != nil {
		return nil, err
	}
	return &model.PageResult[model.OperationLog]{Total: total, Rows: rows}, nil
}

func (s *LogService) CreateLog(log *model.OperationLog) error {
	return s.db.Create(log).Error
}
