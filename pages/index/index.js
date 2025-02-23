Page({
  data: {
    u_uid:0
  },
  onShow: function () {
    const app = getApp();
    const u_id = app.globalData.u_id;
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/uuid/?u_id='+u_id, // 替换为您的后端接口地址
      data: { u_id: u_id },
      success: (res) => {
        const { u_uid } = res.data;
        app.globalData.u_uid=u_uid;
      },
      fail: () => {
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    });

    const u_uid = app.globalData.u_uid;
    console.log(u_uid);
    // if (u_uid === "1"||u_uid === "2") { // 如果用户是管理员，不进行任何限制
    //   return;
    // }
    this.setData({
      u_uid:u_uid
    })

    // 如果用户不是管理员，则禁用首页的点击功能
    //wx.hideTabBar({
    //  index: 0 // 隐藏 tabBar 的第一个图标（即首页）
    //});
  },
  navigateToLand() {
    if (this.data.u_uid == 1||this.data.u_uid == 2) { // 如果用户是管理员或农田员工   
    wx.navigateTo({
      url: '/pages/land/land'
    });
    }
    else{
      wx.showToast({
        title: '没有权限！',
        icon: 'none'
      });
    }
  },
  navigateToFarm() {
    if (this.data.u_uid == 1||this.data.u_uid == 3) { // 如果用户是管理员或养殖场员工 
    wx.navigateTo({
      url: '/pages/farm/farm'
    });
  }
  else{
    wx.showToast({
      title: '没有权限！',
      icon: 'none'
    });
  }
  },
  navigateToWarehouse() {
    if (this.data.u_uid == 1||this.data.u_uid == 4) { // 如果用户是管理员或仓库员工 
    wx.navigateTo({
      url: '/pages/warehouse/warehouse'
    });
  }
  else{
    wx.showToast({
      title: '没有权限！',
      icon: 'none'
    });
  }
  },
  navigateToAnnouncements() {//每日考勤
    if (this.data.u_uid == 1 ||this.data.u_uid == 2 ||this.data.u_uid == 3 ||this.data.u_uid == 4) { // 如果用户是员工
    wx.navigateTo({
      url: '/pages/attendance/attendance'
    });
  }
    else{
      wx.showToast({
        title: '没有权限！',
        icon: 'none'
      });
    }
  },
  navigateToTasks() {
    if (this.data.u_uid == 1 ||this.data.u_uid == 2 ||this.data.u_uid == 3 ||this.data.u_uid == 4) { // 如果用户是员工
    wx.navigateTo({
      url: '/pages/job/job'
    });
  }
  else{
    wx.showToast({
      title: '没有权限！',
      icon: 'none'
    });
  }
  },
  navigateToGuide() { //员工管理
    if (this.data.u_uid == 1) { // 如果用户是管理员
    wx.navigateTo({
      url: '/pages/employeemanage/employeemanage'
    });
  }
  else{
    wx.showToast({
      title: '没有权限！',
      icon: 'none'
    });
  }
  },
  navigateToAnimal() {
    if (this.data.u_uid == 1||this.data.u_uid == 3) { // 如果用户是管理员或养殖场员工 
        wx.navigateTo({
          url: '/pages/animal/animal'
        });
    }
    else{
      wx.showToast({
        title: '没有权限！',
        icon: 'none'
      });
    }
  },
  navigateToFruit() {
    if (this.data.u_uid == 1||this.data.u_uid == 2) { // 如果用户是管理员或农田员工 
        wx.navigateTo({
          url: '/pages/fruit/fruit'
        });
    }
    else{
      wx.showToast({
        title: '没有权限！',
        icon: 'none'
      });
    }
  },
      
  navigateToManageshop() {
    if (this.data.u_uid == 1) { // 如果用户是管理员
        wx.navigateTo({
          url: '/pages/manageshop/manageshop'
        });
    }
    else{
      wx.showToast({
        title: '没有权限！',
        icon: 'none'
      });
    }
  },
  navigateToWeather(){
    wx.navigateTo({
            url: '/pages/weather/weather'
          });
  }
});
