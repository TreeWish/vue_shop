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
                <el-button type="primary">添加角色</el-button>
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
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">删除</el-button>
                        <!-- 分配权限按钮 -->
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
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
                roleId: ''
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
            rightDialogClosed() {
                this.defKeys = [];
            },
            async allotRights() {
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ];
                const idStr = keys.join(',');
                const { data: res } = await this.$ajax.post(`roles/${this.roleId}/rights`, { rids: idStr }
                );
                 if (res.meta.status !== 200) {
                    return this.$message.error('分配权限失败！')
                }
                this.$message.success('分配权限成功！');
                this.getRoleList();
                this.rightsDialogVisible = false;
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
