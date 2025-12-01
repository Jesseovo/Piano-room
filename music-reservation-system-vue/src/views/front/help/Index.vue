<template>
  <div class="help-center-container">
    <!-- 顶部导航栏 -->
    <top-navbar></top-navbar>
    
    <div class="content-wrapper">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>帮助中心</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">帮助中心</h2>
      </div>

      <el-row :gutter="20">
        <!-- 左侧导航 -->
        <el-col :xs="24" :sm="6" :md="5">
          <el-card class="left-nav-card" shadow="hover">
            <div class="help-nav">
              <el-menu
                :default-active="activeMenu"
                class="help-menu"
                @select="handleMenuSelect">
                <el-menu-item index="guide">
                  <i class="el-icon-reading"></i>
                  <span>使用指南</span>
                </el-menu-item>
                <el-menu-item index="rules">
                  <i class="el-icon-document-checked"></i>
                  <span>预约规则</span>
                </el-menu-item>
                <el-menu-item index="faq">
                  <i class="el-icon-question"></i>
                  <span>常见问题</span>
                </el-menu-item>
                <el-menu-item index="contact">
                  <i class="el-icon-service"></i>
                  <span>联系我们</span>
                </el-menu-item>
              </el-menu>
            </div>
          </el-card>
        </el-col>
        
        <!-- 右侧内容 -->
        <el-col :xs="24" :sm="18" :md="19">
          <el-card class="content-card" shadow="hover">
            <!-- 使用指南 -->
            <div v-show="activeMenu === 'guide'" class="help-content">
              <h3 class="section-title"><i class="el-icon-reading icon-title"></i> 使用指南</h3>
              
              <el-collapse v-model="guideActiveNames" accordion>
                <el-collapse-item title="如何注册账号" name="1">
                  <div class="guide-content">
                    <ol>
                      <li>访问系统首页，点击右上角的"<strong>注册</strong>"按钮</li>
                      <li>填写注册表单，包括用户名、密码、电子邮箱等信息</li>
                      <li>输入发送到邮箱的验证码完成邮箱验证</li>
                      <li>阅读并同意用户协议后提交注册</li>
                      <li>注册成功后，使用新账号登录系统</li>
                    </ol>
                    <div class="guide-tips">
                      <i class="el-icon-info"></i> 注册时请使用真实信息，便于管理员审核
                    </div>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="如何查找空闲琴房" name="2">
                  <div class="guide-content">
                    <ol>
                      <li>登录系统后，点击导航栏中的"<strong>琴房预约</strong>"菜单</li>
                      <li>在左侧筛选面板中，选择所需条件（如：教学楼、容量、时间等）</li>
                      <li>点击"<strong>查询</strong>"按钮，系统将显示符合条件的空闲琴房</li>
                      <li>可以切换"<strong>卡片视图</strong>"或"<strong>列表视图</strong>"查看琴房</li>
                      <li>点击琴房的"<strong>详情</strong>"按钮可查看更多信息</li>
                    </ol>
                    <div class="guide-tips">
                      <i class="el-icon-info"></i> 建议提前查询并预约琴房，以确保满足您的需求
                    </div>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="如何预约琴房" name="3">
                  <div class="guide-content">
                    <ol>
                      <li>在琴房列表中，找到合适的琴房后点击"<strong>预约</strong>"按钮</li>
                      <li>填写预约表单，包括预约标题、时间、用途、人数等信息</li>
                      <li>根据需要选择设备需求（如投影仪、电脑等）</li>
                      <li>填写联系电话和备注信息（如有特殊需求）</li>
                      <li>点击"<strong>确认提交</strong>"按钮完成预约申请</li>
                      <li>等待管理员审核，审核结果将通过邮件通知</li>
                    </ol>
                    <div class="guide-tips">
                      <i class="el-icon-info"></i> 预约成功后，请按时使用并遵守相关规定
                    </div>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="如何查看我的预约" name="4">
                  <div class="guide-content">
                    <ol>
                      <li>登录系统后，点击导航栏中的"<strong>我的预约</strong>"菜单</li>
                      <li>系统将显示您的所有预约记录，包括待审核、已确认和已完成的预约</li>
                      <li>点击预约记录上的"<strong>查看</strong>"按钮可以查看详细信息</li>
                      <li>如需取消预约，在预约详情页点击"<strong>取消预约</strong>"按钮</li>
                    </ol>
                    <div class="guide-tips">
                      <i class="el-icon-info"></i> 请至少提前12小时取消不需要的预约，以便其他人使用
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
            
            <!-- 预约规则 -->
            <div v-show="activeMenu === 'rules'" class="help-content">
              <h3 class="section-title"><i class="el-icon-document-checked icon-title"></i> 预约规则</h3>
              
              <div class="rules-content">
                <div class="rule-section">
                  <h4 class="rule-title">预约资格</h4>
                  <ol>
                    <li>本校音乐院学生、教师均有资格使用琴房预约系统</li>
                    <li>学生需使用有效学生账号登录系统，并完成实名认证</li>
                    <li>教师和行政人员需使用校园统一身份认证登录</li>
                    <li>外部人员如需使用琴房，请联系教务处办理相关手续</li>
                  </ol>
                </div>
                
                <el-divider content-position="left">预约时间规定</el-divider>
                
                <div class="rule-section">
                  <h4 class="rule-title">预约时间规定</h4>
                  <ol>
                    <li>琴房预约开放时间为每日 8:00 至 22:00</li>
                    <li>系统支持提前7天预约（教师可提前14天）</li>
                    <li>单次预约时长一般不超过4小时，特殊需求请联系管理员</li>
                    <li>预约申请需至少提前24小时提交（紧急情况请联系教务处）</li>
                  </ol>
                </div>
                
                <el-divider content-position="left">优先级规则</el-divider>
                
        
                
                <el-divider content-position="left">取消与违规规定</el-divider>
                
                <div class="rule-section">
                  <h4 class="rule-title">取消与违规规定</h4>
                  <ol>
                    <li>如需取消预约，请至少提前12小时操作</li>
                    <li>一个月内三次无故未使用已预约琴房，将被限制预约资格30天</li>
                    <li>严禁将预约琴房用于商业活动或违反校规校纪的活动</li>
                    <li>使用琴房时请保持安静，爱护设施设备，保持环境整洁</li>
                    <li>使用完毕后请关闭电器、门窗，带走个人物品</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <!-- 常见问题 -->
            <div v-show="activeMenu === 'faq'" class="help-content">
              <h3 class="section-title"><i class="el-icon-question icon-title"></i> 常见问题</h3>
              
              <el-collapse v-model="faqActiveNames" accordion>
                <el-collapse-item title="忘记密码怎么办？" name="1">
                  <div class="faq-answer">
                    <p>如果您忘记了账号密码，可以通过以下步骤找回：</p>
                    <ol>
                      <li>联系管理员重置密码</li>
                    </ol>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="预约申请一直没有审核怎么办？" name="2">
                  <div class="faq-answer">
                    <p>正常情况下，预约申请会在24小时内完成审核。如果您的申请长时间未得到回应，可以：</p>
                    <ul>
                      <li>检查您的邮箱是否收到通知（包括垃圾邮件文件夹）</li>
                      <li>登录系统查看预约状态是否已更新</li>
                      <li>联系教务处询问审核进度</li>
                    </ul>
                    <p>紧急情况下，可直接致电教务处：<strong>0XX-XXXXXXXX</strong></p>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="为什么我无法预约特定琴房？" name="3">
                  <div class="faq-answer">
                    <p>无法预约特定琴房可能有以下原因：</p>
                    <ul>
                      <li>该琴房已被他人预约</li>
                      <li>该琴房被用于固定课程教学</li>
                      <li>该琴房正在维护或升级设备</li>
                      <li>您的用户权限不足（某些特殊功能琴房可能有权限限制）</li>
                      <li>您已达到个人预约限额</li>
                    </ul>
                    <p>如需了解具体原因，可联系管理员查询。</p>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="如何修改个人信息和联系方式？" name="4">
                  <div class="faq-answer">
                    <p>您可以在个人中心修改基本信息和联系方式：</p>
                    <ol>
                      <li>登录系统后，点击右上角的用户头像或用户名</li>
                      <li>在下拉菜单中选择"<strong>个人中心</strong>"</li>
                      <li>在个人资料页面，点击"<strong>编辑</strong>"按钮</li>
                      <li>修改相关信息后点击"<strong>保存</strong>"即可</li>
                    </ol>
                    <p>注意：用户名一旦设置不可修改，学工号也无法自行修改。</p>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="系统显示的琴房信息与实际不符怎么办？" name="5">
                  <div class="faq-answer">
                    <p>如果您发现系统中显示的琴房信息（如设备、容量等）与实际情况不符，请：</p>
                    <ul>
                      <li>通过系统内的"<strong>反馈</strong>"功能提交问题报告</li>
                      <li>尽可能详细描述不符之处，可附上照片</li>
                      <li>留下您的联系方式，以便管理员回复</li>
                    </ul>
                    <p>我们将尽快核实并更新琴房信息，感谢您的反馈！</p>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
            
            <!-- 联系我们 -->
            <div v-show="activeMenu === 'contact'" class="help-content">
              <h3 class="section-title"><i class="el-icon-service icon-title"></i> 联系我们</h3>
              
              <div class="contact-content">
                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="el-icon-office-building"></i>
                  </div>
                  <div class="contact-info">
                    <h4>琴房预约管理办公室</h4>
                    <p>地址：行政楼 203 室</p>
                    <p>办公时间：周一至周五 9:00-17:00</p>
                  </div>
                </div>
                
                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="el-icon-phone"></i>
                  </div>
                  <div class="contact-info">
                    <h4>联系电话</h4>
                    <p>预约咨询：0XX-XXXXXXXX</p>
                    <p>技术支持：0XX-XXXXXXXX</p>
                  </div>
                </div>
                
                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="el-icon-message"></i>
                  </div>
                  <div class="contact-info">
                    <h4>电子邮箱</h4>
                    <p>预约咨询：booking@example.edu.cn</p>
                    <p>技术支持：support@example.edu.cn</p>
                  </div>
                </div>
                
                <div class="contact-item">
                  <div class="contact-icon">
                    <i class="el-icon-chat-dot-square"></i>
                  </div>
                  <div class="contact-info">
                    <h4>在线客服</h4>
                    <p>工作日：9:00-21:00</p>
                    <p>周末及节假日：10:00-18:00</p>
                    <el-button type="primary" size="small" class="contact-btn">
                      <i class="el-icon-service"></i> 在线咨询
                    </el-button>
                  </div>
                </div>
                
                <!-- 快速反馈功能已移除 -->
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 页脚 -->
    <FooterBar />
  </div>
