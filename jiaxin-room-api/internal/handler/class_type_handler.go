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

type ClassTypeHandler struct {
	svc *service.ClassTypeService
}

func NewClassTypeHandler(svc *service.ClassTypeService) *ClassTypeHandler {
	return &ClassTypeHandler{svc: svc}
}

func RegisterClassTypeRoutes(r *gin.Engine, admin *gin.RouterGroup, h *ClassTypeHandler) {
	r.Group("/classType").GET("/all", h.All)
	g := admin.Group("/classType")
	{
		g.POST("", h.Create)
		g.DELETE("/:id", h.Delete)
		g.PUT("/:id", h.Update)
		g.GET("", h.Page)
		g.GET("/:id", h.Get)
	}
}

func (h *ClassTypeHandler) All(c *gin.Context) {
	list, err := h.svc.ListAll()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, list)
}

func (h *ClassTypeHandler) Create(c *gin.Context) {
	var rt model.RoomType
	if err := c.ShouldBindJSON(&rt); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.Create(&rt); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, rt)
}

func (h *ClassTypeHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}
	if err := h.svc.Delete(id); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "删除成功")
}

func (h *ClassTypeHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}
	var rt model.RoomType
	if err := c.ShouldBindJSON(&rt); err != nil {
		response.Error(c, "参数错误")
		return
	}
	rt.ID = id
	if err := h.svc.Update(&rt); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "更新成功")
}

func (h *ClassTypeHandler) Page(c *gin.Context) {
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
	res, err := h.svc.Page(page, pageSize)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.PageData(c, res.Total, res.Rows)
}

func (h *ClassTypeHandler) Get(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}
	rt, err := h.svc.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, "记录不存在")
			return
		}
		response.Error(c, err.Error())
		return
	}
	response.Success(c, rt)
}
