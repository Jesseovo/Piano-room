package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/config"
	jwtpkg "github.com/jiaxin-room/jiaxin-room-api/pkg/jwt"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
)

const (
	CtxUserID   = "userId"
	CtxUsername  = "username"
	CtxUserType = "userType"
)

// public paths that skip JWT verification
var publicPaths = map[string]bool{
	"/user/login":                      true,
	"/user/register":                   true,
	"/user/captcha":                    true,
	"/user/email/code":                 true,
	"/user/reset-password-by-email":    true,
	"/system/settings/basic":           true,
	"/classType/all":                   true,
	"/depts":                           true,
	"/room/hot-today":                  true,
	"/room/search":                     true,
	"/reports/bookingOverview":         true,
	"/reports/classroomUsageRate":      true,
	"/reports/classroomDistribution":   true,
	"/reservations/availability":       true,
	"/system/penalty-rules":            true,
}

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		if publicPaths[path] {
			// Same path is used for public GET vs authenticated mutating handlers.
			if (path == "/system/settings/basic" || path == "/depts") && c.Request.Method != http.MethodGet {
				// require JWT below
			} else {
				c.Next()
				return
			}
		}

		// Allow public room detail: /room/{id}
		if strings.HasPrefix(path, "/room/") && c.Request.Method == "GET" {
			parts := strings.Split(strings.TrimPrefix(path, "/room/"), "/")
			if len(parts) == 1 && parts[0] != "" {
				c.Next()
				return
			}
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "未登录")
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader {
			response.Unauthorized(c, "无效的认证格式")
			return
		}

		claims, err := jwtpkg.ParseToken(tokenStr, config.AppConfig.JWT.Secret)
		if err != nil {
			response.Unauthorized(c, "登录已过期，请重新登录")
			return
		}

		c.Set(CtxUserID, claims.UserID)
		c.Set(CtxUsername, claims.Username)
		c.Set(CtxUserType, claims.UserType)
		c.Next()
	}
}

func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		userType, _ := c.Get(CtxUserType)
		if userType != "admin" && userType != "super_admin" {
			response.ErrorWithCode(c, 403, "无管理员权限")
			c.Abort()
			return
		}
		c.Next()
	}
}

func SuperAdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		userType, _ := c.Get(CtxUserType)
		if userType != "super_admin" {
			response.ErrorWithCode(c, 403, "需要超级管理员权限")
			c.Abort()
			return
		}
		c.Next()
	}
}
