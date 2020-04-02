<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
                <!-- 表格 -->
            <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                  <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
                  <i class="el-icon-error" v-else style="color: red;"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                  <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                  <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
                  <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt" slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(scope.row.cat_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini"  @click="deleteCate(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
            <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="queryinfo.pagenum"
                  :page-sizes="[1, 2, 5, 10]"
                  :page-size="queryinfo.pagesize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="total">
            </el-pagination>
        </el-card>
        <el-dialog
          title="添加分类"
          :visible.sync="addCateDialogVisible"
          width="50%"
          @close="addCateDialogClosed"
          >
           <!-- 内容主体区域 -->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
              <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
              </el-form-item>
              <el-form-item label="父级分类">
                <!-- options 用来指定数据源 -->
                <!-- props 用来指定配置对象 -->
                <el-cascader
                    v-model="selectedKeys"
                    :options="parentCateList"
                    :props="cascaderProps"
                    @change="parentCateChanged">
                </el-cascader>
              </el-form-item>
            </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
        </el-dialog>
        <el-dialog
          title="修改分类"
          :visible.sync="editCateDialogVisible"
          width="50%"
          @close="editCateDialogClosed"
          >
           <!-- 内容主体区域 -->
            <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
              <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="editCateForm.cat_name"></el-input>
              </el-form-item>
            </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCateList">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 商品分类数据
                catelist: [],
                // 查询条件
                queryinfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                total: 0,
                columns: [
                    {
                     label: '分类名称',
                     prop: 'cat_name'
                    },
                    {
                     label: '是否有效',
                     // 表示，将当前列定义为模板列
                     type: 'template',
                     // 表示当前这一列使用模板名称
                     template: 'isok'
                    },
                    {
                     label: '排序',
                     // 表示，将当前列定义为模板列
                     type: 'template',
                     // 表示当前这一列使用模板名称
                     template: 'order'
                    },
                    {
                     label: '操作',
                     // 表示，将当前列定义为模板列
                     type: 'template',
                     // 表示当前这一列使用模板名称
                     template: 'opt'
                    }
                ],
                addCateDialogVisible: false,
                addCateForm: {
                    // 将要添加的分类的名称
                    cat_name: '',
                    // 父级分类的Id
                    cat_pid: 0,
                    // 分类的等级，默认要添加的是1级分类
                    cat_level: 0
                },
                addCateFormRules: {
                    cat_name: [
                      { required: true, message: '请输入分类名称', trigger: 'blur' },
                      {
                        min: 2,
                        max: 10,
                        message: '分类名称的长度在2~10个字符之间',
                        trigger: 'blur'
                      }
                    ]
                },
                // 父级分类的列表
                parentCateList: [],
                // 指定级联选择器的配置对象
                cascaderProps: {
                    expandTrigger: 'hover',
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children'
                },
                selectedKeys: [],
                // 修改对话框
                editCateDialogVisible: false,
                editCateForm: {
                    cat_id: '',
                    cat_name: ''
                }
            }
        },
        created() {
            this.getCateList();
        },
        methods: {
            // 获取商品分类列表
            async getCateList() {
                const { data: res } = await this.$ajax.get('categories', { params: this.queryinfo });
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品分类失败！')
                }
                // 把数据列表，赋值给 catelist
                this.catelist = res.data.result;
                // 为总数据条数赋值
                this.total = res.data.total;
            },
            // 监听pagenum
            handleSizeChange(newNum) {
                this.queryinfo.pagesize = newNum;
                this.getCateList();
            },
            // 监听pagesize
            handleCurrentChange(newPage) {
                this.queryinfo.pagenum = newPage;
                this.getCateList();
            },
            // 展示添加商品分类列表
            showAddCateDialog() {
                // 获取全部父级分类名称
                this.getParentCate();
                this.addCateDialogVisible = true;
            },
            // // 获取全部父级分类名称
            async getParentCate() {
                const { data: res } = await this.$ajax.get('categories', {
                    params: {
                        type: 2,
                        pagenum: 1,
                        pagesize: 15
                    }
                });
                if (res.meta.status !== 200) {
                    return this.$message.error('获取父级分类失败');
                }
                // 由于一次获取31条数据， Cascader 再Dialog中使用时，如果下拉框里数据条目过多会使 联级选择器展不开，导致显示有问题
                // 当Cascader 再Dialog中使用时，如果下拉框里数据条目过多会使Cascader显示出问题
                this.parentCateList = res.data.result;
            },
            // 点击添加商品分类
            addCate() {
                this.$refs.addCateFormRef.validate(async valid => {
                    if (!valid) return;
                    const { data: res } = await this.$ajax.post('categories', this.addCateForm);
                    if (res.meta.status !== 201) {
                        return this.$message.error('添加商品分类失败');
                    }
                    this.$message.success('添加商品分类成功');
                    this.getCateList();
                    this.addCateDialogVisible = false;
                })
            },
            parentCateChanged() {
                console.log(this.selectedKeys);
                // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
                // 反之，就说明没有选中任何父级分类
                if (this.selectedKeys.length > 0) {
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
                    this.addCateForm.cat_level = this.selectedKeys.length;
                } else {
                    this.addCateForm.cat_pid = 0;
                    this.addCateForm.cat_level = 0;
                }
            },
            // 添加分类对话框关闭
            addCateDialogClosed() {
                this.$refs.addCateFormRef.resetFields();
                this.selectedKeys = [];
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            },
            // 修改商品分类
            async editCate(id) {
                const { data: res } = await this.$ajax.get('categories/' + id);
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品分类信息失败');
                }
                this.editCateForm = res.data;
                this.editCateDialogVisible = true;
            },
            // 修改分类对话框关闭
            editCateDialogClosed() {
                this.$refs.editCateFormRef.resetFields();
            },
            // 修改商品分类信息并提交
            editCateList() {
                this.$refs.editCateFormRef.validate(async valid => {
                    if (!valid) return;
                    const { data: res } = await this.$ajax.put('categories/' + this.editCateForm.cat_id, {
                        cat_name: this.editCateForm.cat_name
                    });
                    if (res.meta.status !== 200) {
                        return this.$message.error('修改商品分类失败');
                    }
                    this.$message.success('修改商品分类成功');
                    this.getCateList();
                    this.editCateDialogVisible = false;
                })
            },
            // 删除商品分类
            async deleteCate(id) {
                const confirmResult = await this.$confirm(
                        '此操作将永久删除该商品分类, 是否继续?',
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
                const { data: res } = await this.$ajax.delete('categories/' + id);
                if (res.meta.status !== 200) {
                    return this.$message.error('删除用户失败');
                }
                this.$message.success('删除用户成功');
                this.getCateList();
            }
        }
    }
</script>

<style lang="less" scoped>
    .treeTable {
        margin-top: 15px;
    }
    .el-cascader {
      width: 100%;
    }
    .el-dialog {
        overflow: hidden;
    }
</style>
