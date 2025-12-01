<template>
  <div class="about-container">
    <!-- 顶部导航栏 -->
    <top-navbar></top-navbar>
    
    <div class="content-wrapper">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>关于我们</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">关于我们</h2>
      </div>

      <!-- 介绍板块 -->
      <el-card class="about-card" shadow="hover">
        <div class="about-header">
          <div class="logo-container">
            <img src="@/assets/images/logo.png" alt="琴房预约系统" class="about-logo">
          </div>
          <div class="system-info">
            <h3 class="system-name">琴房预约系统</h3>
            <div class="system-version">
              <span class="version-label">当前版本：</span>
              <el-tag type="success" size="small">v1.0.0</el-tag>
            </div>
            <p class="system-slogan">为师生提供便捷高效的琴房资源预约平台</p>
          </div>
        </div>
        
        <el-divider></el-divider>
        
        <div class="introduction-section">
          <h4 class="section-title"><i class="el-icon-info-circle"></i> 系统简介</h4>
          <div class="section-content">
            <p>琴房预约系统是一款专为高校打造的智能琴房资源管理平台，旨在提高琴房资源利用效率，简化预约流程，为师生提供便捷的琴房预约服务。</p>
            <p>本系统支持多种琴房类型管理，包括普通琴房、多媒体琴房、实验室、会议室等，用户可根据自身需求灵活筛选和预约。系统采用了响应式设计，兼容PC端和移动端，使用户随时随地都能便捷地进行琴房预约操作。</p>
          </div>
        </div>
        
        <div class="feature-section">
          <h4 class="section-title"><i class="el-icon-star-on"></i> 核心功能</h4>
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">
                <i class="el-icon-search"></i>
              </div>
              <div class="feature-info">
                <h5>智能查询</h5>
                <p>多条件筛选，快速定位符合需求的空闲琴房</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="el-icon-date"></i>
              </div>
              <div class="feature-info">
                <h5>在线预约</h5>
                <p>简化预约流程，支持批量预约和重复预约</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="el-icon-bell"></i>
              </div>
              <div class="feature-info">
                <h5>智能提醒</h5>
                <p>预约结果通知、使用前提醒、即将到期提醒</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="el-icon-data-analysis"></i>
              </div>
              <div class="feature-info">
                <h5>数据统计</h5>
                <p>琴房使用率分析，助力资源优化配置</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="el-icon-user"></i>
              </div>
              <div class="feature-info">
                <h5>角色管理</h5>
                <p>多角色权限分配，满足不同用户的使用需求</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="el-icon-mobile-phone"></i>
              </div>
              <div class="feature-info">
                <h5>响应式设计</h5>
                <p>PC端和移动端自适应，随时随地便捷操作</p>
              </div>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 开发团队 -->
      <el-card class="about-card team-card" shadow="hover">
        <div class="team-header">
          <h4 class="section-title"><i class="el-icon-user-solid"></i> 开发团队</h4>
          <p class="team-intro">我们是一支充满激情的创新团队，致力于通过技术手段解决校园管理中的实际问题。</p>
        </div>
        
        <div class="team-members">
          <div class="member-card">
            <div class="member-avatar">
              <i class="el-icon-user-solid"></i>
            </div>
            <div class="member-info">
              <h5 class="member-name">张三</h5>
              <p class="member-role">项目负责人</p>
              <p class="member-desc">负责项目整体规划与架构设计</p>
            </div>
          </div>
          
          <div class="member-card">
            <div class="member-avatar">
              <i class="el-icon-user-solid"></i>
            </div>
            <div class="member-info">
              <h5 class="member-name">李四</h5>
              <p class="member-role">前端开发工程师</p>
              <p class="member-desc">负责用户界面设计与前端功能实现</p>
            </div>
          </div>
          
          <div class="member-card">
            <div class="member-avatar">
              <i class="el-icon-user-solid"></i>
            </div>
            <div class="member-info">
              <h5 class="member-name">王五</h5>
              <p class="member-role">后端开发工程师</p>
              <p class="member-desc">负责系统后端架构与业务实现</p>
            </div>
          </div>
          
          <div class="member-card">
            <div class="member-avatar">
              <i class="el-icon-user-solid"></i>
            </div>
            <div class="member-info">
              <h5 class="member-name">赵六</h5>
              <p class="member-role">UI设计师</p>
              <p class="member-desc">负责系统界面设计与用户体验优化</p>
            </div>
          </div>
          
          <div class="member-card">
            <div class="member-avatar">
              <i class="el-icon-user-solid"></i>
            </div>
            <div class="member-info">
              <h5 class="member-name">钱七</h5>
              <p class="member-role">测试工程师</p>
              <p class="member-desc">负责系统功能测试与质量保障</p>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 系统版本历史 -->
      <el-card class="about-card version-card" shadow="hover">
        <h4 class="section-title"><i class="el-icon-time"></i> 版本历史</h4>
        
        <el-timeline>
          <el-timeline-item
            timestamp="2025年5月1日"
            placement="top"
            type="success">
            <el-card class="version-item">
              <h5>v1.0.0 正式版</h5>
              <ul class="version-features">
                <li>系统正式上线，支持基础琴房预约功能</li>
                <li>实现全部核心功能，包括琴房查询、预约、审核流程</li>
                <li>完善用户权限管理，支持多角色分配</li>
                <li>优化系统性能和用户体验</li>
              </ul>
            </el-card>
          </el-timeline-item>
          
          <el-timeline-item
            timestamp="2025年4月15日"
            placement="top"
            type="warning">
            <el-card class="version-item">
              <h5>v0.9.0 Beta版</h5>
              <ul class="version-features">
                <li>完成系统功能开发，进入Beta测试阶段</li>
                <li>开放部分学院师生参与内测，收集用户反馈</li>
                <li>修复了大量Bug，系统稳定性大幅提升</li>
                <li>优化移动端适配体验</li>
              </ul>
            </el-card>
          </el-timeline-item>
          
          <el-timeline-item
            timestamp="2025年3月10日"
            placement="top"
            type="primary">
            <el-card class="version-item">
              <h5>v0.5.0 Alpha版</h5>
              <ul class="version-features">
                <li>完成系统基础架构搭建</li>
                <li>实现用户管理、琴房管理等核心模块</li>
                <li>初步完成预约流程开发</li>
                <li>系统进入内部测试阶段</li>
              </ul>
            </el-card>
          </el-timeline-item>
          
          <el-timeline-item
            timestamp="2025年2月1日"
            placement="top"
            type="info">
            <el-card class="version-item">
              <h5>v0.1.0 概念设计</h5>
              <ul class="version-features">
                <li>完成需求分析与市场调研</li>
                <li>确定系统整体架构和技术选型</li>
                <li>完成UI设计和原型图制作</li>
                <li>项目正式启动开发</li>
              </ul>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>
      
      <!-- 联系与反馈 -->
      <el-card class="about-card contact-card" shadow="hover">
        <h4 class="section-title"><i class="el-icon-message"></i> 联系与反馈</h4>
        
        <div class="contact-content">
          <p class="contact-intro">我们非常重视您的使用体验和反馈意见。如有任何问题、建议或合作意向，欢迎通过以下方式联系我们：</p>
          
          <div class="contact-info-grid">
            <div class="contact-info-item">
              <i class="el-icon-message"></i>
              <span>电子邮箱：contact@example.edu.cn</span>
            </div>
            
            <div class="contact-info-item">
              <i class="el-icon-phone"></i>
              <span>联系电话：0XX-XXXXXXXX</span>
            </div>
            
            <div class="contact-info-item">
              <i class="el-icon-office-building"></i>
              <span>办公地址：XX大学信息中心二楼201室</span>
            </div>
            
            <div class="contact-info-item">
              <i class="el-icon-document"></i>
              <span>技术支持：support@example.edu.cn</span>
            </div>
          </div>
          
          <div class="quick-actions">
            <el-button type="primary" @click="goToFeedback">
              <i class="el-icon-edit"></i> 提交反馈
            </el-button>
            
            <el-button type="success" @click="goToHelp">
              <i class="el-icon-question"></i> 帮助中心
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 页脚 -->
    <FooterBar />
  </div>
