Page({
    data: {
      userInfo: null,
      avatarUrl: '', // 用于存储用户头像URL
    },
    
    
onLoad: function() {
  // 在页面加载时尝试从文件系统中获取头像URL
  let avatarUrl = wx.getStorageSync('avatarUrl');
  if (avatarUrl) {
    this.setData({
      avatarUrl: avatarUrl,
    });
  } else {
   // this.chooseImage(); // 如果没有头像，则引导用户选择
   return
  }
},

chooseImage: function() {
  let that = this;
  wx.chooseMedia({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: function(res) {
      const tempFilePaths = res.tempFiles;
      that.uploadAvatar(tempFilePaths[0].tempFilePath);
    }
  });
},

uploadAvatar: function(filePath) {
  let that = this;
  wx.uploadFile({
    url: 'http://127.0.0.1:8080/testapp/api/upload_avatar/',
    filePath: filePath,
    name: 'avatar',
    success: function(res) {
      let data = JSON.parse(res.data);
      if (data.status === 'success') {
        // 将临时文件保存为永久文件
        wx.getFileSystemManager().saveFile({
          tempFilePath: filePath,
          success: function(saveRes) {
            let savedFilePath = saveRes.savedFilePath;

            that.setData({
              avatarUrl: savedFilePath // 使用文件系统路径
            });
            wx.setStorageSync('avatarUrl', savedFilePath); // 缓存永久文件路径
          }
        });
      } else {
        console.error('上传失败:', data.message);
      }
    },
    fail: function(err) {
      console.error('上传失败:', err);
    }
  });
},


logout: function() {
  wx.redirectTo({
    url: '/pages/login/login'
  });
},
    
getUserInfo: function(e) {
  console.log('12121212');
  if (e.detail.userInfo) {
    // 用户已经授权
    this.setData({
      userInfo: e.detail.userInfo
    });
    wx.getUserInfo({
      success: (res) => {
        console.log('用户信息：', res.userInfo);
        // 在这里可以获取到用户的头像链接 res.userInfo.avatarUrl
        this.setData({
          userInfo: res.userInfo
        });
      },
      fail: function(err) {
        console.error('获取用户信息失败：', err);
      }
    });
  } else {
    // 用户拒绝授权，可以提示用户或执行其他操作
    console.log('用户拒绝了获取用户信息');
  }
},
    // getUserInfo: function() {
    //   console.log('12121212');
    //   let that = this;
    //   // 调用小程序的接口获取用户信息
    //   wx.getUserInfo({
    //     success: function(res) {
    //       let userInfo = res.userInfo;
    //       that.setData({
    //         userInfo: userInfo
    //       });
    //       // 将用户信息存储到缓存中
    //       wx.setStorageSync('userInfo', JSON.stringify(userInfo));
    //     },
    //     fail: function(res) {
    //       // 获取用户信息失败的处理逻辑
    //     }
    //   })
    // },
    //跳转到个人信息修改页面
    basicClick: function() {
      wx.navigateTo({
        url: '/pages/profile/profile'
      });
    },

    //跳转到联系我们页面
    aboutClick: function() {
      wx.navigateTo({
        url: '/pages/callus/callus'
      });
    },

    //退出返回到登录页面
    logout: function() {
      // 清除缓存中的用户信息
      wx.removeStorageSync('userInfo');
  
      this.setData({
        userInfo: null
      });
  
      wx.redirectTo({
        url: '/pages/login/login'//登录页面地址
      });
    }
  });
  