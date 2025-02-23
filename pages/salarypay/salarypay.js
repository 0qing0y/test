Page({
  data: {
    showModal1: false,
    showModal2: false,
    allData: [],
    paidData: [],
    unpaidData: [],
    summary: null,
    selectedStatus: '全部',
    leaveApplications: [],
    leaveApplicationsShowStatus:[],
    leaveApplicationsShowYear:[],
    position:'0',
    selectedYear:'全部',
    selectedMonth:'全部'
    
  },
  filterUsers: function (position) {
    if (position === '0') {
      // 如果选中全部，显示所有记录
      this.setData({
        leaveApplicationsShow: this.data.allData,
        selectedStatus: '全部',
      });
    } else if (position === '1'){
      this.setData({
        leaveApplicationsShow: this.data.unpaidData,
        selectedStatus: '未发放工资',
      });
    }
    else{
      this.setData({
        leaveApplicationsShow: this.data.paidData,
        selectedStatus: '已发放工资',
      });
    }
    this.setData({
      leaveApplicationsShowStatus: this.data.leaveApplicationsShow,
    });
  },
  onLoad: function() {
    this.fetchAttendanceData();
  },
  fetchAttendanceData: function() {
    let that = this;
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/get_attendance_list/',
      method: 'GET',
      success: function(res) {
        // 获取到的所有数据
        const allData = res.data.all_data;
    
        // 对数据按照年份和月份从晚到早排序
        allData.sort((a, b) => {
          // 比较年份
          if (a.am_year !== b.am_year) {
            return b.am_year - a.am_year;
          } else {
            // 年份相同的情况下，比较月份
            return b.am_month - a.am_month;
          }
        });
        // 分类数据
        const paidData = allData.filter(item => item.is_paid);
        const unpaidData = allData.filter(item => !item.is_paid);
        // 更新页面数据
        that.setData({
          allData: allData,
          paidData: paidData,
          unpaidData: unpaidData
        });
        that.filterUsers(that.data.position);
      },
      fail: function(err) {
        console.error('请求失败', err);
      }
    });
  },
  handleApprovalStatusChange(e) {
    const index = e.detail.value;
    const selectedStatus = ['全部', '未发放工资', '已发放工资'][index]; // 对应选择器的文本数组
    this.setData({
      selectedStatus: selectedStatus,
      position:index,
      selectedMonth:'全部',
      selectedYear:'全部'
    });
    this.filterUsers(this.data.position);
  },
  handleYearChange(e) {
    const index = e.detail.value;
    const selectedYear = ['全部','2024', '2025', '2026','2027', '2028', '2029','2030', '2031', '2032', '2033'][index]; // 对应选择器的文本数组
    console.log(selectedYear);
    let data=[];
    if(selectedYear=='全部'){
      data = this.data.leaveApplicationsShowStatus;
    }
    else{
      data = this.data.leaveApplicationsShowStatus.filter(item => Number(item.am_year)===Number(selectedYear));
    }
    this.setData({
      selectedYear: selectedYear,
      leaveApplicationsShow:data,
      selectedMonth:'全部'
    });
    this.setData({
      leaveApplicationsShowYear: this.data.leaveApplicationsShow,
    });
  },
  handleMonthChange(e) {
    //console.log(this.data.leaveApplicationsShowYear);
    if(!this.data.leaveApplicationsShowYear|| this.data.leaveApplicationsShowYear.length === 0){
      //console.log("11111111");
      let data=this.data.leaveApplicationsShowStatus;
    this.setData({
      leaveApplicationsShowYear: data,
    });
    }
    //console.log(this.data.leaveApplicationsShowStatus);
   //console.log(this.data.leaveApplicationsShowYear);

    const index = e.detail.value;
    const selectedMonth = ['全部','1', '2', '3','4','5','6','7','8','9','10','11','12'][index]; // 对应选择器的文本数组
    let data =[];
    console.log(selectedMonth);
    if(selectedMonth=='全部'){
      data = this.data.leaveApplicationsShowYear;
    }
    else{
      data = this.data.leaveApplicationsShowYear.filter(item => Number(item.am_month)===Number(selectedMonth));
    }
    this.setData({
      selectedMonth: selectedMonth,
      leaveApplicationsShow:data
    });
  },
  
  CheckAttendanceMonth: function(e) {
    const am_id = e.currentTarget.dataset.amid;
    const am_year = e.currentTarget.dataset.amyear;
    const am_month = e.currentTarget.dataset.ammonth;
    const u_id = e.currentTarget.dataset.uid;
      // 获取当前日期的年份和月份
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 月份从0开始，需要加1
    // 判断am_year是否为当前的年份
    if (am_year === currentYear && am_month === currentMonth) {
      this.setData({
        showModal1: true,
      });
    }
    else{
      this.setData({
        showModal2: true,
      });
    }
    wx.request({
      url: `http://127.0.0.1:8080/testapp/api/attendancemonth/?u_id=${u_id}&year=${am_year}&month=${am_month}`,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const salary = 3000+res.data.am_OThour*25-res.data.am_latetimes*50-res.data.am_earlytimes*50-res.data.am_absenttimes*100;
          // 更新 summary 数据，包括工资字段
          this.setData({
            summary: {
              ...res.data, // 保留原始数据
              salary: salary, // 添加工资字段
            },

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

  },
  markAsPaid: function(e) {
    const am_year = e.currentTarget.dataset.amyear;
    const am_month = e.currentTarget.dataset.ammonth;
    const u_id = e.currentTarget.dataset.uid;
    let attendanceId = e.currentTarget.dataset.amid;
    console.log(attendanceId);
    wx.showModal({
      title: '确认发放',
      content: '确定发放工资吗？',
      success: (res) => {
        if (res.confirm) {
          // 用户点击了确定按钮
          wx.request({
            url: 'http://127.0.0.1:8080/testapp/api/salarypay/',
            method: 'PUT',
            data: {
              am_id: attendanceId,
              salary:this.data.summary.salary,
            },
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: '发放成功',
                  icon: 'success',
                });
                // 更新页面数据，移除已授权的员工信息
                //this.updateAll();
                this.fetchAttendanceData();
                wx.request({
                  url: `http://127.0.0.1:8080/testapp/api/attendancemonth/?u_id=${u_id}&year=${am_year}&month=${am_month}`,
                  method: 'GET',
                  header: {
                    'content-type': 'application/json'
                  },
                  success: (res) => {
                    if (res.statusCode === 200) {
                      const salary = 3000+res.data.am_OThour*25-res.data.am_latetimes*50-res.data.am_earlytimes*50-res.data.am_absenttimes*100;
                      // 更新 summary 数据，包括工资字段
                      this.setData({
                        summary: {
                          ...res.data, // 保留原始数据
                          salary: salary, // 添加工资字段
                        },
            
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
              } else {
                wx.showToast({
                  title: '发放失败，请稍后再试',
                  icon: 'none',
                });
              }
            },
            fail: (err) => {
              console.error('发放失败', err);
              wx.showToast({
                title: '发放失败，请稍后再试',
                icon: 'none',
              });
            },
          });
        } else if (res.cancel) {
          // 用户点击了取消按钮
          console.log('取消了发放操作');
        }
      },
    });
  },
  closeModal1: function() {
    this.setData({
      showModal1: false,
    });
  },
  closeModal2: function() {
    this.setData({
      showModal2: false,
    });
  },
});