package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"github.com/jiaxin-room/jiaxin-room-api/internal/service"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
)

type LogHandler struct {
	svc *service.LogService
}

func NewLogHandler(svc *service.LogService) *LogHandler {
	return &LogHandler{svc: svc}
}

func RegisterLogRoutes(admin *gin.RouterGroup, h *LogHandler) {
	g := admin.Group("/operationLogs")
	{
		g.GET("/page", h.Page)
	}
}

func (h *LogHandler) Page(c *gin.Context) {
	var q model.LogQueryDTO
	if err := c.ShouldBindQuery(&q); err != nil {
		response.Error(c, "参数错误")
		return
	}
	page, err := h.svc.PageList(q)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.PageData(c, page.Total, page.Rows)
}
