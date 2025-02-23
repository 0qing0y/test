Page({
  data: {
    unauthorizedUsers: [], // 存放未授权员工列表数据
    unauthorizedUsersAll: [],
    rolesMap: {
      '11': '管理员',
      '12': '农田员工',
      '13': '养殖场员工',
      '14': '仓库员工',
    },
    position:0,
    selectedPosition: '全部', // 默认选中的职位为全部
  },
  
  // 添加筛选功能
  filterUsers: function (position) {
    if (position === '0') {
      // 如果选中全部，显示所有员工
      this.setData({
        unauthorizedUsers: this.data.unauthorizedUsersAll,
        selectedPosition: '全部',
      });
    } else {
      // 否则，筛选出选中职位的员工
      const filteredUsers = this.data.unauthorizedUsersAll.filter(user => {
        return user.u_uid === Number(position)+10;
      });
      this.setData({
        unauthorizedUsers: filteredUsers,
        selectedPosition: this.data.rolesMap[Number(position)+10],
      });
    }
  },

  onLoad: function () {
    // 页面加载时请求后端数据，获取未授权员工信息
    this.getUnauthorizedUsers();
  },

  
getUnauthorizedUsers: function () {
  // 发送请求到后端，获取未授权员工信息
  wx.request({
    url: 'http://127.0.0.1:8080/testapp/api/getUnauthorizedUsers',
    method: 'GET',
    success: (res) => {
      if (res.statusCode === 200) {
        this.setData({
          unauthorizedUsers: res.data,
          unauthorizedUsersAll: res.data, // 备份完整数据
        });
        console.log(res.data);
      } else {
        wx.showToast({
          title: '获取数据失败，请稍后再试',
          icon: 'none',
        });
      }
    },
    fail: (err) => {
      console.error('获取数据失败', err);
      wx.showToast({
        title: '获取数据失败，请稍后再试',
        icon: 'none',
      });
    },
  });
},

authorizeUser: function (event) {
  //const app = getApp();
  //const now_u_id = app.globalData.u_id;

  const u_id = event.currentTarget.dataset.uid;
  //const u_uid = event.currentTarget.dataset.uuid;
  //if(u_uid=='11')
  //{
  //  if(now_u_id=='')
  //}
  //else{
  // 弹出确认框
  wx.showModal({
    title: '确认授权',
    content: '确定要授权该员工吗？',
    success: (res) => {
      if (res.confirm) {
        // 用户点击了确定按钮
        wx.request({
          url: 'http://127.0.0.1:8080/testapp/api/authorizeUser/',
          method: 'PUT',
          data: {
            u_id: u_id,
          },
          success: (res) => {
            if (res.statusCode === 200) {
              wx.showToast({
                title: '授权成功',
                icon: 'success',
              });
              // 更新页面数据，移除已授权的员工信息
              this.updateUnauthorizedUsers();
            } else {
              wx.showToast({
                title: '授权失败，请稍后再试',
                icon: 'none',
              });
            }
          },
          fail: (err) => {
            console.error('授权失败', err);
            wx.showToast({
              title: '授权失败，请稍后再试',
              icon: 'none',
            });
          },
        });
      } else if (res.cancel) {
        // 用户点击了取消按钮
        console.log('用户取消了授权操作');
      }
    },
  });
//}
},

// 更新未授权员工列表数据
updateUnauthorizedUsers: function () {
  wx.request({
    url: 'http://127.0.0.1:8080/testapp/api/getUnauthorizedUsers',
    method: 'GET',
    success: (res) => {
      if (res.statusCode === 200) {
        this.setData({
          unauthorizedUsersAll: res.data,
        });
        this.filterUsers(this.data.position);
      } else {
        wx.showToast({
          title: '获取数据失败，请稍后再试',
          icon: 'none',
        });
      }
    },
    fail: (err) => {
      console.error('获取数据失败', err);
      wx.showToast({
        title: '获取数据失败，请稍后再试',
        icon: 'none',
      });
    },
  });
},


  // 筛选条件改变时触发


  handlePositionChange: function (e) {
    this.setData({
      position: e.detail.value
    });
    this.filterUsers(this.data.position);
  },
});