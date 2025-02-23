
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
      url: 'http://127.0.0.1:8080/testapp/api/cart-list', // 后端 API 地址
      method: 'GET', // 
      data: {
        u_id:u_id
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.setData({
            cart: res.data
          });
          this.updateTotalPrice();
        }
      },
      fail: (err) => {
        console.error('无商品信息', err);
      }
    });
  },

  // 处理复选框变化
  checkboxChange: function(e) {
    const selectedItems = e.detail.value; // 获取所有选中的商品 ID
    this.setData({
      selectedItems: selectedItems
    });
    this.updateTotalPrice(); // 更新总价
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


   // 结算按钮点击处理
   checkout: function() {
    const {
      cart,
      selectedItems
  } = this.data;

    wx.showModal({
      title: '确认支付',
      content: '确定要支付吗？',
      success: (res) => {
          if (res.confirm) {
              console.log('用户点击确定支付');

              let total = 0;
              const selectedProducts = cart.filter(item => selectedItems.includes(item.o_id));
  
              // 计算总价
              selectedProducts.forEach(item => {
                  total += item.price * item.o_num;
              });
  
              if (selectedProducts.length === 0) {
                  wx.showToast({
                      title: '请选择商品',
                      icon: 'none'
                  });
              } else {
                  // 这里可以添加跳转到支付页面的代码或其它业务逻辑
                  wx.request({
                      url: 'http://127.0.0.1:8080/testapp/api/pay', // 后端 API 地址
                      method: 'GET', // 
                      data:{
                        selectedItems:selectedItems
                      },
                      success: (res) => {
                          if (res.statusCode === 200) {
                              wx.showToast({
                                  title: '支付成功',
                                  icon: 'success',
                                 
                              });
                              console.log(selectedItems)
                              wx.request({
                                url: 'http://127.0.0.1:8080/testapp/api/cart-list', // 后端 API 地址
                                method: 'GET', // 
                                success: (res) => {
                                  if (res.statusCode === 200 && res.data) {
                                    this.setData({
                                      cart: res.data
                                    });
                                    this.updateTotalPrice();
                                  }
                                },
                                fail: (err) => {
                                  console.error('无商品信息', err);
                                }
                              });
                          }
                        
                      },
                      fail: (err) => {
                          console.error('error', err);
                      }
                  });
  
              }
          } else if (res.cancel) {
              console.log('用户点击取消支付');
              // 用户取消支付，可以不做处理或者提示取消信息
          }
      }
  });
  
  },
});