</template>

<script>
import TopNavbar from '@/views/front/components/TopNavbar.vue';
import FooterBar from '@/views/front/components/FooterBar.vue';

export default {
  name: 'HelpCenter',
  components: {
    TopNavbar,
    FooterBar
  },
  data() {
    return {
      // 当前激活的菜单
      activeMenu: 'guide',
      
      // 使用指南折叠面板激活项
      guideActiveNames: ['1'],
      
      // 常见问题折叠面板激活项
      faqActiveNames: ['1']
    };
  },
  created() {
    // 从URL参数中获取初始菜单
    const section = this.$route.query.section;
    if (section && ['guide', 'rules', 'faq', 'contact'].includes(section)) {
      this.activeMenu = section;
    }
  },
  methods: {
    /**
     * 处理菜单选择
     * @param {string} index - 选中的菜单项
     */
    handleMenuSelect(index) {
      this.activeMenu = index;
      
      // 如果当前section参数已经是index，则不需要导航
      if (this.$route.query.section === index) {
        return;
      }
      
      // 更新URL参数
      this.$router.push({
        query: { ...this.$route.query, section: index }
      }).catch(err => {
        // 忽略NavigationDuplicated错误
        if (err.name !== 'NavigationDuplicated') {
          // 如果是其他类型的错误，则抛出
          throw err;
        }
      });
    },
    
    /**
     * 跳转到反馈页面
     */
    // 反馈功能已移除
  }
};
</script>

