Page({
  data: {
    newPhone: '',
  },

  onInputNewPhone(e) {
    this.setData({ newPhone: e.detail.value });
  },

  onConfirm() {
    const phone = this.data.newPhone;
    const phoneRegex = /^1[3-9]\d{9}$/; // 简单的中国大陆手机号正则表达式

    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      });
      return;
    } else if (!phoneRegex.test(phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      });
      return;
    } 
     else {
      const app = getApp();
      const u_id = app.globalData.u_id;
      // 更新信息逻辑，这里可以调用接口更新服务器信息
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/userphoneupdate/', // 后端接口的地址
        method: 'PUT',
        data: {
          u_id: u_id,
          u_tl: phone // 传递新的用户名到后端
        },
        success: function(res) {
          console.log(res.data);
          wx.showToast({
            title: '信息更新成功',
            icon: 'success',
            duration: 1000,
            complete: () => {
              setTimeout(() => {
                wx.navigateBack();
              }, 1000); // 2000毫秒即2秒延迟跳转
            },
          });
        },
        fail: function(err) {
          console.error(err);
          wx.showToast({
            title: '信息更新失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    }
  }
});