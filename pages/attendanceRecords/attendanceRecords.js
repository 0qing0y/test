// pages/attendanceRecords/attendanceRecords.js
Page({
  data: {
    leftitem: [
      { id: 1, name: '所有记录' },
      { id: 2, name: '正常考勤' },
      { id: 3, name: '迟到记录' },
      { id: 4, name: '早退记录' },
      { id: 5, name: '加班记录' },
      { id: 6, name: '月度汇总' }
    ],
    rightitem: [],
    count: 0, // 初始选项
    u_id: '', // 用户ID
    years: [], // 年份选择列表
    months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], // 月份选择列表
    selectedYear: '', // 选定的年份
    selectedMonth: '', // 选定的月份
    summary: null // 月度汇总信息,初始为null
  },

  onLoad() {
    const app = getApp();
    const u_id = app.globalData.u_id;
    //this.setData({ u_id });
    // 初始化右侧显示的内容
    this.data.u_id=u_id;
    // 初始化年份选择列表
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const years = [];
    for (let i = currentYear; i >= currentYear - 40; i--) {
      years.push(i.toString());
    }
    this.setData({
      years,
      selectedYear: currentYear.toString(),
      selectedMonth: currentMonth
    });
    this.updateRightItems(0);
  },

  switchRightTab: function (e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      count: index
    });
    this.updateRightItems(index);
  },
  bindYearChange: function (e) {
    this.setData({
      selectedYear: this.data.years[e.detail.value]
    });
  },

  bindMonthChange: function (e) {
    this.setData({
      selectedMonth: this.data.months[e.detail.value]
    });
  },

  filterRecords: function () {
    this.updateRightItems(this.data.count);
  },

  updateRightItems: function (index) {
    let url = '';
    const { u_id, selectedYear, selectedMonth } = this.data;
    switch (index) {
      case 0:
        url = 'http://127.0.0.1:8080/testapp/api/allattrecords/' + u_id + '/?year=' + selectedYear + '&month=' + selectedMonth;
        break;
      case 1:
        url = 'http://127.0.0.1:8080/testapp/api/normalattrecords/' + u_id + '/?year=' + selectedYear + '&month=' + selectedMonth;
        break;
      case 2:
        url = 'http://127.0.0.1:8080/testapp/api/lateattrecords/' + u_id + '/?year=' + selectedYear + '&month=' + selectedMonth;
        break;
      case 3:
        url = 'http://127.0.0.1:8080/testapp/api/earlyleaveattrecords/' + u_id + '/?year=' + selectedYear + '&month=' + selectedMonth;
        break;
      case 4:
        url = 'http://127.0.0.1:8080/testapp/api/overtimeattrecords/' + u_id + '/?year=' + selectedYear + '&month=' + selectedMonth;
        break;
      case 5:
        this.fetchAttendanceMonth(u_id, selectedYear, selectedMonth);
        return; // 跳过请求，因为汇总是独立处理的
      default:
        return;
    }

    wx.request({
      url: url,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        this.setData({ rightitem: res.data });
      },
      fail: (err) => {
        console.error('Request failed:', err);
      }
    });
  },

  fetchAttendanceMonth(u_id, year, month) {
    wx.request({
      url: `http://127.0.0.1:8080/testapp/api/attendancemonth/?u_id=${u_id}&year=${year}&month=${month}`,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            summary: res.data,
            rightitem: [] // 清空rightitem，因为显示的是汇总信息
          });
        } else {
          wx.showToast({
            title: '获取汇总信息失败',
            icon: 'none',
            duration: 2000
          });
          this.setData({ summary: null }); // 清空summary数据
        }
      },
      fail: (err) => {
        console.error('Fetch attendance summary failed:', err);
        wx.showToast({
          title: '请求失败',
          icon: 'none',
          duration: 2000
        });
        this.setData({ summary: null }); // 清空summary数据
      }
    });
  }

});
