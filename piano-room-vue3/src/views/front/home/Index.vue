<template>
  <div class="home-page">
    <!-- ===== Hero 区 ===== -->
    <section class="hero-section">
      <div class="hero-content page-container">
        <div class="hero-text animate-fade-in-up">
          <div class="hero-badge">在线预约平台</div>
          <h1 class="hero-title">{{ systemName }}</h1>
          <p class="hero-desc">实时查看琴房空闲情况，随时预约属于你的练琴时光<br>即时生效，无需等待审核</p>
          <div class="hero-actions">
            <el-button size="large" type="primary" class="btn-book" @click="router.push('/rooms')">
              <el-icon><Calendar /></el-icon>
              立即预约
            </el-button>
            <el-button size="large" class="btn-secondary" @click="router.push('/help')">
              了解更多
            </el-button>
          </div>
        </div>
        <!-- 右侧状态卡片 -->
        <div class="hero-stats animate-stagger">
          <div class="stat-card">
            <div class="stat-icon-wrap blue">
              <el-icon size="24"><House /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-num">{{ bookingStatus.total }}</div>
              <div class="stat-label">总琴房数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap green">
              <el-icon size="24"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-num">{{ bookingStatus.available }}</div>
              <div class="stat-label">今日可预约</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap orange">
              <el-icon size="24"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-num">{{ bookingStatus.booked }}</div>
              <div class="stat-label">今日已预约</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 今日热门琴房 ===== -->
    <section class="hot-rooms-section">
      <div class="page-container">
        <div class="section-head">
          <div>
            <h2 class="section-title">热门琴房</h2>
            <p class="section-sub">当前最受欢迎的练习空间</p>
          </div>
          <el-button link type="primary" @click="router.push('/rooms')">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>

        <el-skeleton v-if="hotLoading" :rows="3" animated style="margin-top:20px" />

        <div v-else-if="hotRooms.length === 0">
          <el-empty description="暂无热门数据" :image-size="80" />
        </div>

        <div v-else class="hot-rooms-grid animate-stagger">
          <div
            v-for="room in hotRooms"
            :key="room.id"
            class="room-card"
            @click="router.push(`/rooms/${room.id}`)"
          >
            <div class="room-card-head">
              <div class="room-icon">🎹</div>
              <el-tag v-if="room.reservationCount > 0" size="small" type="danger" class="hot-tag">
                热门
              </el-tag>
            </div>
            <div class="room-card-body">
              <h3 class="room-name">{{ room.name }}</h3>
              <div class="room-meta">
                <span><el-icon><Location /></el-icon> {{ room.floor ? room.floor + '层' : '综合楼' }}</span>
                <span><el-icon><User /></el-icon> {{ room.capacity || 1 }} 人</span>
              </div>
            </div>
            <div class="room-card-footer">
              <el-tag size="small" type="success">可预约</el-tag>
              <el-button size="small" type="primary" text class="book-link" @click.stop="router.push(`/reservations/create/${room.id}`)">
                立即预约 →
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 预约流程 ===== -->
    <section class="flow-section">
      <div class="page-container">
        <div class="section-head center">
          <h2 class="section-title">如何预约</h2>
          <p class="section-sub">四个步骤，轻松完成预约</p>
        </div>
        <div class="flow-steps animate-stagger">
          <div class="flow-step" v-for="(step, i) in steps" :key="step.title">
            <div class="step-num-wrap" :class="step.color">
              <span class="step-num-txt">0{{ i + 1 }}</span>
            </div>
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-title">{{ step.title }}</div>
            <div class="step-desc">{{ step.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 使用须知 ===== -->
    <section class="notice-section">
      <div class="page-container">
        <div class="section-head">
          <h2 class="section-title">使用须知</h2>
        </div>
        <div class="notice-grid animate-stagger">
          <div class="notice-card" v-for="rule in rules" :key="rule.title">
            <div class="notice-icon">{{ rule.icon }}</div>
            <h4 class="notice-title">{{ rule.title }}</h4>
            <ul class="notice-list">
              <li v-for="item in rule.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { roomApi } from '@/api/room'
import { useSettingsStore } from '@/stores/settings'
import request from '@/utils/request'

const router = useRouter()
const settingsStore = useSettingsStore()
const hotRooms = ref<any[]>([])
const hotLoading = ref(true)

const systemName = computed(() => settingsStore.basicSettings?.systemName || '皮埃诺预约系统')

const bookingStatus = ref({ booked: 0, available: 0, total: 0 })

const steps = [
  { title: '登录账号', desc: '使用学号登录系统', icon: '👤', color: 'blue' },
  { title: '选择琴房', desc: '查看空闲时段与设施', icon: '🔍', color: 'purple' },
  { title: '提交预约', desc: '填写信息即时生效', icon: '📝', color: 'green' },
  { title: '签到使用', desc: '按时签到，愉快练琴', icon: '✅', color: 'orange' },
]

const rules = [
  {
    icon: '📅',
    title: '预约规则',
    items: ['需使用学校统一认证账号登录', '提交预约后即时生效，无需等待审核', '预约后 10 分钟内须签到，超时标记违约'],
  },
  {
    icon: '🎼',
    title: '使用规范',
    items: ['请保持琴房整洁，禁止饮食', '使用完毕关闭电源、门窗', '遇设备故障请及时联系管理员'],
  },
  {
    icon: '⚠️',
    title: '违约说明',
    items: ['第 1 次违约：系统警告提示', '第 2 次违约：封禁 7 天', '第 3 次违约：封禁 30 天'],
  },
]

async function loadBookingStatus() {
  try {
    const res = await request.get('/reports/bookingOverview')
    if (res?.data) {
      const { bookedToday, availableToday } = res.data
      bookingStatus.value = {
        booked: bookedToday ?? 0,
        available: availableToday ?? 0,
        total: (bookedToday ?? 0) + (availableToday ?? 0),
      }
    }
  } catch { /* 静默失败 */ }
}

async function loadHotRooms() {
  hotLoading.value = true
  try {
    const res = await roomApi.getHotToday(6)
    if (res?.code === 1) hotRooms.value = Array.isArray(res.data) ? res.data : []
  } catch {
    hotRooms.value = []
  } finally {
    hotLoading.value = false
  }
}

onMounted(() => {
  loadBookingStatus()
  loadHotRooms()
})
</script>

<style scoped>
/* ===== Hero 区 - Y2K 风格 ===== */
.hero-section {
  background: var(--y2k-bg-dark);
  border-bottom: 4px solid var(--y2k-border);
  box-shadow: 0 4px 0px var(--y2k-shadow);
  padding: 72px 0 80px;
  position: relative;
  overflow: hidden;
}
.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 3px,
    rgba(45,0,102,0.04) 3px, rgba(45,0,102,0.04) 4px
  );
  pointer-events: none;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  flex-wrap: wrap;
}

