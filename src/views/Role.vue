<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>权限管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <el-table :data="roleList" border stripe>
                <el-table-column type="expand">
                   <template slot-scope="scope">
                       <el-row :class="['bdbottom',index1===0?'bdtop':'','flexcenter']" v-for="(item1, index1) in scope.row.children" :key="item1.id">
                           <!-- 渲染一级权限 -->
                           <el-col :span="5">
                               <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                               <i class="el-icon-caret-right"></i>
                           </el-col>
                            <!-- 渲染二、三级权限 -->
                           <el-col :span="19">
                               <el-row :class="['bdtop',index2===0?'bdbottom':'','flexcenter']" v-for="(item2, index2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success"
                                        closable
                                        @close="removeRightById(scope.row, item2.id)">
                                        {{item2.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning"
                                        v-for="item3 in item2.children"
                                        :key="item3.id"
                                        closable
                                        @close="removeRightById(scope.row, item3.id)">
                                        {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                               </el-row>
                           </el-col>
                       </el-row>
                   </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="权限名称" prop="roleName"></el-table-column>
                <el-table-column label="路径" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">修改</el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
                        <!-- 分配权限按钮 -->
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <el-dialog
          title="添加角色"
          :visible.sync="addRoleDialogVisible"
          width="50%"
          @close="addDialogClosed"
          >
           <!-- 内容主体区域 -->
           <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="roleFormRef" label-width="100px">
             <el-form-item label="角色名称" prop="roleName">
               <el-input v-model="addRoleForm.roleName"></el-input>
             </el-form-item>
             <el-form-item label="描述" prop="roleDesc">
               <el-input v-model="addRoleForm.roleDesc"></el-input>
             </el-form-item>
           </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole()">确 定</el-button>
          </span>
        </el-dialog>
        <el-dialog
          title="修改角色"
          :visible.sync="editRoleDialogVisible"
          width="50%"
          @close="addDialogClosed"
          >
           <!-- 内容主体区域 -->
           <el-form :model="editRoleForm" :rules="addRoleFormRules" ref="editRoleFormRef" label-width="100px">
             <el-form-item label="角色名称" prop="roleName">
               <el-input v-model="editRoleForm.roleName"></el-input>
             </el-form-item>
             <el-form-item label="描述" prop="roleDesc">
               <el-input v-model="editRoleForm.roleDesc"></el-input>
             </el-form-item>
           </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRole()">确 定</el-button>
          </span>
        </el-dialog>
        <el-dialog
          title="分配权限"
          :visible.sync="rightsDialogVisible"
          width="50%"
          @close="rightDialogClosed"
          >
           <!-- 内容主体区域 -->
           <el-tree :data="rightList" :props="rightprops" show-checkbox ref="treeRef" default-expand-all node-key="id" :default-checked-keys="defKeys">
           </el-tree>
          <span slot="footer" class="dialog-footer">
            <el-button @click="rightsDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRights">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                roleList: [],
                rightsDialogVisible: false,
                rightList: [],
                rightprops: {
                    label: 'authName',
                    children: 'children'
                },
                defKeys: [],
                roleId: '',
                addRoleForm: {
                    roleName: '',
                    roleDesc: ''
                },
                addRoleDialogVisible: false,
                addRoleFormRules: {
                    roleName: [
                      { required: true, message: '请输入角色名称', trigger: 'blur' },
                      {
                        min: 2,
                        max: 8,
                        message: '用户名的长度在2~8个字符之间',
                        trigger: 'blur'
                      }
                    ],
                    roleDesc: [
                      {
                        min: 2,
                        max: 10,
                        message: '用户名的长度在2~10个字符之间',
                        trigger: 'blur'
                      }
                    ]
                },
                editRoleDialogVisible: false,
                editRoleForm: []
            }
        },
        created() {
            this.getRoleList();
        },
        methods: {
            async getRoleList() {
                const { data: res } = await this.$ajax.get('roles');
                if (res.meta.status !== 200) return this.$message.error('获取角色列表失败');
                this.roleList = res.data;
            },
            async removeRightById(role, rightId) {
                const ConfirmResult = await this.$confirm(
                    '此操作将永久删除该权限, 是否继续?',
                    '提示',
                    {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      type: 'warning'
                    }
                ).catch(err => err);
                if (ConfirmResult !== 'confirm') return this.$message.info('操作已取消');
                const { data: res } = await this.$ajax.delete(`roles/${role.id}/rights/${rightId}`)
                if (res.meta.status !== 200) {
                    return this.$message.error('删除权限失败！')
                }
                role.children = res.data;
            },
            async showSetRightDialog(role) {
                this.roleId = role.id;
                const { data: res } = await this.$ajax.get('rights/tree');
                if (res.meta.status !== 200) {
                    return this.$message.error('获取权限列表失败');
                }
                this.rightList = res.data;
                this.getLeafKeys(role, this.defKeys);
                this.rightsDialogVisible = true;
            },
            // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
            getLeafKeys(node, arr) {
                if (!node.children) {
                    return arr.push(node.id);
                }
                node.children.forEach(item => this.getLeafKeys(item, arr));
            },
            // 监听关闭分配权限
            rightDialogClosed() {
                this.defKeys = [];
            },
            // 点击确认，分配权限
            async allotRights() {
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ];
                const idStr = keys.join(',');
                const { data: res } = await this.$ajax.post(`roles/${this.roleId}/rights`, { rids: idStr }
                );
                 if (res.meta.status !== 200) {
                    return this.$message.error('分配权限失败！');
                }
                this.$message.success('分配权限成功！');
                this.getRoleList();
                this.rightsDialogVisible = false;
            },
            // 添加角色
            addRole() {
                this.$refs.roleFormRef.validate(async valid => {
                    if (!valid) return;
                    const { data: res } = await this.$ajax.post('roles', this.addRoleForm);
                    if (res.meta.status !== 201) {
                        return this.$message.error('添加角色失败');
                    }
                    this.$message.success('添加角色成功');
                    this.addRoleDialogVisible = false;
                    this.getRoleList();
                });
            },
            // 监听关闭添加角色对话框
            addDialogClosed() {
                this.$refs.roleFormRef.resetFields();
            },
            // 修改角色对话框
            async showEditDialog(id) {
                this.roleId = id;
                this.editRoleDialogVisible = true;
                const { data: res } = await this.$ajax.get('roles/' + id);
                if (res.meta.status === 200) {
                    this.editRoleForm = res.data;
                } else {
                    return this.$message.error('查询角色信息失败！');
                }
            },
            // 修改角色,并提交
            editRole() {
                this.$refs.editRoleFormRef.validate(async valid => {
                    if (!valid) return;
                    const { data: res } = await this.$ajax.put(`roles/${this.roleId}`, this.editRoleForm);
                    if (res.meta.status !== 200) {
                        return this.$message.error('修改角色失败');
                    }
                    this.$message.success('修改角色成功');
                    this.editRoleDialogVisible = false;
                    this.getRoleList();
                });
            },
            // 根据Id删除对应的角色信息
            async removeRoleById(id) {
                const confirmResult = await this.$confirm(
                        '此操作将永久删除该角色, 是否继续?',
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
                const { data: res } = await this.$ajax.delete('roles/' + id);
                if (res.meta.status !== 200) {
                    return this.$message.error('删除角色失败');
                }
                this.$message.success('删除角色成功');
                this.getRoleList();
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-tag {
        margin: 7px;
    }
    .bdtop {
        border-top: 1px solid #eee;
    }
    .bdbottom {
        border-bottom: 1px solid #eee;
    }
    .flexcenter {
        display: flex;
        align-items: center;
    }
</style>
