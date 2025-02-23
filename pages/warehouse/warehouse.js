// pages/warehouse/warehouse.js
Page({
    data:{
      warehouse:[

      ],

    },

    onLoad: function () {
     
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/warehouse-list', // 替换为实际的后端接口地址
        method: 'GET',
        success: (res) => {
          console.log(res.data); // 打印后端返回的数据，确认数据格式与字段名
          this.setData({
            warehouse: res.data // 更新页面的数据
          });
        },
        fail: (err) => {
          console.error('请求失败', err);
        }
      });
    },
  
  viewDetails: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/warehousedetail/warehousedetail?id=${id}`
    });
  }
});
