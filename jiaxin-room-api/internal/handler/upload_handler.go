package handler

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

func RegisterUploadRoutes(admin *gin.RouterGroup, h *UploadHandler) {
	admin.POST("/upload", h.Upload)
}

func (h *UploadHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		// allow alternative field name used by some clients
		file, err = c.FormFile("upload")
		if err != nil {
			response.Error(c, "请选择文件")
			return
		}
	}
	if file.Size > 20<<20 {
		response.Error(c, "文件过大")
		return
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg":
	default:
		response.Error(c, "不支持的文件类型")
		return
	}
	src, err := file.Open()
	if err != nil {
		response.Error(c, "读取文件失败")
		return
	}
	defer src.Close()

	dir := filepath.Join("uploads", time.Now().Format("2006-01-02"))
	if err := os.MkdirAll(dir, 0o755); err != nil {
		response.Error(c, "创建目录失败")
		return
	}
	name := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	dstPath := filepath.Join(dir, name)
	dst, err := os.Create(dstPath)
	if err != nil {
		response.Error(c, "保存文件失败")
		return
	}
	defer dst.Close()
	if _, err := io.Copy(dst, src); err != nil {
		response.Error(c, "保存文件失败")
		return
	}

	url := "/" + strings.ReplaceAll(dstPath, "\\", "/")
	response.Success(c, gin.H{
		"url":      url,
		"filename": file.Filename,
		"size":     file.Size,
	})
}
