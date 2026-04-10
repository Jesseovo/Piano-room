package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"github.com/jiaxin-room/jiaxin-room-api/internal/service"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
	"gorm.io/gorm"
)

type RoomHandler struct {
	svc *service.RoomService
}

func NewRoomHandler(svc *service.RoomService) *RoomHandler {
	return &RoomHandler{svc: svc}
}

func RegisterRoomRoutes(r *gin.Engine, admin *gin.RouterGroup, h *RoomHandler) {
	g := r.Group("/room")
	{
		g.GET("", h.List)
		g.GET("/search", h.Search)
		g.GET("/hot-today", h.HotToday)
		g.GET("/:id", h.Get)
	}
	bg := admin.Group("/room")
	{
		bg.POST("", h.Create)
		bg.DELETE("/:id", h.Delete)
		bg.PUT("", h.Update)
		bg.PUT("/:id/status", h.UpdateStatus)
		bg.GET("/export", h.Export)
	}
}

func (h *RoomHandler) List(c *gin.Context) {
	var q model.RoomQueryDTO
	if err := c.ShouldBindQuery(&q); err != nil {
		response.Error(c, "参数错误")
		return
	}
	page, err := h.svc.ListRooms(q)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.PageData(c, page.Total, page.Rows)
}

func (h *RoomHandler) Create(c *gin.Context) {
	var room model.Room
	if err := c.ShouldBindJSON(&room); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.CreateRoom(&room); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, room)
}

func (h *RoomHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的房间ID")
		return
	}
	if err := h.svc.DeleteRoom(id); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "删除成功")
}

func (h *RoomHandler) Get(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的房间ID")
		return
	}
	room, err := h.svc.GetRoom(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, "房间不存在")
			return
		}
		response.Error(c, err.Error())
		return
	}
	response.Success(c, room)
}

func (h *RoomHandler) Update(c *gin.Context) {
	var room model.Room
	if err := c.ShouldBindJSON(&room); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if room.ID == 0 {
		response.Error(c, "缺少房间ID")
		return
	}
	if err := h.svc.UpdateRoom(&room); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "更新成功")
}

func (h *RoomHandler) UpdateStatus(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的房间ID")
		return
	}
	var body struct {
		Status int8 `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.UpdateRoomStatus(id, body.Status); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "状态已更新")
}

func (h *RoomHandler) Search(c *gin.Context) {
	kw := c.Query("keyword")
	if kw == "" {
		kw = c.Query("q")
	}
	rooms, err := h.svc.SearchRooms(kw)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, rooms)
}

func (h *RoomHandler) HotToday(c *gin.Context) {
	limit := 10
	if v := c.Query("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			limit = n
		}
	}
	list, err := h.svc.GetHotToday(limit)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, list)
}

func (h *RoomHandler) Export(c *gin.Context) {
	data, err := h.svc.ExportRooms()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	c.Header("Content-Disposition", "attachment; filename=rooms.csv")
	c.Data(http.StatusOK, "text/csv; charset=utf-8", data)
}
