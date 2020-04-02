<template>
    <div>
       <el-breadcrumb separator-class="el-icon-arrow-right">
         <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
         <el-breadcrumb-item>商品管理</el-breadcrumb-item>
         <el-breadcrumb-item>参数列表</el-breadcrumb-item>
       </el-breadcrumb>
       <el-card>
         <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
         <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <!-- 选择商品分类的级联选择框 -->
            <el-cascader :options="catelist" :props="cateProps" v-model="selectedCateKeys" @change="handleChange">
            </el-cascader>
            </el-col>
          </el-row>
          <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="动态参数" name="many">
              <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
              <el-table border :data="manyTableData" stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index, scope.row)">{{item}}</el-tag>
                        <el-input
                          class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)"
                        >
                        </el-input>
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
                <el-table border :data="onlyTableData" stripe>
                  <el-table-column type="expand"></el-table-column>
                  <el-table-column type="index"></el-table-column>
                  <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                      <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
            </el-tab-pane>
          </el-tabs>
       </el-card>
       <!-- 添加参数的对话框 -->
           <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
             <!-- 添加参数的对话框 -->
             <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
               <el-form-item :label="titleText" prop="attr_name">
                 <el-input v-model="addForm.attr_name"></el-input>
               </el-form-item>
             </el-form>
             <span slot="footer" class="dialog-footer">
               <el-button @click="addDialogVisible = false">取 消</el-button>
               <el-button type="primary" @click="addParams">确 定</el-button>
             </span>
           </el-dialog>
           <!-- 修改参数的对话框 -->
           <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
             <!-- 添加参数的对话框 -->
             <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
               <el-form-item :label="titleText" prop="attr_name">
                 <el-input v-model="editForm.attr_name"></el-input>
               </el-form-item>
             </el-form>
             <span slot="footer" class="dialog-footer">
               <el-button @click="editDialogVisible = false">取 消</el-button>
               <el-button type="primary" @click="editParams">确 定</el-button>
             </span>
           </el-dialog>
    </div>
</template>

<script>
  export default {
    data() {
      return {
        catelist: [],
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        paramsData: [],
        selectedCateKeys: [],
        activeName: 'many',
        manyTableData: [],
        onlyTableData: [],
        addDialogVisible: false,
        editDialogVisible: false,
        addForm: {
            attr_name: ''
        },
        addFormRules: {
            attr_name: [
              { required: true, message: '请输入参数名称', trigger: 'blur' }
            ]
        },
        editForm: []
        // 为了保证每个遍历出来的便签都有自己的inputVisible，inputValue曾需要 动态绑定这两属性
        //  inputVisible: false,
        //  inputValue: ''
      }
    },
    created() {
      this.getCateList();
    },
    methods: {
      // 获取所有的商品分类列表
      async getCateList() {
        const { data: res } = await this.$ajax.get('categories', {
          params: { pagesize: 15, pagenum: 2 }
        });
        if (res.meta.status !== 200) return;
        this.catelist = res.data.result;
      },
      // 级联选择框选中项变化，会触发这个函数
      handleChange() {
        this.getParamsData();
      },
      // 点击选项卡事件
      handleTabClick() {
        this.getParamsData();
      },
      // 获取参数数据
      async getParamsData() {
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = [];
          this.manyTableData = [];
          this.onlyTableData = [];
          return;
        }
        // 根据所选分类的Id，和当前所处的面板，获取对应的参数
        const { data: res } = await this.$ajax.get(`categories/${this.cateId}/attributes`, {
          params: { sel: this.activeName }
        });
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败');
        }
        res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
             // 控制文本框的显示与隐藏
            item.inputVisible = false
            // 文本框中输入的值
            item.inputValue = ''
        })
        if (this.activeName === 'many') {
            this.manyTableData = res.data
        } else {
            this.onlyTableData = res.data
        }
        },
        addParams() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return;
                const { data: res } = await this.$ajax.post(`categories/${this.cateId}/attributes`,
                {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                });
                if (res.meta.status !== 201) {
                    return this.$message.error('添加参数失败');
                }
                this.$message.success('添加参数成功');
                this.addDialogVisible = false;
                this.getParamsData();
            })
        },
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        async showEditDialog(attrId) {
            const { data: res } = await this.$ajax.get(`categories/${this.cateId}/attributes/${attrId}`,
            {
                params: { attr_sel: this.activeName }
            });
            if (res.meta.status !== 200) {
                return this.$message.error('获取参数失败');
            }
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return;
                const { data: res } = await this.$ajax.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                });
                if (res.meta.status !== 200) {
                    return this.$message.error('修改参数失败');
                }
                this.$message.success('修改参数成功');
                this.editDialogVisible = false;
                this.getParamsData();
            })
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        async removeParams(attrId) {
            const confirmResult = await this.$confirm(
                    '此操作将永久删除该参数分类, 是否继续?',
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
            const { data: res } = await this.$ajax.delete(`categories/${this.cateId}/attributes/${attrId}`);
            if (res.meta.status !== 200) {
                return this.$message.error('删除参数失败');
            }
            this.$message.success('删除参数成功');
            this.getParamsData();
        },
        // 文本框失去焦点，或摁下了 Enter 都会触发
            async handleInputConfirm(row) {
              if (row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
              }
              // 如果没有return，则证明输入的内容，需要做后续处理
              row.attr_vals.push(row.inputValue.trim())
              row.inputValue = ''
              row.inputVisible = false
              // 需要发起请求，保存这次操作
              this.saveAttrVals(row)
            },
            // 将对 attr_vals 的操作，保存到数据库
            async saveAttrVals(row) {
              // 需要发起请求，保存这次操作
              const { data: res } = await this.$ajax.put(
                `categories/${this.cateId}/attributes/${row.attr_id}`,
                {
                  attr_name: row.attr_name,
                  attr_sel: row.attr_sel,
                  attr_vals: row.attr_vals.join(' ')
                }
              )
              if (res.meta.status !== 200) {
                return this.$message.error('修改参数项失败！')
              }

              this.$message.success('修改参数项成功！')
            },
            // 点击按钮，展示文本输入框
            showInput(row) {
              row.inputVisible = true
              // 让文本框自动获得焦点
              // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
              this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus()
              })
            },
            // 删除对应的参数可选项
            handleClose(i, row) {
              row.attr_vals.splice(i, 1)
              this.saveAttrVals(row)
            }
    },
    computed: {
      // 如果按钮需要被禁用，则返回true，否则返回false
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) {
          return true
        }
        return false
      },
      // 当前选中的三级分类的Id
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2];
        }
        return null
      },
      // 动态计算标题的文本
      titleText() {
        if (this.activeName === 'many') {
            return '动态参数';
        } else {
            return '静态属性';
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }
  .el-cascader {
      width: 200px;
  }
  .el-tag {
      margin: 10px;
  }
  .input-new-tag {
      width: 100px;
  }
</style>
