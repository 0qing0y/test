Page({
  data: {
    leaveApplications: [], // 请假申请列表
    leaveApplicationsAll:[],
    selectedStatus: '全部', // 默认选中的审批状态
    position:'0',
    rolesMap: {
      '0': '全部',
      '1': '待审批',
      '2': '已批准',
      '3': '未批准',
    },
  },

  onLoad: function(options) {
    // 模拟请求后端接口获取请假申请数据
    this.fetchLeaveApplications();
  },

  fetchLeaveApplications() {
    // 模拟后端返回的数据
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/allleaverecords',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const leaveRecords = res.data.map(record => ({
            ...record,
            color: this.getStatusColor(record.l_permit),
            text:this.getStatusText(record.l_permit),
            
          }));
          leaveRecords.sort((a, b) => {
            return new Date(b.l_startdate) - new Date(a.l_startdate);
          });
          this.setData({
            leaveApplications: leaveRecords,
            leaveApplicationsAll: leaveRecords, // 备份完整数据
          });
          //console.log(res.data);
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

  // 根据审批状态返回对应颜色
  getStatusColor(status) {
    console.log("yyyyyyyyyyy");
    if (status === 0) {
      return 'blue'; // 待审批状态颜色
    } else if (status === 1) {
      return 'green'; // 已批准状态颜色
    } else  {
      return 'red'; // 未批准状态颜色
    }
  },

  // 根据审批状态返回对应文本
  getStatusText(status) {
    if (status === 0) {
      return '待审批';
    } else if (status === 1) {
      return '已批准';
    } else if (status === 2) {
      return '未批准';
    }
    else return 'hhh'
  },

  // 处理审批状态改变事件
  handleApprovalStatusChange(e) {
    const index = e.detail.value;
    const selectedStatus = ['全部', '待审批', '已批准', '未批准'][index]; // 对应选择器的文本数组
    this.setData({
      selectedStatus: selectedStatus,
      position:index
    });
    // 根据选中的状态筛选请假申请列表
    this.filterUsers(this.data.position);
  },

  // 模拟批准请假操作
  approveLeave(e) {
    const l_id = e.currentTarget.dataset.lid;
    const u_id = e.currentTarget.dataset.uid;
    const l_days = e.currentTarget.dataset.ldays;
    const app = getApp();
    const now_u_id = app.globalData.u_id;
    if(u_id ==now_u_id)
    {
      wx.showToast({
        title: '无法对自己的申请操作，批准失败！',
        icon: 'none',
    });
    return;
    }
    // 实际应用中可以调用后端接口完成批准操作，这里仅更新界面示例
    wx.showModal({
      title: '确认批准',
      content: '确定要批准该请假吗？',
      success: (res) => {
        if (res.confirm) {
          // 用户点击了确定按钮
          wx.request({
            url: 'http://127.0.0.1:8080/testapp/api/approveleave/',
            method: 'PUT',
            data: {
              y_id: now_u_id,
              l_id:l_id,
              u_id:u_id,
              l_days:l_days,
            },
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: '批准成功',
                  icon: 'success',
                });
                // 更新页面数据，移除已授权的员工信息
                this.updateAll();
              } else {
                wx.showToast({
                  title: '批准失败，请稍后再试',
                  icon: 'none',
                });
              }
            },
            fail: (err) => {
              console.error('授权失败', err);
              wx.showToast({
                title: '批准失败，请稍后再试',
                icon: 'none',
              });
            },
          });
        } else if (res.cancel) {
          // 用户点击了取消按钮
          console.log('取消了批准操作');
        }
      },
    });
  },

  // 模拟拒绝请假操作
  rejectLeave(e) {
    const l_id = e.currentTarget.dataset.lid;
    const u_id = e.currentTarget.dataset.uid;
    const app = getApp();
    const now_u_id = app.globalData.u_id;
    if(u_id ==now_u_id)
    {
      wx.showToast({
        title: '无法对自己的申请操作，拒绝失败！',
        icon: 'none',
    });
    return;
    }
    // 实际应用中可以调用后端接口完成批准操作，这里仅更新界面示例
    wx.showModal({
      title: '确认拒绝',
      content: '确定要拒绝该请假吗？',
      success: (res) => {
        if (res.confirm) {
          // 用户点击了确定按钮
          wx.request({
            url: 'http://127.0.0.1:8080/testapp/api/noapproveleave/',
            method: 'PUT',
            data: {
              y_id: now_u_id,
              l_id:l_id
            },
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: '拒绝成功',
                  icon: 'success',
                });
                // 更新页面数据，移除已授权的员工信息
                this.updateAll();
              } else {
                wx.showToast({
                  title: '拒绝失败，请稍后再试',
                  icon: 'none',
                });
              }
            },
            fail: (err) => {
              console.error('拒绝失败', err);
              wx.showToast({
                title: '拒绝失败，请稍后再试',
                icon: 'none',
              });
            },
          });
        } else if (res.cancel) {
          // 用户点击了取消按钮
          console.log('取消了拒绝操作');
        }
      },
    });
  },
  // 更新全部请假列表数据
  updateAll: function () {
  wx.request({
    url: 'http://127.0.0.1:8080/testapp/api/allleaverecords',
    method: 'GET',
    success: (res) => {
      if (res.statusCode === 200) {
        const leaveRecords = res.data.map(record => ({
          ...record,
          color: this.getStatusColor(record.l_permit),
          text:this.getStatusText(record.l_permit),
          
        }));
        leaveRecords.sort((a, b) => {
          return new Date(b.l_startdate) - new Date(a.l_startdate);
        });
        this.setData({
          leaveApplicationsAll: leaveRecords,
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

  filterUsers: function (position) {
    if (position === '0') {
      // 如果选中全部，显示所有记录
      this.setData({
        leaveApplications: this.data.leaveApplicationsAll,
        selectedStatus: '全部',
      });
    } else {
      // 否则，筛选出选中的记录
      const filteredUsers = this.data.leaveApplicationsAll.filter(record => {
        return record.l_permit === Number(position)-1;
      });
      this.setData({
        leaveApplications: filteredUsers,
        selectedStatus: this.data.rolesMap[Number(position)],
      });
    }
  },
});