.hero-text { max-width: 520px; }

.hero-badge {
  display: inline-block;
  font-family: var(--y2k-font-pixel);
  font-size: 12px;
  padding: 4px 14px;
  background: var(--y2k-accent-pink);
  color: white;
  border: 2px solid var(--y2k-accent-pink-dark);
  box-shadow: 3px 3px 0 var(--y2k-shadow);
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.hero-title {
  font-family: var(--y2k-font-pixel);
  font-size: clamp(24px, 3.5vw, 38px);
  font-weight: 400;
  color: var(--y2k-text);
  line-height: 1.3;
  margin-bottom: 16px;
  text-shadow: 3px 3px 0px var(--y2k-accent-pink);
}

.hero-desc {
  font-size: 15px;
  color: var(--y2k-text-secondary);
  line-height: 1.75;
  margin-bottom: 36px;
  font-family: var(--y2k-font-body);
}

.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

.btn-book {
  height: 46px !important;
  padding: 0 28px !important;
  font-family: var(--y2k-font-pixel) !important;
  font-size: 14px !important;
  background: var(--y2k-accent-pink) !important;
  color: white !important;
  border: 2px solid var(--y2k-accent-pink-dark) !important;
  box-shadow: 4px 4px 0 var(--y2k-shadow) !important;
  border-radius: 0 !important;
}
.btn-book:hover {
  background: var(--y2k-accent-cyan) !important;
  border-color: var(--y2k-accent-cyan-dark) !important;
  transform: translate(2px, 2px) !important;
  box-shadow: 2px 2px 0 var(--y2k-shadow) !important;
}

.btn-secondary {
  height: 46px !important;
  padding: 0 24px !important;
  font-family: var(--y2k-font-pixel) !important;
  font-size: 14px !important;
  background: var(--y2k-bg) !important;
  border: 2px solid var(--y2k-border) !important;
  color: var(--y2k-text) !important;
  box-shadow: 3px 3px 0 var(--y2k-shadow) !important;
  border-radius: 0 !important;
}
.btn-secondary:hover {
  background: var(--y2k-bg-dark) !important;
  transform: translate(1px, 1px) !important;
  box-shadow: 2px 2px 0 var(--y2k-shadow) !important;
}

/* 右侧状态卡片组 */
.hero-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stat-card {
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 4px 4px 0 var(--y2k-shadow);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
  transition: all 0.2s;
}
.stat-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--y2k-shadow);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 0;
  border: 2px solid var(--y2k-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.stat-icon-wrap.blue { background: rgba(255,255,255,0.25); }
.stat-icon-wrap.green { background: rgba(16,185,129,0.35); }
.stat-icon-wrap.orange { background: rgba(245,158,11,0.35); }

.stat-num {
  font-family: var(--y2k-font-pixel);
  font-size: 28px;
  color: var(--y2k-text);
  text-shadow: 2px 2px 0 var(--y2k-accent-pink);
  line-height: 1.1;
}

.stat-label {
  font-size: 13px;
  color: var(--y2k-text-muted);
  margin-top: 2px;
  font-family: var(--y2k-font-body);
}

/* ===== 通用节样式 ===== */
.hot-rooms-section { padding: 60px 0; background: var(--y2k-bg); }
.flow-section { padding: 60px 0; background: var(--y2k-bg-dark); }
.notice-section { padding: 60px 0; background: var(--y2k-bg); }

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}
.section-head.center {
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-family: var(--y2k-font-pixel);
  font-size: 22px;
  font-weight: 400;
  color: var(--y2k-text);
  text-shadow: 2px 2px 0 var(--y2k-accent-pink);
  margin-bottom: 4px;
}

