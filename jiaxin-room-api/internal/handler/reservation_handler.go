package handler

import (
	"errors"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"github.com/jiaxin-room/jiaxin-room-api/internal/service"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
	"gorm.io/gorm"
)

type ReservationHandler struct {
	svc *service.ReservationService
}

func NewReservationHandler(svc *service.ReservationService) *ReservationHandler {
	return &ReservationHandler{svc: svc}
}

func RegisterReservationRoutes(r *gin.Engine, h *ReservationHandler) {
	g := r.Group("/reservations")
	{
		g.PUT("/:id/cancel", h.Cancel)
		g.GET("/list", h.List)
		g.GET("/availability", h.Availability)
		g.GET("/practiceduration", h.PracticeDuration)
		g.GET("/userStatistics", h.UserStatistics)
		g.POST("/quick", h.Quick)
		g.GET("/getAvailableByRoomTypeAndTime", h.AvailableByRoomTypeAndTime)
		g.POST("", h.Create)
		g.PUT("/:id", h.Update)
		g.POST("/:id/sign-in", h.SignIn)
		g.POST("/:id/sign-out", h.SignOut)
		g.GET("/:id", h.Get)
	}
}

func (h *ReservationHandler) Cancel(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的预约ID")
		return
	}
	var reason model.CancelReason
	_ = c.ShouldBindJSON(&reason)
	if err := h.svc.Cancel(id, reason); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "已取消")
}

func (h *ReservationHandler) List(c *gin.Context) {
	var q model.ReservationQueryDTO
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

func (h *ReservationHandler) Availability(c *gin.Context) {
	roomID, err := strconv.ParseInt(c.Query("roomId"), 10, 64)
	if err != nil {
		response.Error(c, "缺少或无效 roomId")
		return
	}
	date := c.Query("date")
	if date == "" {
		response.Error(c, "缺少 date")
		return
	}
	slots, err := h.svc.GetAvailability(roomID, date)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, slots)
}

func (h *ReservationHandler) PracticeDuration(c *gin.Context) {
	selfID, ok := ctxUserID64(c)
	if !ok {
		response.Unauthorized(c, "未登录")
		return
	}
	uid := selfID
	if q := c.Query("userId"); q != "" {
		qid, err := strconv.ParseInt(q, 10, 64)
		if err != nil {
			response.Error(c, "无效的用户ID")
			return
		}
		if qid != selfID && !ctxIsAdmin(c) {
			response.ErrorWithCode(c, 403, "无权查询他人数据")
			return
		}
		uid = qid
	}
	var q model.ReservationQueryDTO
	if err := c.ShouldBindQuery(&q); err != nil {
		response.Error(c, "参数错误")
		return
	}
	page, err := h.svc.ListPracticeDuration(uid, q)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.PageData(c, page.Total, page.Rows)
}

func (h *ReservationHandler) UserStatistics(c *gin.Context) {
	selfID, ok := ctxUserID64(c)
	if !ok {
		response.Unauthorized(c, "未登录")
		return
	}
	uid := selfID
	if q := c.Query("userId"); q != "" {
		qid, err := strconv.ParseInt(q, 10, 64)
		if err != nil {
			response.Error(c, "无效的用户ID")
			return
		}
		if qid != selfID && !ctxIsAdmin(c) {
			response.ErrorWithCode(c, 403, "无权查询他人数据")
			return
		}
		uid = qid
	}
	m, err := h.svc.GetUserStatistics(uid)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, m)
}

func (h *ReservationHandler) Quick(c *gin.Context) {
	var dto model.QuickReservationDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, "参数错误")
		return
	}
	uid, ok := ctxUserID64(c)
	if !ok {
		response.Unauthorized(c, "未登录")
		return
	}
	r, err := h.svc.QuickCreate(dto, uid)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, r)
}

func (h *ReservationHandler) AvailableByRoomTypeAndTime(c *gin.Context) {
	var qo model.AvailableRoomQO
	if err := c.ShouldBindQuery(&qo); err != nil {
		// try parse times from query manually
		rt := c.Query("roomTypeId")
		if rt != "" {
			v, _ := strconv.ParseInt(rt, 10, 64)
			qo.RoomTypeID = &v
		}
		st, e1 := parseTimeQuery(c.Query("startTime"))
		et, e2 := parseTimeQuery(c.Query("endTime"))
		if e1 != nil || e2 != nil {
			response.Error(c, "缺少或无效 startTime/endTime")
			return
		}
		qo.StartTime = st
		qo.EndTime = et
	}
	if qo.EndTime.IsZero() || qo.StartTime.IsZero() {
		response.Error(c, "缺少 startTime 或 endTime")
		return
	}
	rooms, err := h.svc.GetAvailableByTypeAndTime(qo)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, rooms)
}

func parseTimeQuery(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, errors.New("empty")
	}
	layouts := []string{
		time.RFC3339,
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05",
		"2006-01-02 15:04",
	}
	for _, l := range layouts {
		if t, err := time.ParseInLocation(l, s, time.Local); err == nil {
			return t, nil
		}
	}
	return time.Time{}, errors.New("parse time")
}

func (h *ReservationHandler) Create(c *gin.Context) {
	var dto model.ReservationDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, "参数错误")
		return
	}
	uid, ok := ctxUserID64(c)
	if !ok {
		response.Unauthorized(c, "未登录")
		return
	}
	r, err := h.svc.Create(dto, uid)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, r)
}

func (h *ReservationHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的预约ID")
		return
	}
	var dto model.ReservationDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, "参数错误")
		return
	}
	r, err := h.svc.Update(id, dto)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, r)
}

func (h *ReservationHandler) SignIn(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的预约ID")
		return
	}
	if err := h.svc.SignIn(id); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "签到成功")
}

func (h *ReservationHandler) SignOut(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的预约ID")
		return
	}
	if err := h.svc.SignOut(id); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "签退成功")
}

func (h *ReservationHandler) Get(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的预约ID")
		return
	}
	r, err := h.svc.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, "预约不存在")
			return
		}
		response.Error(c, err.Error())
		return
	}
	response.Success(c, r)
}
