Page({
    data: {
      newUsername: '',
    },
  
    onInputNewAdmin(e) {
      this.setData({ newUsername: e.detail.value });
  },

    onConfirm() {
      if (!this.data.newUsername) {

        wx.showToast({
          title: '用户名不能为空',
          icon: 'none'
        });
        return;
      }
      else
      {
      const u_name=this.data.newUsername;
      const app = getApp();
      const u_id = app.globalData.u_id;
      // 更新密码逻辑，这里可以调用接口更新服务器密码
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/usernameupdate/', // 后端接口的地址
        method: 'PUT',
        data: {
          u_id: u_id,
          u_name: u_name // 传递新的用户名到后端
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