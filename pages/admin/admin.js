Page({
  data: {    showPublishTask: false,
             showModifyPermissions: false
  },

  viewLandInfo: function() {
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/land_info/',
      method: 'GET',
      success: function(res) {
        console.log(res.data);
        // 显示土地信息
      }
    });
  },

  viewFarmInfo: function() {
    wx.request({
      url: 'https://your-django-server-url/farm-info/',
      method: 'GET',
      success: function(res) {
        console.log(res.data);
        // 显示养殖场信息
      }
    });
  },

  togglePublishTaskForm: function() {
    this.setData({
      showPublishTask: !this.data.showPublishTask,
      showModifyPermissions: false
    });
  },

  toggleModifyPermissionsForm: function() {
    this.setData({
      showModifyPermissions: !this.data.showModifyPermissions,
      showPublishTask: false
    });
  },

  publishTask: function(e) {
    // 发布任务逻辑
  },

  modifyPermissions: function(e) {
    // 修改权限逻辑
  },
});
