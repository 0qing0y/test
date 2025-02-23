Page({
  data: {
    today: '',
    endDate: '',
    startDate: '',
    leaveDays: '',
    leaveReason: '',



    showMonthPicker: false, // 控制月份选择器的显示隐藏
    month: '', // 选择的月份
    startDate: '2024-01-01', // 开始日期，根据实际需要调整
    endDate: '2025-01-01', // 结束日期，根据实际需要调整
  },
  
  onLoad: function(options) {
    const today = new Date();
    const endDate = new Date(today.getTime() + 30 * 24 * 3600 * 1000);
    this.setData({
      today: this.formatDate(today),
      endDate: this.formatDate(endDate),
    });
  },
  
  bindStartDateChange: function(e) {
    const startDate = e.detail.value;
      this.setData({
        startDate: startDate,
      });
  },
  
  inputLeaveDays: function(e) {
    this.setData({
      leaveDays: e.detail.value,
    });
  },
  
  inputLeaveReason: function(e) {
    this.setData({
      leaveReason: e.detail.value,
    });
  },
  
  submitLeave: function() {
    const app = getApp();
    const u_id = app.globalData.u_id;
    const { startDate, endDate, leaveDays, leaveReason } = this.data;
  
    if (!startDate || !leaveDays || !leaveReason) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none',
      });
      return;
    }
  
    if (!this.checkLeavePeriod(startDate, leaveDays)) {
      wx.showToast({
        title: '请假结束日期不能超过月底，请分开两次请假！',
        icon: 'none',
      });
      return;
    }
  
    //const actualEndDate = this.calculateEndDate(startDate, leaveDays);
  
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/submit_leave/',
      method: 'POST',
      data: {
        l_startdate: startDate,
        //l_enddate: actualEndDate,
        l_days: leaveDays,
        l_reason: leaveReason,
        u_id: u_id,
      },
      header: {
        'content-type': 'application/json',
      },
      success: (res) => {
        if (res.statusCode === 201) {
          console.log('提交请假申请成功:', res.data);
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1000,
            complete: () => {
              setTimeout(() => {
                wx.navigateBack();
              }, 1000);
            },
          });
        } else {
          wx.showToast({
            title: '提交失败',
            icon: 'none',
          });
        }
      },
      fail: function(error) {
        console.error('提交请假申请失败:', error);
        wx.showToast({
          title: '提交失败',
          icon: 'none',
          duration: 2000,
        });
      },
    });
  },
  
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
  },
  
  checkLeavePeriod: function(startDate, leaveDays) {
    const start = new Date(startDate);
    const end = this.calculateEndDate(startDate, leaveDays);
  
    return start.getMonth() === end.getMonth();
  },
  
  calculateEndDate: function(startDate, leaveDays) {
    const start = new Date(startDate);
    const endDate = new Date(start.getTime() + (leaveDays - 1) * 24 * 3600 * 1000);
    return endDate;
  },

  
//导出信息
exportUserData: function() {
  const app = getApp();
  const u_uid=app.globalData.u_uid;
// 判断是否为管理员
  if (u_uid !== 1) {
    wx.showToast({
      title: '只有管理员可以导出',
      icon: 'none',
    });
    return;
  }
  wx.showLoading({
    title: '导出中...',
  });

  wx.request({
    url: 'http://127.0.0.1:8080/testapp/api/manage-employee', 
    method: 'GET',
    responseType: 'arraybuffer', // 确保返回的是二进制数据
    success: function(res) {
      wx.hideLoading();
      
      if (res.statusCode === 200) {
        const filePath = `${wx.env.USER_DATA_PATH}/users.xlsx`;
        wx.getFileSystemManager().writeFile({
          filePath,
          data: res.data,
          encoding: 'binary',
          success: () => {
            wx.showToast({
              title: '导出成功，稍后打开...',
              icon: 'success',
              duration: 2000 // 显示2秒
            });

            setTimeout(() => {
              wx.openDocument({
                filePath,
                fileType: 'xlsx',
                success: () => {
                  console.log('打开文档成功');
                },
                fail: (err) => {
                  console.error('打开文档失败', err);
                }
              });
            }, 2000); // 延时2秒后打开文档
          },
          fail: (err) => {
            console.error('写入文件失败', err);
          }
        });
      } else {
        wx.showToast({
          title: '导出失败',
          icon: 'none',
        });
      }
    },
    fail: function(err) {
      wx.hideLoading();
      wx.showToast({
        title: '请求失败',
        icon: 'none',
      });
      console.error('请求失败', err);
    }
  });
},



