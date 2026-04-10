package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"github.com/jiaxin-room/jiaxin-room-api/internal/service"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
)

type ReportHandler struct {
	svc *service.ReportService
}

func NewReportHandler(svc *service.ReportService) *ReportHandler {
	return &ReportHandler{svc: svc}
}

func RegisterReportRoutes(r *gin.Engine, admin *gin.RouterGroup, h *ReportHandler) {
	pub := r.Group("/reports")
	{
		pub.GET("/bookingOverview", h.BookingOverview)
		pub.GET("/classroomUsageRate", h.ClassroomUsageRate)
		pub.GET("/classroomDistribution", h.ClassroomDistribution)
	}
	g := admin.Group("/reports")
	{
		g.GET("/countReservations", h.CountReservations)
		g.GET("/approvalRate", h.ApprovalRate)
		g.GET("/activeUsers", h.ActiveUsers)
		g.GET("/registeredUsers", h.RegisteredUsers)
		g.GET("/pendingReservations", h.PendingReservations)
		g.GET("/reservationStatusDistribution", h.ReservationStatusDistribution)
		g.GET("/weekly", h.Weekly)
		g.GET("/time-slot-report", h.TimeSlotReport)
		g.GET("/usage", h.Usage)
		g.GET("/typeusage", h.TypeUsage)
		g.GET("/totalPracticeHours", h.TotalPracticeHours)
	}
}

func (h *ReportHandler) CountReservations(c *gin.Context) {
	var dto model.CountReservationsDTO
	if err := c.ShouldBindQuery(&dto); err != nil {
		response.Error(c, "参数错误")
		return
	}
	data, err := h.svc.CountReservations(dto)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ReportHandler) ApprovalRate(c *gin.Context) {
	rate, err := h.svc.GetApprovalRate()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, gin.H{"approvalRate": rate})
}

func (h *ReportHandler) ActiveUsers(c *gin.Context) {
	limit := 10
	if v := c.Query("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			limit = n
		}
	}
	users, err := h.svc.GetActiveUsers(limit)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, users)
}

func (h *ReportHandler) RegisteredUsers(c *gin.Context) {
	n, err := h.svc.GetRegisteredUsers()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, gin.H{"count": n})
}

func (h *ReportHandler) PendingReservations(c *gin.Context) {
	n, err := h.svc.GetPendingReservations()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, gin.H{"count": n})
}

func (h *ReportHandler) ClassroomUsageRate(c *gin.Context) {
	data, err := h.svc.GetClassroomUsageRate()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ReportHandler) ClassroomDistribution(c *gin.Context) {
	data, err := h.svc.GetClassroomDistribution()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ReportHandler) ReservationStatusDistribution(c *gin.Context) {
	m, err := h.svc.GetReservationStatusDistribution()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, m)
}

func (h *ReportHandler) Weekly(c *gin.Context) {
	data, err := h.svc.GetWeekly()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ReportHandler) TimeSlotReport(c *gin.Context) {
	data, err := h.svc.GetTimeSlotReport()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ReportHandler) Usage(c *gin.Context) {
	data, err := h.svc.GetClassroomUsageRate()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ReportHandler) TypeUsage(c *gin.Context) {
	data, err := h.svc.GetTypeUsage()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ReportHandler) BookingOverview(c *gin.Context) {
	data, err := h.svc.GetBookingOverview()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *ReportHandler) TotalPracticeHours(c *gin.Context) {
	hours, err := h.svc.GetTotalPracticeHours()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, gin.H{"totalPracticeHours": hours})
}
