Page({
    data: {
      u_id: '',
      u_name: '',
      u_sex: '',
      u_tl: '',
      u_add: '',
      u_exp: ''
    },
    onShow() {
      const app = getApp();
      const u_id = app.globalData.u_id; // 将 app.globalData.u_id 存储到 u_id 变量中
  this.setData({
    u_id: u_id
  });
  
      // 发起网络请求获取用户信息
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/userinfo/?u_id='+u_id, // 替换为您的后端接口地址
        data: { u_id: u_id },
        success: (res) => {
          const { u_name, u_sex, u_tl, u_add,u_exp } = res.data; // 假设返回的数据结构为 { username, gender, phone, address }
          this.setData({ u_name:u_name, u_sex:u_sex, u_tl:u_tl, u_add:u_add,u_exp:u_exp });
        },
        fail: () => {
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          });
        }
      });
    },
    onEditUsername() {
      wx.navigateTo({ url: '/pages/edit/edit?field=username&value=' + this.data.username });
      wx.navigateTo({
        url: '/pages/edit-name/edit-name', //跳转到用户名页面
      })
    },
  
    onEditGender() {
      wx.navigateTo({ url: '/pages/edit/edit?field=gender&value=' + this.data.gender });
      wx.navigateTo({
        url: '/pages/edit-gender/edit-gender', //跳转到性别页面
      })
    },
  
    onEditPhone() {
      wx.navigateTo({ url: '/pages/edit/edit?field=phone&value=' + this.data.phone });
      wx.navigateTo({
        url: '/pages/edit-phone/edit-phone', //跳转到手机号页面
      })
    },
  
    onEditAddress() {
      wx.navigateTo({ url: '/pages/edit/edit?field=address&value=' + this.data.address });
      wx.navigateTo({
        url: '/pages/edit-address/edit-address', //跳转到地址页面
      })
    },
    onEditExperience() {
      wx.navigateTo({ url: '/pages/edit-experience/edit-experience' });//跳转到工作经历页面
    },
    onEditPassword() {
      wx.navigateTo({ url: '/pages/edit-password/edit-password' });//跳转到密码页面
    
    },
    onConfirm() {
        
        wx.switchTab({
            url: '/pages/my/my'
          });
      }
    });
 