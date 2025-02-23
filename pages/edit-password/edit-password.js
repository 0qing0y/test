Page({
    data: {
      newPassword: '',
      confirmNewPassword: ''
    },
  
    onInputNewPassword(e) {
      this.setData({ newPassword: e.detail.value });
    },
  
    onInputConfirmNewPassword(e) {
      this.setData({ confirmNewPassword: e.detail.value });
    },
  
    onConfirm() {
      if (!this.data.newPassword) {
        wx.showToast({
          title: '新密码不能为空',
          icon: 'none'
        });
        return;
      }else if (!this.data.confirmNewPassword){
        wx.showToast({
          title: '确认新密码不能为空',
          icon: 'none'
        });
        return;
      }else if (this.data.newPassword !== this.data.confirmNewPassword) {
        wx.showToast({
          title: '密码不一致',
          icon: 'none'
        });
        return;
      }else
      {
      const app = getApp();
      const u_id = app.globalData.u_id;
      // 更新密码逻辑，这里可以调用接口更新服务器密码
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/userpasswordupdate/', // 后端接口的地址
        method: 'PUT',
        data: {
          u_id: u_id,
          u_pw: this.data.newPassword // 传递新的用户名到后端
        },
        success: function(res) {
          console.log(res.data); // 可以在控制台查看后端返回的数据
        if (res.statusCode === 200){
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
          //complete: () => {
            // 注册成功后的跳转逻辑，可以跳转到登录页等
            //wx.navigateTo({
            //  url: '/pages/login/login'
            //});
          //}
        
      }
      else if(res.statusCode === 500){
        wx.showToast({
          title: res.data.error || '密码不符合规范',
          icon: 'none'
        });
      }
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