package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Result struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Result{Code: 1, Msg: "success", Data: data})
}

func SuccessMsg(c *gin.Context, msg string) {
	c.JSON(http.StatusOK, Result{Code: 1, Msg: msg})
}

func Error(c *gin.Context, msg string) {
	c.JSON(http.StatusOK, Result{Code: 0, Msg: msg})
}

func ErrorWithCode(c *gin.Context, httpCode int, msg string) {
	c.JSON(httpCode, Result{Code: 0, Msg: msg})
}

func Unauthorized(c *gin.Context, msg string) {
	c.JSON(http.StatusUnauthorized, Result{Code: 401, Msg: msg})
	c.Abort()
}

func PageData(c *gin.Context, total int64, rows interface{}) {
	c.JSON(http.StatusOK, Result{
		Code: 1,
		Msg:  "success",
		Data: gin.H{"total": total, "rows": rows},
	})
}
