package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"github.com/jiaxin-room/jiaxin-room-api/internal/service"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
)

type MaintenanceHandler struct {
	svc *service.MaintenanceService
}

func NewMaintenanceHandler(svc *service.MaintenanceService) *MaintenanceHandler {
	return &MaintenanceHandler{svc: svc}
}

func RegisterMaintenanceRoutes(admin *gin.RouterGroup, h *MaintenanceHandler) {
	g := admin.Group("/maintenance")
	{
		g.GET("/list", h.List)
		g.DELETE("/batch", h.BatchDelete)
		g.POST("/updateStatus", h.UpdateStatus)
	}
}

func (h *MaintenanceHandler) List(c *gin.Context) {
	var q model.MaintenanceQueryDTO
	if err := c.ShouldBindQuery(&q); err != nil {
		response.Error(c, "参数错误")
		return
	}
	page, err := h.svc.List(q)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.PageData(c, page.Total, page.Rows)
}

func (h *MaintenanceHandler) BatchDelete(c *gin.Context) {
	var body struct {
		IDs []int64 `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.BatchDelete(body.IDs); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "删除成功")
}

func (h *MaintenanceHandler) UpdateStatus(c *gin.Context) {
	var body struct {
		ID     int64  `json:"id" binding:"required"`
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.UpdateStatus(body.ID, body.Status); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "状态已更新")
}
