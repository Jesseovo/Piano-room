package handler

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"github.com/jiaxin-room/jiaxin-room-api/internal/service"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
	"gorm.io/gorm"
)

type AdminHandler struct {
	svc *service.AdminService
}

func NewAdminHandler(svc *service.AdminService) *AdminHandler {
	return &AdminHandler{svc: svc}
}

func RegisterAdminRoutes(admin *gin.RouterGroup, super *gin.RouterGroup, h *AdminHandler) {
	g := admin.Group("/admins")
	{
		g.GET("/list", h.List)
		g.POST("", h.Create)
		g.GET("/:id", h.Get)
		g.PUT("", h.Update)
		g.POST("/status/:status", h.UpdateStatus)
		g.PUT("/info", h.UpdateInfo)
	}
	super.Group("/admins").DELETE("/:id", h.Delete)
}

func (h *AdminHandler) List(c *gin.Context) {
	page := 1
	pageSize := 10
	if v := c.Query("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			page = n
		}
	}
	if v := c.Query("pageSize"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			pageSize = n
		}
	}
	pageResult, err := h.svc.ListAdmins(page, pageSize)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.PageData(c, pageResult.Total, pageResult.Rows)
}

func (h *AdminHandler) Create(c *gin.Context) {
	var u model.User
	if err := c.ShouldBindJSON(&u); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.CreateAdmin(&u); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, u)
}

func (h *AdminHandler) Get(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的管理员ID")
		return
	}
	u, err := h.svc.GetAdmin(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, "管理员不存在")
			return
		}
		response.Error(c, err.Error())
		return
	}
	response.Success(c, u)
}

func (h *AdminHandler) Update(c *gin.Context) {
	var u model.User
	if err := c.ShouldBindJSON(&u); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if u.ID == 0 {
		response.Error(c, "缺少用户ID")
		return
	}
	if err := h.svc.UpdateAdmin(&u); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "更新成功")
}

func (h *AdminHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的管理员ID")
		return
	}
	if err := h.svc.DeleteAdmin(id); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "删除成功")
}

func (h *AdminHandler) UpdateStatus(c *gin.Context) {
	statusStr := c.Param("status")
	st, err := strconv.ParseInt(statusStr, 10, 64)
	if err != nil {
		response.Error(c, "无效的状态")
		return
	}
	var body struct {
		ID int64 `json:"id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.UpdateAdminStatus(body.ID, int8(st)); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "状态已更新")
}

func (h *AdminHandler) UpdateInfo(c *gin.Context) {
	var u model.User
	if err := c.ShouldBindJSON(&u); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if u.ID == 0 {
		response.Error(c, "缺少用户ID")
		return
	}
	if err := h.svc.UpdateAdminInfo(&u); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "资料已更新")
}
