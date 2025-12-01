<template>
  <div class="admin-management-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <div class="filter-container">
        <el-form :inline="true" :model="queryParams" size="small">
          <el-form-item label="用户名">
            <el-input
              v-model="queryParams.username"
              placeholder="请输入用户名"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="真实姓名">
            <el-input
              v-model="queryParams.realName"
              placeholder="请输入真实姓名"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="管理员类型">
            <el-select v-model="queryParams.userType" clearable placeholder="请选择类型">
              <el-option
                v-for="item in userTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" clearable placeholder="请选择状态">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 表格操作区域 -->
    <el-card class="table-card" shadow="hover">
      <div class="table-operations">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="handleAdd"
          v-permission="['super_admin']"
        >新增管理员</el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="small"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
          v-permission="['super_admin']"
        >批量删除</el-button>
      </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="adminList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="用户名" prop="username" :show-overflow-tooltip="true" />
        <el-table-column label="真实姓名" prop="realName" :show-overflow-tooltip="true" />
        <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
        <el-table-column label="手机号" prop="phone" width="120" align="center" />
        <el-table-column label="管理员类型" align="center" width="120">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.userType === 'super_admin' ? 'danger' : 'primary'"
            >
              {{ formatUserType(scope.row.userType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属院系" prop="departmentName" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" width="100">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
              :disabled="scope.row.userType === 'super_admin' && currentUser.userType !== 'super_admin'"
            />
          </template>
        </el-table-column>
        <el-table-column label="最后登录时间" align="center" width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.lastLoginTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="220">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
              v-permission="['super_admin']"
              :disabled="scope.row.userType === 'super_admin' && currentUser.userType !== 'super_admin'"
            >编辑</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-unlock"
              @click="handleResetPwd(scope.row)"
              v-permission="['super_admin']"
              :disabled="scope.row.userType === 'super_admin' && currentUser.userType !== 'super_admin'"
            >重置密码</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-permission="['super_admin']"
              :disabled="scope.row.userType === 'super_admin' && currentUser.userType !== 'super_admin'"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        v-show="total > 0"
        :current-page.sync="queryParams.pageNum"
        :page-size.sync="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 15px; text-align: right;"
      />
    </el-card>

    <!-- 添加或修改管理员对话框 -->
    <admin-form-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :form-data="formData"
      :departments="departmentOptions"
      @confirm="handleDialogConfirm"
    />

    <!-- 重置密码对话框 -->
    <el-dialog
      title="重置密码"
      :visible.sync="resetPwdDialogVisible"
      width="400px"
      @close="resetForm('resetPwdForm')"
    >
      <el-form :model="resetPwdForm" :rules="resetPwdRules" ref="resetPwdForm" label-width="100px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetPwdForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPwdForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPwdDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleResetPwdSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import  {adminApi } from '@/api/admin';
import deptApi from '@/api/dept';
import AdminFormDialog from './components/AdminFormDialog';

export default {
  name: 'AdminManagement',
  components: {
    AdminFormDialog
  },
  data() {
    // 密码一致性验证
    const validatePasswordConfirm = (rule, value, callback) => {
      if (value !== this.resetPwdForm.newPassword) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };

    return {
      // 加载状态
      loading: false,
      // 选中数组
      selectedIds: [],
      // 总条数
      total: 0,
      // 用户表格数据
      adminList: [],
      // 弹出层标题
      dialogTitle: '',
      // 是否显示弹出层
      dialogVisible: false,
      // 是否显示重置密码弹出层
      resetPwdDialogVisible: false,
      // 部门选项
      departmentOptions: [],
      // 表单参数
      formData: {
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
      // 重置密码表单
      resetPwdForm: {
        id: undefined,
        newPassword: '',
        confirmPassword: ''
      },
      // 重置密码表单校验规则
      resetPwdRules: {
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: validatePasswordConfirm, trigger: 'blur' }
        ]
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: undefined,
        realName: undefined,
        userType: undefined,
        status: undefined
      },
      // 用户类型选项
      userTypeOptions: [
        { label: '管理员', value: 'admin' },
        { label: '超级管理员', value: 'super_admin' }
      ],
      // 状态选项
      statusOptions: [
        { label: '正常', value: 1 },
        { label: '禁用', value: 0 }
      ],
      // 当前登录用户
      currentUser: {}
    };
  },
  created() {
    this.getCurrentUser();
    this.getList();
    this.getDepartmentOptions();
  },
  methods: {
    // 获取当前登录用户信息
    getCurrentUser() {
      this.currentUser = this.$store.getters.currentUser || {};
    },
    // 获取管理员列表
    getList() {
      this.loading = true;
      
      // 构造查询参数，只查询管理员和超级管理员
      const params = {
        ...this.queryParams,
        userTypes: 'admin'
      };
      
      adminApi.getList(params).then(response => {
        if (response.code === 1) {
          this.adminList = response.data.rows || [];
          this.total = response.data.total;
        } else {
          this.$message.error(response.msg || '获取管理员列表失败');
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    // 获取部门选项
    getDepartmentOptions() {
      deptApi.list().then(response => {
        if (response.code === 1) {
          this.departmentOptions = response.data || [];
        }
      });
    },
    // 格式化用户类型
    formatUserType(userType) {
      const typeMap = {
        'admin': '管理员',
        'super_admin': '超级管理员'
      };
      return typeMap[userType] || userType;
    },
    // 格式化日期时间
    formatDateTime(time) {
      if (!time) return '未登录';
      return new Date(time).toLocaleString();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selectedIds = selection.map(item => item.id);
    },
    // 搜索按钮操作
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 重置按钮操作
    resetQuery() {
      this.$refs.queryForm && this.$refs.queryForm.resetFields();
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        username: undefined,
        realName: undefined,
        userType: undefined,
        status: undefined
      };
      this.handleQuery();
    },
    // 新增按钮操作
    handleAdd() {
      this.formData = {
        id: undefined,
        username: '',
        password: '',
        realName: '',
        email: '',
        phone: '',
        userType: 'admin',
        departmentId: undefined,
        status: 1
      };
      this.dialogTitle = '新增管理员';
      this.dialogVisible = true;
    },
    // 修改按钮操作
    handleEdit(row) {
      this.formData = {
        id: row.id,
        username: row.username,
        realName: row.realName,
        email: row.email,
        phone: row.phone,
        userType: row.userType,
        departmentId: row.departmentId,
        status: row.status
      };
      this.dialogTitle = '编辑管理员';
      this.dialogVisible = true;
    },
    // 表单确认按钮
    handleDialogConfirm(formData) {
      if (formData.id) {
        // 修改
        adminApi.update(formData).then(response => {
          if (response.code === 1) {
            this.$message.success('修改成功');
            this.dialogVisible = false;
            this.getList();
          } else {
            this.$message.error(response.msg || '修改失败');
          }
        });
      } else {
        // 新增
        adminApi.add(formData).then(response => {
          if (response.code === 1) {
            this.$message.success('新增成功');
            this.dialogVisible = false;
            this.getList();
          } else {
            this.$message.error(response.msg || '新增失败');
          }
        });
      }
    },
    // 删除按钮操作
    handleDelete(row) {
      this.$confirm(`确认删除管理员 ${row.realName || row.username} 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = [row.id]
        adminApi.batchDelete(ids).then(response => {
          if (response.code === 1) {
            this.$message.success('删除成功');
            this.getList();
          } else {
            this.$message.error(response.msg || '删除失败');
          }
        });
      }).catch(() => {});
    },
    // 批量删除操作
    handleBatchDelete() {
      if (this.selectedIds.length === 0) {
        this.$message.warning('请至少选择一条记录');
        return;
      }
      
      this.$confirm(`确认批量删除选中的 ${this.selectedIds.length} 个管理员吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectedIds.map(id => id)
        adminApi.batchDelete(ids).then(response => {
          if (response.code === 1) {
            this.$message.success('批量删除成功');
            this.getList();
          } else {
            this.$message.error(response.msg || '批量删除失败');
          }
        });
      }).catch(() => {});
    },
    // 状态修改
    handleStatusChange(row) {
      const status = row.status === 1 ? '启用' : '停用';
      this.$confirm(`确认要${status}管理员 ${row.realName || row.username} 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        adminApi.updateStatus({
          id: row.id,
          status: row.status
        }).then(response => {
          if (response.code === 1) {
            this.$message.success(`${status}成功`);
          } else {
            row.status = row.status === 1 ? 0 : 1; // 操作失败，恢复原状态
            this.$message.error(response.msg || `${status}失败`);
          }
        });
      }).catch(() => {
        row.status = row.status === 1 ? 0 : 1; // 取消操作，恢复原状态
      });
    },
    // 重置密码操作
    handleResetPwd(row) {
      this.resetPwdForm = {
        id: row.id,
        newPassword: '',
        confirmPassword: ''
      };
      this.resetPwdDialogVisible = true;
    },
    // 重置密码表单重置
    resetForm(formName) {
      this.$refs[formName] && this.$refs[formName].resetFields();
    },
    // 提交重置密码
    handleResetPwdSubmit() {
      this.$refs.resetPwdForm.validate(valid => {
        if (valid) {
          userApi.resetPassword({
            id: this.resetPwdForm.id,
            password: this.resetPwdForm.newPassword
          }).then(response => {
            if (response.code === 1) {
              this.$message.success('密码重置成功');
              this.resetPwdDialogVisible = false;
            } else {
              this.$message.error(response.msg || '密码重置失败');
            }
          });
        }
      });
    },
    // 分页大小变化
    handleSizeChange(val) {
      this.queryParams.pageSize = val;
      this.getList();
    },
    
    // 当前页变化
    handleCurrentChange(val) {
      this.queryParams.pageNum = val;
      this.getList();
    },
  }
};
</script>

<style scoped>
.admin-management-container {
  padding: 20px;
}

.search-card,
.table-card {
  margin-bottom: 20px;
  border-radius: 5px;
}

.filter-container {
  margin-bottom: 10px;
}

.table-operations {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

.table-operations .el-button {
  margin-right: 10px;
}

:deep(.el-table .warning-row) {
  background: #fdf5e6;
}

:deep(.el-table .success-row) {
  background: #f0f9eb;
}
</style> 