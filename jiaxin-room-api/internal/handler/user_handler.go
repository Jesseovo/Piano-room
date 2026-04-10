package handler

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"image"
	"image/color"
	"image/png"
	"math/big"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/jiaxin-room/jiaxin-room-api/internal/middleware"
	"github.com/jiaxin-room/jiaxin-room-api/internal/model"
	"github.com/jiaxin-room/jiaxin-room-api/internal/service"
	"github.com/jiaxin-room/jiaxin-room-api/pkg/response"
	"gorm.io/gorm"
)

// captchaStore maps captchaId -> code (short-lived; production should use Redis).
var captchaStore sync.Map

type UserHandler struct {
	svc *service.UserService
}

func NewUserHandler(svc *service.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

func RegisterUserRoutes(r *gin.Engine, admin *gin.RouterGroup, h *UserHandler) {
	g := r.Group("/user")
	{
		g.GET("/getUserInfo", h.GetUserInfo)
		g.GET("/captcha", h.Captcha)
		g.POST("/login", h.Login)
		g.POST("/register", h.Register)
		g.GET("/email/code", h.EmailCode)
		g.PUT("/password", h.Password)
		g.PUT("/info", h.Info)
		g.GET("/my-stats", h.MyStats)
		g.POST("/reset-password-by-email", h.ResetPasswordByEmail)
	}
	ag := admin.Group("/user")
	{
		ag.GET("/list", h.List)
		ag.GET("/:id", h.GetByID)
		ag.DELETE("", h.Delete)
		ag.POST("/status", h.Status)
		ag.GET("/:id/reservation-stats", h.ReservationStats)
		ag.POST("/add", h.Add)
	}
}

func (h *UserHandler) GetUserInfo(c *gin.Context) {
	userId, ok := ctxUserID64(c)
	if !ok {
		response.Unauthorized(c, "未登录")
		return
	}
	vo, err := h.svc.GetUserInfo(userId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, "用户不存在")
			return
		}
		response.Error(c, err.Error())
		return
	}
	response.Success(c, vo)
}

func (h *UserHandler) Captcha(c *gin.Context) {
	code, err := randomDigits(4)
	if err != nil {
		response.Error(c, "生成验证码失败")
		return
	}
	captchaID, err := randomHex(16)
	if err != nil {
		response.Error(c, "生成验证码失败")
		return
	}
	captchaStore.Store(captchaID, code)

	imgB64, err := captchaPNGBase64(code)
	if err != nil {
		response.Error(c, "生成验证码图片失败")
		return
	}
	response.Success(c, gin.H{
		"captchaId":   captchaID,
		"imageBase64": imgB64,
	})
}

func (h *UserHandler) Login(c *gin.Context) {
	var dto model.UserLoginDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, "参数错误")
		return
	}
	res, err := h.svc.Login(dto)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *UserHandler) Register(c *gin.Context) {
	var dto model.RegisterDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, "参数错误")
		return
	}
	u, err := h.svc.Register(dto)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, u)
}

func (h *UserHandler) EmailCode(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		response.Error(c, "缺少 email")
		return
	}
	// Stub: real implementation would send mail via SMTP.
	response.Success(c, gin.H{"email": email, "sent": true})
}

func (h *UserHandler) List(c *gin.Context) {
	var q model.UserQueryDTO
	if err := c.ShouldBindQuery(&q); err != nil {
		response.Error(c, "参数错误")
		return
	}
	page, err := h.svc.ListUsers(q)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.PageData(c, page.Total, page.Rows)
}

func (h *UserHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的用户ID")
		return
	}
	vo, err := h.svc.GetUserInfo(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, "用户不存在")
			return
		}
		response.Error(c, err.Error())
		return
	}
	response.Success(c, vo)
}

func (h *UserHandler) Password(c *gin.Context) {
	var dto model.ResetPasswordDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if uid, ok := ctxUserID64(c); ok && dto.ID == 0 {
		dto.ID = uid
	}
	if dto.ID == 0 {
		response.Error(c, "缺少用户ID")
		return
	}
	if err := h.svc.ResetPassword(dto); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "密码已更新")
}

func (h *UserHandler) Delete(c *gin.Context) {
	var body struct {
		IDs []int64 `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || len(body.IDs) == 0 {
		response.Error(c, "请提供 ids")
		return
	}
	if err := h.svc.DeleteUsers(body.IDs); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "删除成功")
}

func (h *UserHandler) Status(c *gin.Context) {
	var dto model.UserStatusDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.UpdateStatus(dto); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "状态已更新")
}

func (h *UserHandler) Info(c *gin.Context) {
	var u model.User
	if err := c.ShouldBindJSON(&u); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if uid, ok := ctxUserID64(c); ok && u.ID == 0 {
		u.ID = uid
	}
	if u.ID == 0 {
		response.Error(c, "缺少用户ID")
		return
	}
	if err := h.svc.UpdateUserInfo(&u); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "资料已更新")
}

func (h *UserHandler) ReservationStats(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的用户ID")
		return
	}
	vo, err := h.svc.GetReservationStats(id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, vo)
}

func (h *UserHandler) MyStats(c *gin.Context) {
	uid, ok := ctxUserID64(c)
	if !ok {
		response.Unauthorized(c, "未登录")
		return
	}
	vo, err := h.svc.GetReservationStats(uid)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, vo)
}

func (h *UserHandler) ResetPasswordByEmail(c *gin.Context) {
	var dto struct {
		Email       string `json:"email" binding:"required,email"`
		Code        string `json:"code" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.ResetPasswordByEmail(dto.Email, dto.Code, dto.NewPassword); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.SuccessMsg(c, "密码已重置")
}

func (h *UserHandler) Add(c *gin.Context) {
	var u model.User
	if err := c.ShouldBindJSON(&u); err != nil {
		response.Error(c, "参数错误")
		return
	}
	if err := h.svc.AddUser(&u); err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, u)
}