<style scoped>
.help-center-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
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

.left-nav-card,
.content-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.left-nav-card {
  animation: slideLeft 0.5s ease-in-out;
}

.content-card {
  animation: slideRight 0.5s ease-in-out;
}

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.help-menu {
  border-right: none;
}

.section-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  display: flex;
  align-items: center;
}

.icon-title {
  margin-right: 8px;
  color: #409EFF;
}

.help-content {
  padding: 10px;
}

/* 使用指南样式 */
.guide-content {
  padding: 10px 0;
}

.guide-content ol {
  padding-left: 20px;
}

.guide-content li {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.6;
}

.guide-tips {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
  color: #67c23a;
  display: flex;
  align-items: center;
}

.guide-tips i {
  margin-right: 5px;
  font-size: 16px;
}

/* 预约规则样式 */
.rules-content {
  padding: 10px 0;
}

.rule-section {
  margin-bottom: 20px;
}

.rule-title {
  color: #409EFF;
  margin-bottom: 15px;
  font-size: 16px;
}

.rules-content ol {
  padding-left: 20px;
}

.rules-content li {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.6;
}

/* 常见问题样式 */
.faq-answer {
  color: #606266;
  line-height: 1.6;
}

.faq-answer p {
  margin-bottom: 10px;
}

.faq-answer ul,
.faq-answer ol {
  padding-left: 20px;
  margin-bottom: 10px;
}

.faq-answer li {
  margin-bottom: 5px;
}

/* 联系我们样式 */
.contact-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-item {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.contact-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.contact-icon {
  width: 60px;
  height: 60px;
  background-color: #ecf5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.contact-icon i {
  font-size: 30px;
  color: #409EFF;
}

.contact-info {
  flex: 1;
}

.contact-info h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
  font-size: 16px;
}

.contact-info p {
  margin: 5px 0;
  color: #606266;
}

.contact-btn {
  margin-top: 10px;
}

.contact-feedback {
  background-color: #f0f9eb;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 10px;
}

.contact-feedback h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #67c23a;
  font-size: 16px;
}

.contact-feedback p {
  margin-bottom: 15px;
  color: #606266;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 10px;
  }
  
  .contact-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .contact-icon {
    margin-right: 0;
    margin-bottom: 15px;
  }
}
</style> 