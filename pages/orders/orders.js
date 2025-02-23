
Page({
  data: {
    cart: [],
    totalPrice: 0,
    selectedItems: [], // 存储选中的商品 ID
  },
  onLoad: function () {
    this.fetchCartData();
  },
  fetchCartData: function () {
    const app = getApp();
    const u_id = app.globalData.u_id;
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/order-list', // 后端 API 地址
      method: 'GET', // 
      data: {
        u_id:u_id
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          let cart = res.data;
                  // 转换 o_time 字符串为 Date 对象
        cart.forEach(item => {
          item.o_time = new Date(item.o_time);  // 假设 o_time 是后端返回的订单时间
        });

        // 按时间降序排序
        cart.sort((a, b) => b.o_time.getTime() - a.o_time.getTime());
        cart.forEach(item => {
          item.o_time = item.o_time.toISOString(); // 或者使用其他格式化方式，根据需要调整
        });
          this.setData({
            cart: cart
          });
          this.updateTotalPrice();
        }
      },
      fail: (err) => {
        console.error('无商品信息', err);
      }
    });
  },


  
  // 计算价格  
  updateTotalPrice: function() {  
    let total = 0;  
    this.data.cart.forEach(item => {  
      console.log(this.data.selectedItems)
      console.log(item.o_id)
      // 检查 item.o_id 是否在 selectedItems 中  
      if (this.data.selectedItems.includes(item.o_id)) {  
        total += item.price * item.o_num;  
      }  
    });  
  
    // 更新总价，并保留两位小数  
    this.setData({  
      totalPrice: total.toFixed(2)  
    });  
  }  ,



  
});