func ctxUserID64(c *gin.Context) (int64, bool) {
	v, ok := c.Get(middleware.CtxUserID)
	if !ok {
		return 0, false
	}
	switch x := v.(type) {
	case int64:
		return x, true
	case float64:
		return int64(x), true
	case int:
		return int64(x), true
	case uint:
		return int64(x), true
	case uint64:
		return int64(x), true
	default:
		return 0, false
	}
}

func ctxIsAdmin(c *gin.Context) bool {
	v, _ := c.Get(middleware.CtxUserType)
	s, ok := v.(string)
	return ok && (s == "admin" || s == "super_admin")
}

func randomDigits(n int) (string, error) {
	const digits = "0123456789"
	b := make([]byte, n)
	for i := range b {
		idx, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		b[i] = digits[idx.Int64()]
	}
	return string(b), nil
}

func randomHex(n int) (string, error) {
	b := make([]byte, (n+1)/2)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	s := hex.EncodeToString(b)
	if len(s) < n {
		return s, nil
	}
	return s[:n], nil
}

// Simple 5x7 bitmap digits (coarse) for captcha PNG.
var digitBitmap = [10][7][5]bool{
	{{true, true, true, true, true}, {true, false, false, false, true}, {true, false, false, false, true}, {true, false, false, false, true}, {true, false, false, false, true}, {true, false, false, false, true}, {true, true, true, true, true}},
	{{false, false, true, false, false}, {false, true, true, false, false}, {false, false, true, false, false}, {false, false, true, false, false}, {false, false, true, false, false}, {false, false, true, false, false}, {true, true, true, true, true}},
	{{true, true, true, true, true}, {false, false, false, false, true}, {false, false, false, false, true}, {true, true, true, true, true}, {true, false, false, false, false}, {true, false, false, false, false}, {true, true, true, true, true}},
	{{true, true, true, true, true}, {false, false, false, false, true}, {false, false, false, false, true}, {true, true, true, true, true}, {false, false, false, false, true}, {false, false, false, false, true}, {true, true, true, true, true}},
	{{true, false, false, false, true}, {true, false, false, false, true}, {true, false, false, false, true}, {true, true, true, true, true}, {false, false, false, false, true}, {false, false, false, false, true}, {false, false, false, false, true}},
	{{true, true, true, true, true}, {true, false, false, false, false}, {true, false, false, false, false}, {true, true, true, true, true}, {false, false, false, false, true}, {false, false, false, false, true}, {true, true, true, true, true}},
	{{true, true, true, true, true}, {true, false, false, false, false}, {true, false, false, false, false}, {true, true, true, true, true}, {true, false, false, false, true}, {true, false, false, false, true}, {true, true, true, true, true}},
	{{true, true, true, true, true}, {false, false, false, false, true}, {false, false, false, false, true}, {false, false, false, false, true}, {false, false, false, false, true}, {false, false, false, false, true}, {false, false, false, false, true}},
	{{true, true, true, true, true}, {true, false, false, false, true}, {true, false, false, false, true}, {true, true, true, true, true}, {true, false, false, false, true}, {true, false, false, false, true}, {true, true, true, true, true}},
	{{true, true, true, true, true}, {true, false, false, false, true}, {true, false, false, false, true}, {true, true, true, true, true}, {false, false, false, false, true}, {false, false, false, false, true}, {true, true, true, true, true}},
}

func captchaPNGBase64(code string) (string, error) {
	const (
		cell = 6
		pad  = 8
	)
	w := pad*2 + len(code)*(5*cell+cell)
	h := pad*2 + 7*cell
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	bg := color.RGBA{245, 245, 245, 255}
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, bg)
		}
	}
	fg := color.RGBA{30, 30, 30, 255}
	for i, ch := range code {
		if ch < '0' || ch > '9' {
			continue
		}
		d := ch - '0'
		ox := pad + i*(6*cell)
		oy := pad
		for yy := 0; yy < 7; yy++ {
			for xx := 0; xx < 5; xx++ {
				if !digitBitmap[d][yy][xx] {
					continue
				}
				for dy := 0; dy < cell-1; dy++ {
					for dx := 0; dx < cell-1; dx++ {
						img.Set(ox+xx*cell+dx, oy+yy*cell+dy, fg)
					}
				}
			}
		}
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}
