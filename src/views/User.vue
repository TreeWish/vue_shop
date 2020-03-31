<template>
   <div>
       <el-breadcrumb separator-class="el-icon-arrow-right">
         <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
         <el-breadcrumb-item>用户管理</el-breadcrumb-item>
         <el-breadcrumb-item>用户列表</el-breadcrumb-item>
       </el-breadcrumb>
       <el-card>
           <el-row :gutter="20">
               <el-col :span="8">
                   <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="clearQuery">
                       <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                   </el-input>
               </el-col>
               <el-col :span="4">
                   <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
               </el-col>
           </el-row>
           <el-table
           :data="userlist"
           stripe
           style="width: 100%"
           border>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
         </el-table>
         <el-pagination
               @size-change="handleSizeChange"
               @current-change="handleCurrentChange"
               :current-page="queryInfo.pagenum"
               :page-sizes="[1, 2, 5, 10]"
               :page-size="queryInfo.pagesize"
               layout="total, sizes, prev, pager, next, jumper"
               :total="total">
         </el-pagination>
       </el-card>
       <el-dialog
         title="用户列表"
         :visible.sync="addUserDialogVisible"
         width="50%"
         @close="addUserDialogClosed"
         >
          <!-- 内容主体区域 -->
           <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="70px">
             <el-form-item label="用户名" prop="username">
               <el-input v-model="addUserForm.username"></el-input>
             </el-form-item>
             <el-form-item label="密码" prop="password">
               <el-input v-model="addUserForm.password"></el-input>
             </el-form-item>
             <el-form-item label="邮箱" prop="email">
               <el-input v-model="addUserForm.email"></el-input>
             </el-form-item>
             <el-form-item label="手机" prop="mobile">
               <el-input v-model="addUserForm.mobile"></el-input>
             </el-form-item>
           </el-form>
         <span slot="footer" class="dialog-footer">
           <el-button @click="addUserDialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="addUser">确 定</el-button>
         </span>
       </el-dialog>
        <!-- 修改用户的对话框 -->
       <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
         <el-form :model="editForm" :rules="addUserFormRules" ref="editFormRef" label-width="70px">
           <el-form-item label="用户名">
             <el-input v-model="editForm.username" disabled></el-input>
           </el-form-item>
           <el-form-item label="邮箱" prop="email">
             <el-input v-model="editForm.email"></el-input>
           </el-form-item>
           <el-form-item label="手机" prop="mobile">
             <el-input v-model="editForm.mobile"></el-input>
           </el-form-item>
         </el-form>
         <span slot="footer" class="dialog-footer">
           <el-button @click="editDialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="editUserInfo">确 定</el-button>
         </span>
       </el-dialog>
       <!-- 分配角色的对话框 -->
       <el-dialog title="分配角色" :visible.sync="roleDialogVisible" width="50%" @close="roleDialogClosed">
         <div>
             <p>当前用户：{{this.userInfo.username}}</p>
             <p>当前用户：{{this.userInfo.role_name}}</p>
             <p>当前用户：
                  <el-select v-model="selectedRoleId" placeholder="请选择">
                      <el-option
                        v-for="item in rolesList"
                        :key="item.id"
                        :label="item.roleName"
                        :value="item.id">
                      </el-option>
                  </el-select>
             </p>
         </div>
         <span slot="footer" class="dialog-footer">
           <el-button @click="roleDialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="roleUserInfo()">确 定</el-button>
         </span>
       </el-dialog>
   </div>
</template>

