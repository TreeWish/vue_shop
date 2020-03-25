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
                   <el-input placeholder="请输入内容">
                       <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                   </el-input>
               </el-col>
               <el-col :span="4">
                   <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
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
                    <!-- 修改按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                    <!-- 分配角色按钮 -->
                    <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                    <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
                    </el-tooltip>
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
   </div>
</template>

<script>
    export default {
        name: 'User',
        data() {
            return {
                 // 获取用户列表的参数对象
                queryInfo: {
                    query: '',
                    // 当前的页数
                    pagenum: 1,
                    // 当前每页显示多少条数据
                    pagesize: 2
                      },
                userlist: [],
                total: 0
                // 控制添加用户对话框的显示与隐藏
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
                console.log(res);
            },
            async userStateChanged(userinfo) {
                  console.log(userinfo)
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
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage;
                this.getUserList();
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
