<template>
	<el-container class="home_container">
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <el-menu
                      :default-active="activePath"
                      class="el-menu-vertical-demo"
                      background-color="#373d41"
                      text-color="#fff"
                      active-text-color="#409EFF"
                      unique-opened
                      :collapse="isCollapse"
                      :collapse-transition="false"
                      router>
                      <div class="collapseBtn" @click="Collapse">|||</div>
                      <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                        <template slot="title">
                          <i :class="iconsObj[item.id]"></i>
                          <span>{{item.authName}}</span>
                        </template>
                        <el-menu-item
                        :index="'/' + submenu.path"
                        v-for="submenu in item.children"
                        :key="submenu.id"
                        @click="saveNavState('/' + submenu.path)">
                            <template slot="title">
                              <i class="el-icon-menu"></i>
                              <span>{{submenu.authName}}</span>
                            </template>
                        </el-menu-item>
                      </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
	</el-container>
</template>

<script>
	export default {
		name: 'Home',
        data () {
            return {
                menulist: [],
                iconsObj: {
                    125: 'iconfont icon-user',
                    103: 'iconfont icon-tijikongjian',
                    101: 'iconfont icon-shangpin',
                    102: 'iconfont icon-danju',
                    145: 'iconfont icon-baobiao'
                },
                // 是否折叠
                isCollapse: false,
                // 当前的链接地址
                activePath: ''
            }
        },
        created() {
            this.getMenuList();
            this.activePath = window.sessionStorage.getItem('activePath');
        },
		methods: {
			logout() {
				window.sessionStorage.clear();
				this.$router.push('login');
			},
            // 获取所有的菜单
            async getMenuList() {
                const { data: res } = await this.$ajax.get('menus');
                console.log(res);
                if (res.meta.status !== 200) {
                    return this.$message.error(res.meta.msg);
                } else {
                    this.menulist = res.data;
                }
            },
            // 点击按钮，切换菜单的折叠与展开
            Collapse() {
                this.isCollapse = !this.isCollapse;
            },
            // 保存链接的激活状态
            saveNavState(activePath) {
                window.sessionStorage.setItem('activePath', activePath);
                this.activePath = activePath;
            }
		}
	}
</script>

<style lang="less" scoped>
    .home_container {
        height: 100%;
    }
    .el-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 0;
        background-color: #373d41;
        font-size: 20px;
        color: #fff;
        > div {
            display: flex;
            align-items: center;
            span {
              margin-left: 15px;
            }
        }
    }
    .el-aside {
        background-color: #333744;
        .el-menu {
            border-right: none;
        }
    }
    .iconfont {
        margin-right: 5px;
    }
    .collapseBtn {
        background-color: #4a5064;
        font-size: 10px;
        color: #fff;
        text-align: center;
        line-height: 24px;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
</style>
