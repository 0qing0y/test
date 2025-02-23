Page({
  data:{},
  navigateToShop() {
    wx.navigateTo({
      url: '/pages/goods/goods'
    });
  },
  navigateToCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  },
  navigateToOrders() {
    wx.navigateTo({
      url: '/pages/orders/orders'
    });
  }
});
