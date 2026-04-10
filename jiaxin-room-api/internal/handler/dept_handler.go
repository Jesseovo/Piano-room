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

type DeptHandler struct {
	svc *service.DeptService
}

func NewDeptHandler(svc *service.DeptService) *DeptHandler {
	return &DeptHandler{svc: svc}
}

func RegisterDeptRoutes(r *gin.Engine, admin *gin.RouterGroup, h *DeptHandler) {
	r.Group("/depts").GET("", h.List)
	g := admin.Group("/depts")
	{
		g.DELETE("", h.Delete)
		g.POST("", h.Create)
		g.GET("/:id", h.Get)
		g.PUT("", h.Update)
	}
}

func (h *DeptHandler) List(c *gin.Context) {
	list, err := h.svc.List()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, list)
}

func (h *DeptHandler) Delete(c *gin.Context) {
	idStr := c.Query("id")
	if idStr == "" {
		var body struct {
			ID int64 `json:"id"`
		}
		if err := c.ShouldBindJSON(&body); err != nil || body.ID == 0 {
			response.Error(c, "缺少 id")
			return
		}
		idStr = strconv.FormatInt(body.ID, 10)
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		response.Error(c, "无效的部门ID")
		return
	}
	if err := h.svc.Delete(id); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "删除成功")
}

func (h *DeptHandler) Create(c *gin.Context) {
	var d model.Department
	if err := c.ShouldBindJSON(&d); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.Create(&d); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, d)
}

func (h *DeptHandler) Get(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的部门ID")
		return
	}
	d, err := h.svc.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, "部门不存在")
			return
		}
		response.Error(c, err.Error())
		return
	}
	response.Success(c, d)
}

func (h *DeptHandler) Update(c *gin.Context) {
	var d model.Department
	if err := c.ShouldBindJSON(&d); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if d.ID == 0 {
		response.Error(c, "缺少部门ID")
		return
	}
	if err := h.svc.Update(&d); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "更新成功")
}
