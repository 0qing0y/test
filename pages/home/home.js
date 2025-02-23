Page({
  onNavigateHome() {
    wx.navigateTo({ url: '/pages/main/main' });
  },

  onNavigateMarket() {
    wx.navigateTo({ url: '/pages/market/market' });
  },

  onNavigateProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  }
});
