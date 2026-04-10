package cache

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/jiaxin-room/jiaxin-room-api/internal/config"
	"github.com/redis/go-redis/v9"
)

var RDB *redis.Client

func InitRedis(cfg *config.RedisConfig) {
	RDB = redis.NewClient(&redis.Options{
		Addr:     cfg.Addr(),
		Password: cfg.Password,
		DB:       cfg.DB,
	})
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := RDB.Ping(ctx).Err(); err != nil {
		log.Printf("WARNING: Redis connection failed: %v (caching disabled)", err)
		RDB = nil
		return
	}
	log.Println("Redis connected successfully")
}

// Cache key prefixes
const (
	PrefixRoom        = "room:"
	PrefixRoomList    = "room:list"
	PrefixRoomHot     = "room:hot"
	PrefixAvailSlots  = "avail:"
	PrefixSettings    = "settings:"
	PrefixRateLimit   = "ratelimit:"
	PrefixLock        = "lock:"
)

func Available() bool {
	return RDB != nil
}

func Get(ctx context.Context, key string, dest interface{}) error {
	if !Available() {
		return fmt.Errorf("redis not available")
	}
	val, err := RDB.Get(ctx, key).Result()
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(val), dest)
}

func Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if !Available() {
		return nil
	}
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return RDB.Set(ctx, key, data, ttl).Err()
}

func Del(ctx context.Context, keys ...string) error {
	if !Available() {
		return nil
	}
	return RDB.Del(ctx, keys...).Err()
}

func DelPattern(ctx context.Context, pattern string) error {
	if !Available() {
		return nil
	}
	iter := RDB.Scan(ctx, 0, pattern, 100).Iterator()
	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}
	if len(keys) > 0 {
		return RDB.Del(ctx, keys...).Err()
	}
	return nil
}

// AcquireLock tries to acquire a distributed lock
func AcquireLock(ctx context.Context, key string, ttl time.Duration) (bool, error) {
	if !Available() {
		return true, nil // no redis = no lock needed, proceed
	}
	return RDB.SetNX(ctx, PrefixLock+key, "1", ttl).Result()
}

// ReleaseLock releases a distributed lock
func ReleaseLock(ctx context.Context, key string) error {
	if !Available() {
		return nil
	}
	return RDB.Del(ctx, PrefixLock+key).Err()
}

// RateLimit checks if a request should be rate limited (sliding window)
func RateLimit(ctx context.Context, key string, limit int, window time.Duration) (bool, error) {
	if !Available() {
		return false, nil
	}
	now := time.Now().UnixMilli()
	pipe := RDB.Pipeline()
	rlKey := PrefixRateLimit + key

	var rnd [8]byte
	_, _ = rand.Read(rnd[:])
	member := fmt.Sprintf("%d-%s", now, hex.EncodeToString(rnd[:]))

	pipe.ZRemRangeByScore(ctx, rlKey, "0", fmt.Sprintf("%d", now-window.Milliseconds()))
	pipe.ZAdd(ctx, rlKey, redis.Z{Score: float64(now), Member: member})
	pipe.ZCard(ctx, rlKey)
	pipe.Expire(ctx, rlKey, window)

	results, err := pipe.Exec(ctx)
	if err != nil {
		return false, err
	}

	count := results[2].(*redis.IntCmd).Val()
	return count > int64(limit), nil
}
