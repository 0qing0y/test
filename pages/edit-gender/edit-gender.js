Page({
  data: {
    genders: ["男", "女"],
    selectedGender: '', // 用户选择的性别
  },

  onGenderChange(e) {
    const index = e.detail.value; // 获取选择的索引
    this.setData({
      selectedGender: this.data.genders[index], // 更新选择的性别
    });
  },

  onConfirm() {

    const app = getApp();
    const u_id = app.globalData.u_id;
    if (!this.data.selectedGender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return;
    }

    // 调用接口更新服务器上的用户性别信息
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/UpdateGenderView/', // 后端接口地址
      method: 'PUT',
      header: {
        'Content-Type': 'application/json',
        //'Authorization': ``, // 替换为实际的令牌
      },
      data: {
        u_sex: this.data.selectedGender,
        u_id: u_id
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 1000,
            complete: () => {
              setTimeout(() => {
                wx.navigateBack();
              }, 1000); // 2000毫秒即2秒延迟跳转
            },
          });
        } else {
          wx.showToast({
            title: '修改失败',
            icon: 'none',
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '请求失败',
          icon: 'none',
        });
      },
    });
  }
});