// 导入用户数据
importUserData: function () {
const app = getApp();
const u_uid=app.globalData.u_uid;
// 判断是否为管理员
if (u_uid !== 1) {
  wx.showToast({
    title: '只有管理员可以导入',
    icon: 'none',
  });
  return;
}
wx.chooseMessageFile({
  //mediaType: ['file'],
  count: 1,
  type: 'file',
  extension: ['xlsx', 'xls'],
  success: function(res) {
    const tempFilePaths = res.tempFiles[0].path;
    const tempFileName = res.tempFiles[0].name;
    // 检查文件扩展名
    
    if (tempFileName.endsWith('.xlsx')) {
      console.log('文件路径:', tempFilePaths);
    } else {
      wx.showToast({
        title: '请选择一个 .xlsx 文件',
        icon: 'none',
        duration: 2000
      });
      return
    }

    wx.showLoading({
      title: '上传中...',
    });
    wx.uploadFile({
      url: 'http://127.0.0.1:8080/testapp/api/importusers/',  
      filePath: tempFilePaths,
     // method:'POST',
      name: 'file',
      formData: {
        'user': 'test'
      },
      success: function(res) {
        wx.hideLoading();
        if (res.statusCode === 200) {
          console.log(res.data);
          wx.showToast({
            title: '导入成功',
            icon: 'success'
          });
        } else {
          console.log(res.data);
          wx.showToast({
            title: '导入失败',
            icon: 'none'
          });
        }
      },
      fail: function(err) {
        console.log(res.data);
        wx.hideLoading();
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
    });
  }
});
},
//导出信息
exportAttData: function() {
  const app = getApp();
  const u_uid=app.globalData.u_uid;
// 判断是否为管理员
  if (u_uid !== 1) {
    wx.showToast({
      title: '只有管理员可以导出',
      icon: 'none',
    });
    return;
  }
  wx.showLoading({
    title: '导出中...',
  });

  wx.request({
    url: 'http://127.0.0.1:8080/testapp/api/exportAtt', 
    method: 'GET',
    responseType: 'arraybuffer', // 确保返回的是二进制数据
    success: function(res) {
      wx.hideLoading();
      
      if (res.statusCode === 200) {
        const filePath = `${wx.env.USER_DATA_PATH}/Attendances.xlsx`;
        wx.getFileSystemManager().writeFile({
          filePath,
          data: res.data,
          encoding: 'binary',
          success: () => {
            wx.showToast({
              title: '导出成功，稍后打开...',
              icon: 'success',
              duration: 2000 // 显示2秒
            });

            setTimeout(() => {
              wx.openDocument({
                filePath,
                fileType: 'xlsx',
                success: () => {
                  console.log('打开文档成功');
                },
                fail: (err) => {
                  console.error('打开文档失败', err);
                }
              });
            }, 2000); // 延时2秒后打开文档
          },
          fail: (err) => {
            console.error('写入文件失败', err);
          }
        });
      } else {
        wx.showToast({
          title: '导出失败',
          icon: 'none',
        });
      }
    },
    fail: function(err) {
      wx.hideLoading();
      wx.showToast({
        title: '请求失败',
        icon: 'none',
      });
      console.error('请求失败', err);
    }
  });
},

// 导入任务
importMissionData: function () {
  const app = getApp();
  const u_uid=app.globalData.u_uid;
// 判断是否为管理员
  if (u_uid !== 1) {
    wx.showToast({
      title: '只有管理员可以导入',
      icon: 'none',
    });
    return;
  }
  wx.chooseMessageFile({
    //mediaType: ['file'],
    count: 1,
    type: 'file',
    extension: ['xlsx'],
    success: function(res) {
      const tempFilePaths = res.tempFiles[0].path;
      const tempFileName = res.tempFiles[0].name;
      // 检查文件扩展名
      
      if (tempFileName.endsWith('.xlsx')) {
        console.log('文件路径:', tempFilePaths);
      } else {
        wx.showToast({
          title: '请选择一个 .xlsx 文件',
          icon: 'none',
          duration: 2000
        });
        return
      }

      wx.showLoading({
        title: '上传中...',
      });
      wx.uploadFile({
        url: 'http://127.0.0.1:8080/testapp/api/importmission/',  
        filePath: tempFilePaths,
        name: 'file',
        formData: {
          'user': 'test'
        },
        success: function(res) {
          wx.hideLoading();
          if (res.statusCode === 200) {
            console.log(res.data);
            wx.showToast({
              title: '导入成功',
              icon: 'success'
            });
          } else {
            console.log(res.data);
            wx.showToast({
              title: '导入失败',
              icon: 'none'
            });
          }
        },
        fail: function(err) {
          console.log(res.data);
          wx.hideLoading();
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      });
    }
  });
},





 // 点击统计报表按钮，显示月份选择器
 showMonthPicker() {
  this.setData({
    showMonthPicker: true,
  });
},

// 隐藏月份选择器
hideMonthPicker() {
  this.setData({
    showMonthPicker: false,
  });
},

// 月份选择器变化时触发
onMonthChange(event) {
  const selectedDate = event.detail.value;
  const selectedYear = selectedDate.substring(0, 4);
  const selectedMonth = selectedDate.substring(5, 7);
  this.setData({
    month: selectedDate,
    showMonthPicker: false, // 选择完毕后隐藏选择器
  });

  console.log('Selected month:', selectedDate);

  this.exportMonthData(selectedMonth,selectedYear);
},
//导出信息
exportMonthData: function(smonth,syear) {
  const app = getApp();
  const u_uid=app.globalData.u_uid;
// 判断是否为管理员
  if (u_uid !== 1) {
    wx.showToast({
      title: '只有管理员可以导出',
      icon: 'none',
    });
    return;
  }
  wx.showLoading({
    title: '导出中...',
  });

  wx.request({
    url: 'http://127.0.0.1:8080/testapp/api/exportmonthdata', 
    method: 'GET',
    data:{
      month:smonth,
      year:syear
    },
    responseType: 'arraybuffer', // 确保返回的是二进制数据
    success: function(res) {
      wx.hideLoading();
      
      if (res.statusCode === 200) {
        const filePath = `${wx.env.USER_DATA_PATH}/Monthdata.xlsx`;
        wx.getFileSystemManager().writeFile({
          filePath,
          data: res.data,
          encoding: 'binary',
          success: () => {
            wx.showToast({
              title: '导出成功，稍后打开...',
              icon: 'success',
              duration: 2000 // 显示2秒
            });

            setTimeout(() => {
              wx.openDocument({
                filePath,
                fileType: 'xlsx',
                success: () => {
                  console.log('打开文档成功');
                },
                fail: (err) => {
                  console.error('打开文档失败', err);
                }
              });
            }, 2000); // 延时2秒后打开文档
          },
          fail: (err) => {
            console.error('导出文件失败', err);
          }
        });
      } else {
        wx.showToast({
          title: '导出失败',
          icon: 'none',
        });
      }
    },
    fail: function(err) {
      wx.hideLoading();
      wx.showToast({
        title: '请求失败',
        icon: 'none',
      });
      console.error('请求失败', err);
    }
  });
},
});