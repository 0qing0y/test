Page({
  /**
   * 页面的初始数据
   */
  data: {
    leftitem: [
      {g_id: 1, g_name: "作物"},
      {g_id: 2, g_name: "畜禽"}
    ],
    rightitem: [],
    count: 0,
  },

  onLoad() {
    this.fetchGoodsData();
  },

  fetchGoodsData() {
    const that = this;
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/goods/', // 替换为你的Django服务器地址
      method: 'GET',
      success(res) {
        const allGoods = res.data;
        const categorizedGoods = allGoods.map(item => ({
          ...item,
          tag: item.g_desc == 1 ? 0 : 1,
          url: item.g_name+".jpg"
        }));
        that.setData({ rightitem: categorizedGoods });
      },
      fail(err) {
        console.error("Failed to fetch goods data:", err);
      }
    });
  },

  click_nav_right(event) {
    var data_one = event.currentTarget.dataset.index_two;
    wx.navigateTo({
      url: '/pages/goodsdetails/goodsdetails?data=' + data_one,
    });
  },

  switchRightTab(event) {
    this.setData({
      count: event.target.dataset.index
    });
  },
});