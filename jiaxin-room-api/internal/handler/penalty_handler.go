package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"github.com/jiaxin-room/jiaxin-room-api/internal/service"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
)

type PenaltyHandler struct {
	svc *service.PenaltyService
}

func NewPenaltyHandler(svc *service.PenaltyService) *PenaltyHandler {
	return &PenaltyHandler{svc: svc}
}

func RegisterPenaltyRoutes(r *gin.Engine, admin *gin.RouterGroup, h *PenaltyHandler) {
	pub := r.Group("/system/penalty-rules")
	{
		pub.GET("", h.List)
	}
	g := admin.Group("/system/penalty-rules")
	{
		g.PUT("/:id", h.Update)
		g.DELETE("/ban/:userId", h.Unban)
	}
}

func (h *PenaltyHandler) List(c *gin.Context) {
	rules, err := h.svc.GetRules()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, rules)
}

func (h *PenaltyHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的规则ID")
		return
	}
	var rule model.PenaltyRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		response.Error(c, "参数错误")
		return
	}
	rule.ID = id
	if err := h.svc.UpdateRule(&rule); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "保存成功")
}

func (h *PenaltyHandler) Unban(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		response.Error(c, "无效的用户ID")
		return
	}
	if err := h.svc.UnbanUser(userID); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "已解除封禁")
}
