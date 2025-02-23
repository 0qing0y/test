Page({
  data: {
    image: "task1.jpg",
    showModal: false,
    currentTask: {
      m_id: '',
      m_desc: '',
      m_start: '',
      m_ddl: ''
      // Initialize other task details if needed
    },
  },
  closeModal() {
    this.setData({
      showModal: false,
      currentTask: {}
    });
  },
  
  // 查看任务详情
  viewTaskDetails() {
    const app = getApp();
    const u_id = app.globalData.u_id;

    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/viewTaskDetails',
      method: 'GET',
      data: {
        u_id: u_id
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const task = res.data;
          this.setData({
            showModal: true,
            currentTask: {
              m_id: task.m_id,
              m_desc: task.m_desc,
              m_start: task.m_start,
              m_ddl: task.m_ddl
              // Add other task details as needed
            }
          });
        } else {
          wx.showToast({
            title: '你还没有任务！再歇会儿吧',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '获取任务详情失败',
          icon: 'none'
        });
      }
      
    });

  },
// 关闭弹窗
closeModal() {
  this.setData({
    showModal: false
  });
},
  // 领取任务
  claimTask() {
    const app = getApp();
    const u_id = app.globalData.u_id;

    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/claimTask',
      method: 'GET',
      data: {
        u_id: u_id
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.message === "领取成功") {
          wx.showToast({
            title: '领取成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '任务空',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '领取失败',
          icon: 'none'
        });
      }
    });
  },

  completeTask(){
    const app = getApp();
    const u_id = app.globalData.u_id;

    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/completeTask',
      method: 'GET',
      data: {
        u_id: u_id
      },
      success: (res) => {
        if (res.statusCode === 200 ) {
          wx.showToast({
            title: '任务完成，辛苦！',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || 'error',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: 'error2',
          icon: 'none'
        });
      }
    });




  }

});

