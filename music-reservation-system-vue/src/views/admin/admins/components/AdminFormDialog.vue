<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="form" label-width="100px" size="small">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :disabled="form.id !== undefined"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="24" v-if="form.id === undefined">
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="真实姓名" prop="realName">
            <el-input
              v-model="form.realName"
              placeholder="请输入真实姓名"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="管理员类型" prop="userType">
            <el-select v-model="form.userType" placeholder="请选择管理员类型" style="width: 100%">
              <el-option label="管理员" value="admin"></el-option>
              <el-option
                label="超级管理员"
                value="super_admin"
                :disabled="currentUser.userType !== 'super_admin'"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="所属院系" prop="departmentId">
            <el-select v-model="form.departmentId" placeholder="请选择所属院系" style="width: 100%">
              <el-option
                v-for="item in departments"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">正常</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'AdminFormDialog',
  props: {
    title: {
      type: String,
      default: '新增管理员'
    },
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    departments: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // 校验邮箱格式
    const validateEmail = (rule, value, callback) => {
      if (value && !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
        callback(new Error('请输入正确的邮箱格式'));
      } else {
        callback();
      }
    };
    
    // 校验手机号格式
    const validatePhone = (rule, value, callback) => {
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号格式'));
      } else {
        callback();
      }
    };
    
    return {
      // 对话框是否可见
      dialogVisible: this.visible,
      // 提交按钮加载状态
      submitLoading: false,
      // 表单数据
      form: {
        id: undefined,
        username: '',
        password: '',
        realName: '',
        email: '',
        phone: '',
        userType: 'admin',
        departmentId: undefined,
        status: 1
      },
      // 表单验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { max: 50, message: '真实姓名长度不能超过50个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        userType: [
          { required: true, message: '请选择管理员类型', trigger: 'change' }
        ],
        departmentId: [
          { required: true, message: '请选择所属院系', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      // 当前登录用户
      currentUser: {}
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    formData: {
      handler(val) {
        this.form = Object.assign({}, val);
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.getCurrentUser();
  },
  methods: {
    // 获取当前登录用户信息
    getCurrentUser() {
      this.currentUser = this.$store.getters.currentUser || {};
    },
    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          this.$emit('confirm', this.form);
          this.submitLoading = false;
        }
      });
    },
    // 关闭对话框
    handleClose() {
      this.$emit('update:visible', false);
      this.$refs.form.resetFields();
    }
  }
};
</script>

<style scoped>
/* 可以根据需要添加样式 */
.dialog-footer {
  text-align: right;
}
</style> 