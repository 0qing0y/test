Page({
  data: {
    u_id: '',
    u_pw: ''
  },

  // 获取用户名输入
  onInputUsername(event) {
    this.setData({
      u_id: event.detail.value
    });
  },

  // 获取密码输入
  onInputPassword(event) {
    this.setData({
      u_pw: event.detail.value
    });
  },

  // 登录处理函数
  onLogin: function() {
    const data = this.data;

    if (!data.u_id || !data.u_pw) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/ulogin/',
      method: 'POST',
      data: data,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('Response:', res);  // 打印服务器响应
        if (res.statusCode === 200 && res.data.message === "登录成功") {
          const app = getApp();
          app.globalData.u_id = data.u_id;  // 设置全局 u_id
          const u_uid = res.data.u_uid;
          app.globalData.u_uid = u_uid;
          console.log(u_uid);
          console.log(app.globalData.u_uid);
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 2000,
            success: function() {
              // 延迟2秒后跳转到首页
              setTimeout(function () {
                if (u_uid !== 5) {
                  wx.switchTab({
                    url: '/pages/index/index'  // 管理员页面
                  });
                } else {
                  wx.switchTab({
                    url: '/pages/market/market'  // 顾客页面
                  });
                }
              }, 1000);
            }
          });
        }else {
          wx.showToast({
            title: res.data.error || '登录失败',
            icon: 'none'
          });
        }
      },
      fail(error) {
        wx.showToast({
          title: '请求失败，请稍后重试',
          icon: 'none'
        });
        console.error('Login request failed:', error);  // 打印请求错误
      }
    });
  },
  onRegister() {
        wx.navigateTo({ url: '/pages/register/register' });  //!!!!!!
      },
});