<script>
    export default {
        name: 'User',
        data() {
             // 验证邮箱的规则
            var checkEmail = (rule, value, cb) => {
              // 验证邮箱的正则表达式
              const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
              if (regEmail.test(value)) {
                // 合法的邮箱
                return cb();
              }
              cb(new Error('请输入合法的邮箱'));
            }
            // 验证手机号的规则
            var checkMobile = (rule, value, cb) => {
              // 验证手机号的正则表达式
              const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
              if (regMobile.test(value)) {
                return cb();
              }
              cb(new Error('请输入合法的手机号'));
            }
            return {
                 // 获取用户列表的参数对象
                queryInfo: {
                    query: '',
                    // 当前的页数
                    pagenum: 1,
                    // 当前每页显示多少条数据
                    pagesize: 5
                      },
                userlist: [],
                total: 0,
                // 控制添加用户对话框的显示与隐藏
                addUserDialogVisible: false,
                addUserForm: {
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                },
                addUserFormRules: {
                    username: [
                      { required: true, message: '请输入用户名', trigger: 'blur' },
                      {
                        min: 3,
                        max: 10,
                        message: '用户名的长度在3~10个字符之间',
                        trigger: 'blur'
                      }
                    ],
                    password: [
                      { required: true, message: '请输入密码', trigger: 'blur' },
                      {
                        min: 6,
                        max: 15,
                        message: '用户名的长度在6~15个字符之间',
                        trigger: 'blur'
                      }
                    ],
                    email: [
                      { required: true, message: '请输入邮箱', trigger: 'blur' },
                      { validator: checkEmail, trigger: 'blur' }
                    ],
                    mobile: [
                      { required: true, message: '请输入手机号', trigger: 'blur' },
                      { validator: checkMobile, trigger: 'blur' }
                    ]
                },
                editDialogVisible: false,
                editForm: {},
                roleDialogVisible: false,
                rolesList: [],
                userInfo: {},
                selectedRoleId: ''
            }
        },
        created() {
            this.getUserList();
        },
        methods: {
            async getUserList() {
                const { data: res } = await this.$ajax.get('users', {
                    params: this.queryInfo
                });
                if (res.meta.status !== 200) {
                    return this.$message.error('获取用户列表失败！');
                }
                this.userlist = res.data.users;
                this.total = res.data.total;
            },
            // 监听 switch 开关状态的改变
            async userStateChanged(userinfo) {
                  const { data: res } = await this.$ajax.put(
                    `users/${userinfo.id}/state/${userinfo.mg_state}`
                  )
                  if (res.meta.status !== 200) {
                    userinfo.mg_state = !userinfo.mg_state
                    return this.$message.error('更新用户状态失败！')
                  }
                  this.$message.success('更新用户状态成功！')
            },
            // 监听 pagesize 改变的事件
            handleSizeChange(newsize) {
                this.queryInfo.pagesize = newsize;
                this.getUserList();
            },
            // 监听 页码值 改变的事件
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage;
                this.getUserList();
            },
            // 清除搜索框的内容
            clearQuery() {
                this.queryInfo.query = '';
                this.getUserList();
            },
            // 监听添加用户对话框的关闭事件
            addUserDialogClosed() {
                this.$refs.addUserFormRef.resetFields();
            },
            // 点击确认，添加用户
            addUser() {
                this.$refs.addUserFormRef.validate(async valid => {
                    if (valid) {
                        const { data: res } = await this.$ajax.post('users', this.addUserForm);
                        if (res.meta.status !== 201) {
                            this.$message.error('添加用户失败！');
                        } else {
                            this.$message.success('添加用户成功！');
                        }
                    } else {
                        return;
                    }
                     // 隐藏添加用户的对话框
                    this.addUserDialogVisible = false;
                    // 重新获取用户列表数据
                    this.getUserList();
                })
            },
            // 展示编辑用户的对话框
            async showEditDialog(id) {
                this.editDialogVisible = true;
                const { data: res } = await this.$ajax.get('users/' + id);
                if (res.meta.status === 200) {
                    this.editForm = res.data;
                } else {
                    return this.$message.error('查询用户信息失败！');
                }
            },
            // 监听修改用户对话框的关闭事件
            editDialogClosed() {
                this.$refs.editFormRef.resetFields();
            },
            // 修改用户信息并提交
            editUserInfo() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return;
                    // 发起修改用户信息的数据请求
                    const { data: res } = await this.$ajax.put('users/' + this.editForm.id, {
                        email: this.editForm.email,
                        mobile: this.editForm.mobile
                    })
                    if (res.meta.status === 200) {
                        this.$message.success('更新用户信息成功！');
                    } else {
                        return this.$message.error('更新用户信息失败！');
                    }
                    // 关闭对话框
                    this.editDialogVisible = false
                     // 刷新数据列表
                    this.getUserList()
                });
            },
            // 根据Id删除对应的用户信息
            async removeUserById(id) {
                const confirmResult = await this.$confirm(
                        '此操作将永久删除该用户, 是否继续?',
                        '提示',
                        {
                          confirmButtonText: '确定',
                          cancelButtonText: '取消',
                          type: 'warning'
                        }
                ).catch(err => err);
                // 如果用户确认删除，则返回值为字符串 confirm
                // 如果用户取消了删除，则返回值为字符串 cancel
                if (confirmResult !== 'confirm') {
                   return this.$message.info('操作已取消');
                }
                const { data: res } = await this.$ajax.delete('users/' + id);
                if (res.meta.status !== 200) {
                    return this.$message.error('删除用户失败');
                }
                this.$message.success('删除用户成功');
                this.getUserList();
            },
            // 展示分配角色的对话框
            async setRole(userInfo) {
                this.userInfo = userInfo;
                const { data: res } = await this.$ajax.get('roles');
                if (res.meta.status !== 200) {
                    return this.$message.error('获取用户信息失败');
                }
                this.rolesList = res.data;
                this.roleDialogVisible = true;
            },
            // 点击按钮，分配角色
            async roleUserInfo() {
                if (!this.selectedRoleId) {
                    return this.$message.error('请选择要分配的角色！');
                }
                const { data: res } = await this.$ajax.put(`users/${this.userInfo.id}/role`,
                {
                    rid: this.selectedRoleId
                });
                if (res.meta.status !== 200) {
                    return this.$message.error('更新角色失败！')
                }
                this.$message.success('更新角色成功！');
                this.getUserList();
                this.roleDialogVisible = false;
            },
            // 监听关闭分配角色的对话框
            roleDialogClosed() {
                this.selectedRoleId = '';
                this.userInfo = {};
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-table {
        margin-top: 15px;
    }
    .el-pagination {
        margin-top: 15px;
    }
</style>