.section-sub {
  font-size: 14px;
  color: var(--y2k-text-muted);
}

/* ===== 热门琴房卡片 ===== */
.hot-rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}

.room-card {
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 4px 4px 0 var(--y2k-shadow);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  border-radius: 0;
}
.room-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: var(--y2k-accent-pink);
}
.room-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--y2k-shadow);
  border-color: var(--y2k-accent-pink);
}

.room-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-icon { font-size: 28px; }

.room-card-body { flex: 1; }

.room-name {
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  font-weight: 400;
  color: var(--y2k-text);
  text-shadow: 1px 1px 0 var(--y2k-accent-pink);
  margin-bottom: 8px;
}

.room-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--y2k-text-muted);
}
.room-meta span { display: flex; align-items: center; gap: 3px; }

.room-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid var(--y2k-border);
  padding-top: 12px;
}

.book-link {
  padding: 0 !important;
  font-size: 13px !important;
  color: var(--y2k-accent-pink) !important;
  font-family: var(--y2k-font-pixel) !important;
}

/* ===== 预约流程 ===== */
.flow-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  position: relative;
}

.flow-step {
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 4px 4px 0 var(--y2k-shadow);
  padding: 28px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  cursor: default;
  border-radius: 0;
}
.flow-step:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--y2k-shadow);
  border-color: var(--y2k-accent-cyan);
}

.step-num-wrap {
  width: 40px;
  height: 40px;
  border: 2px solid var(--y2k-border);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
}
.step-num-wrap.blue { background: var(--y2k-accent-pink); }
.step-num-wrap.purple { background: var(--y2k-accent-cyan); }
.step-num-wrap.green { background: #32cd32; }
.step-num-wrap.orange { background: #ffd700; }

.step-num-txt {
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  font-weight: 400;
  color: white;
}
.step-num-wrap.purple .step-num-txt { color: white; }
.step-num-wrap.green .step-num-txt { color: white; }
.step-num-wrap.orange .step-num-txt { color: var(--y2k-text); }

.step-icon { font-size: 28px; }
.step-title { font-family: var(--y2k-font-pixel); font-size: 14px; font-weight: 400; color: var(--y2k-text); text-shadow: 1px 1px 0 var(--y2k-accent-pink); }
.step-desc { font-size: 13px; color: var(--y2k-text-muted); line-height: 1.5; }

/* ===== 使用须知 ===== */
.notice-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.notice-card {
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 4px 4px 0 var(--y2k-shadow);
  padding: 24px;
  border-radius: 0;
  transition: all 0.2s ease;
}
.notice-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--y2k-shadow);
  border-color: var(--y2k-accent-cyan);
}

.notice-icon { font-size: 28px; margin-bottom: 12px; }
.notice-title { font-family: var(--y2k-font-pixel); font-size: 15px; font-weight: 400; color: var(--y2k-text); margin-bottom: 12px; text-shadow: 1px 1px 0 var(--y2k-accent-pink); }
.notice-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.notice-list li {
  font-size: 13px;
  color: var(--y2k-text-muted);
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.5;
}
.notice-list li::before {
  content: '·';
  color: var(--color-primary);
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .flow-steps { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .hero-section { padding: 48px 0 56px; }
  .hero-content { flex-direction: column; gap: 32px; }
  .hero-stats { flex-direction: row; flex-wrap: wrap; justify-content: center; }
  .stat-card { min-width: 140px; flex: 1; }
  .hot-rooms-grid { grid-template-columns: 1fr; }
  .flow-steps { grid-template-columns: 1fr; }
  .notice-grid { grid-template-columns: 1fr; }
  .section-head { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