</template>

<script>
import TopNavbar from '@/views/front/components/TopNavbar.vue';
import FooterBar from '@/views/front/components/FooterBar.vue';

export default {
  name: 'AboutUs',
  components: {
    TopNavbar,
    FooterBar
  },
  data() {
    return {
      // 系统信息
      systemInfo: {
        version: 'v1.0.0',
        releaseDate: '2025年5月1日',
        copyright: '© 2025 琴房预约系统开发团队'
      }
    };
  },
  methods: {
    /**
     * 跳转到反馈页面
     */
    goToFeedback() {
      this.$router.push('/feedback');
    },
    
    /**
     * 跳转到帮助中心
     */
    goToHelp() {
      this.$router.push('/help');
    }
  }
};
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 20px;
  background-color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-title {
  margin-top: 15px;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
  position: relative;
  padding-left: 12px;
}

.page-title:before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  width: 4px;
  background-color: #409EFF;
  border-radius: 2px;
}

.about-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  animation: slideUp 0.5s ease-in-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.about-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.logo-container {
  width: 80px;
  height: 80px;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-logo {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.system-info {
  flex: 1;
}

.system-name {
  font-size: 24px;
  margin: 0 0 10px 0;
  color: #303133;
}

.system-version {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.version-label {
  margin-right: 5px;
  color: #909399;
}

.system-slogan {
  color: #606266;
  margin: 0;
}

.section-title {
  display: flex;
  align-items: center;
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
  font-size: 18px;
}

.section-title i {
  margin-right: 8px;
  color: #409EFF;
}

.section-content {
  color: #606266;
  line-height: 1.8;
}

.section-content p {
  margin-bottom: 15px;
}

/* 功能特点样式 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.feature-item {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  background-color: #ecf5ff;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background-color: #409EFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.feature-icon i {
  font-size: 20px;
  color: white;
}

.feature-info {
  flex: 1;
}

.feature-info h5 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.feature-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

/* 团队卡片样式 */
.team-header {
  margin-bottom: 20px;
}

.team-intro {
  color: #606266;
  margin: 10px 0 0 0;
}

.team-members {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.member-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.member-avatar {
  width: 70px;
  height: 70px;
  background-color: #ecf5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.member-avatar i {
  font-size: 30px;
  color: #409EFF;
}

.member-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.member-role {
  color: #409EFF;
  font-size: 14px;
  margin: 0 0 10px 0;
}

.member-desc {
  color: #606266;
  font-size: 13px;
  margin: 0;
  line-height: 1.4;
}

/* 版本历史样式 */
.version-features {
  padding-left: 20px;
  margin: 10px 0 0 0;
}

.version-features li {
  margin-bottom: 5px;
  color: #606266;
}

/* 联系卡片样式 */
.contact-intro {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
}

.contact-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.contact-info-item {
  display: flex;
  align-items: center;
  color: #606266;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 10px 15px;
}

.contact-info-item i {
  margin-right: 10px;
  color: #409EFF;
  font-size: 18px;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 10px;
  }
  
  .about-header {
    flex-direction: column;
    text-align: center;
  }
  
  .logo-container {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .team-members {
    grid-template-columns: 1fr;
  }
  
  .contact-info-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .quick-actions .el-button {
    margin-bottom: 10px;
  }
}
</style> 