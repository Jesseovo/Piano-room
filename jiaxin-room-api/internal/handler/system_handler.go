package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"github.com/jiaxin-room/jiaxin-room-api/internal/service"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
)

type SystemHandler struct {
	svc *service.SystemService
}

func NewSystemHandler(svc *service.SystemService) *SystemHandler {
	return &SystemHandler{svc: svc}
}

func RegisterSystemRoutes(r *gin.Engine, admin *gin.RouterGroup, h *SystemHandler) {
	g := r.Group("/system")
	{
		g.GET("/settings/basic", h.GetBasic)
		g.GET("/settings/reservation", h.GetReservation)
		g.GET("/settings/security", h.GetSecurity)
	}
	sg := admin.Group("/system")
	{
		sg.POST("/settings/basic", h.SaveBasic)
		sg.POST("/settings/reservation", h.SaveReservation)
		sg.POST("/settings/security", h.SaveSecurity)
	}
}

func (h *SystemHandler) GetBasic(c *gin.Context) {
	bs, err := h.svc.GetBasicSettings()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, bs)
}

func (h *SystemHandler) SaveBasic(c *gin.Context) {
	var bs model.BasicSetting
	if err := c.ShouldBindJSON(&bs); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.SaveBasicSettings(bs); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "保存成功")
}

func (h *SystemHandler) GetReservation(c *gin.Context) {
	rs, err := h.svc.GetReservationSettings()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, rs)
}

func (h *SystemHandler) SaveReservation(c *gin.Context) {
	var rs model.ReservationSetting
	if err := c.ShouldBindJSON(&rs); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.SaveReservationSettings(rs); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "保存成功")
}

func (h *SystemHandler) GetSecurity(c *gin.Context) {
	ss, err := h.svc.GetSecuritySettings()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, ss)
}

func (h *SystemHandler) SaveSecurity(c *gin.Context) {
	var ss model.SecuritySetting
	if err := c.ShouldBindJSON(&ss); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.SaveSecuritySettings(ss); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "保存成功")
}
