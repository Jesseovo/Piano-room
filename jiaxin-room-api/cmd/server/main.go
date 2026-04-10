package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/cache"
	"github.com/jiaxin-room/jiaxin-room-api/internal/config"
	"github.com/jiaxin-room/jiaxin-room-api/internal/handler"
	"github.com/jiaxin-room/jiaxin-room-api/internal/middleware"
	"github.com/jiaxin-room/jiaxin-room-api/internal/repository"
	"github.com/jiaxin-room/jiaxin-room-api/internal/service"
)

func main() {
	cfg := config.Load()

	db := repository.InitDB(&cfg.Database)
	cache.InitRedis(&cfg.Redis)

	if cfg.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(middleware.Logger(), gin.Recovery(), middleware.CORS())
	r.Use(middleware.JWTAuth())

	admin := r.Group("", middleware.AdminRequired())
	superAdmin := r.Group("", middleware.SuperAdminRequired())

	// Init services
	userSvc := service.NewUserService(db)
	roomSvc := service.NewRoomService(db)
	reservationSvc := service.NewReservationService(db)
	systemSvc := service.NewSystemService(db)
	reportSvc := service.NewReportService(db)
	adminSvc := service.NewAdminService(db)
	maintenanceSvc := service.NewMaintenanceService(db)
	penaltySvc := service.NewPenaltyService(db)
	logSvc := service.NewLogService(db)
	deptSvc := service.NewDeptService(db)
	classTypeSvc := service.NewClassTypeService(db)

	// Init handlers
	userHandler := handler.NewUserHandler(userSvc)
	roomHandler := handler.NewRoomHandler(roomSvc)
	reservationHandler := handler.NewReservationHandler(reservationSvc)
	systemHandler := handler.NewSystemHandler(systemSvc)
	reportHandler := handler.NewReportHandler(reportSvc)
	adminHandler := handler.NewAdminHandler(adminSvc)
	maintenanceHandler := handler.NewMaintenanceHandler(maintenanceSvc)
	penaltyHandler := handler.NewPenaltyHandler(penaltySvc)
	logHandler := handler.NewLogHandler(logSvc)
	deptHandler := handler.NewDeptHandler(deptSvc)
	classTypeHandler := handler.NewClassTypeHandler(classTypeSvc)
	uploadHandler := handler.NewUploadHandler()

	// Register routes (management APIs under admin group with AdminRequired)
	handler.RegisterUserRoutes(r, admin, userHandler)
	handler.RegisterRoomRoutes(r, admin, roomHandler)
	handler.RegisterReservationRoutes(r, reservationHandler)
	handler.RegisterSystemRoutes(r, admin, systemHandler)
	handler.RegisterReportRoutes(r, admin, reportHandler)
	handler.RegisterAdminRoutes(admin, superAdmin, adminHandler)
	handler.RegisterMaintenanceRoutes(admin, maintenanceHandler)
	handler.RegisterPenaltyRoutes(r, admin, penaltyHandler)
	handler.RegisterLogRoutes(admin, logHandler)
	handler.RegisterDeptRoutes(r, admin, deptHandler)
	handler.RegisterClassTypeRoutes(r, admin, classTypeHandler)
	handler.RegisterUploadRoutes(admin, uploadHandler)

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("夹心 Room API starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
