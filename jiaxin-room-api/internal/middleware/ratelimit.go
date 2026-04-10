package middleware

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/cache"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
)

func RateLimiter(limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		key := fmt.Sprintf("%s:%s", ip, c.Request.URL.Path)

		limited, err := cache.RateLimit(c.Request.Context(), key, limit, window)
		if err == nil && limited {
			response.ErrorWithCode(c, 429, "请求过于频繁，请稍后再试")
			c.Abort()
			return
		}
		c.Next()
	}
}
