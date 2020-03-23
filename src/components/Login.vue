<template>
    <div class="login_container">
        <div class="login_box">
            <div class="logo">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单区域 -->
            <el-form class="login_form" label-width="0px" ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Login',
    data() {
        return {
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            loginFormRules: {
                username: [
                  { required: true, message: '请输入登录名称', trigger: 'blur' },
                  { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                // 验证密码是否合法
                password: [
                  { required: true, message: '请输入登录密码', trigger: 'blur' },
                  { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }
        }
    },
	methods: {
		// 重置
		resetLoginForm() {
			// console.log(this);
			this.$refs.loginFormRef.resetFields();
		},
		login() {
			this.$refs.loginFormRef.validate(async result => {
				if (!result) return;
				const { data: res } = await this.$ajax.post('login', this.loginForm);
				if (res.meta.status !== 200) return this.$message.error('登录失败!');
				this.$message.success('登录成功');
				// 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
				//   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
				//   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
				window.sessionStorage.setItem('token', res.data.token);
				// 2. 通过编程式导航跳转到后台主页，路由地址是 /home
				this.$router.push('/home');
			})
		}
	}
}
</script>

<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;
}
.login_box {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    .logo {
        position: absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 130px;
        height: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
}
.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
.btns {
    display: flex;
    justify-content: flex-end;
}
</style>
