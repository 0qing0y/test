Page({
  data: {
    userInfo: {},
    companyLocation: {
      latitude: 39.464692, // 公司纬度
      longitude: 115.857444 // 公司经度
    },
    markers: [],
    canSignIn: true ,// 初始化签到按钮状态
    canSignOut: false, // 初始化签退按钮状态
    a_id: '' // 签到记录的ID
  },

  onLoad() {
    const app = getApp();
    const u_id = app.globalData.u_id;

    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/userinfo/?u_id=' + u_id,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('User info request success:', res.data);
        this.setData({
          userInfo: {
            u_id: u_id,
            u_name: res.data.u_name,
          }
        });
        this.checkSignInStatus(); // 在获取用户信息后检查签到状态
      },
      fail: function (err) {
        console.error('User info request failed:', err);
      }
    });

    // 初始化公司位置标记
    this.setData({
      markers: [{
        iconPath: "/assets/marker.png", // 这里可以放置公司图标的路径
        id: 0,
        latitude: this.data.companyLocation.latitude,
        longitude: this.data.companyLocation.longitude,
        width: 48,
        height: 75,
        label: {
          content: '农场',
          color: '#FF0000',
          fontSize: 14,
          bgColor: '#FFFFFF',
          padding: 5,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: '#FF0000'
        }
      }]
    });
  },

  checkSignInStatus() {
    const app = getApp();
    const u_id = app.globalData.u_id;
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/checksigninstatus/?u_id=' + u_id,
      method: 'GET',
      
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('Check sign in status success:', res.data);
        this.setData({
          canSignIn: res.data.can_sign_in,
          canSignOut: res.data.can_sign_out,
          a_id: res.data.a_id || ''
        });
      },
      fail: (err) => {
        console.error('Check sign in status failed:', err);
      }
    });
  },

  dailySignIn() {
    if (!this.data.canSignIn) {
      wx.showToast({
        title: '今天已经签到',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.showModal({
      title: '确认签到',
      content: '确定要签到吗？',
      success: (res) => {
        if (res.confirm) {

    const self = this;

    // 检查并请求定位授权
    wx.getSetting({
      success(res) {
        console.log('Get setting success:', res);
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              console.log('Authorization success');
              self.getLocationAndSignIn();
            },
            fail() {
              console.error('Authorization failed');
              wx.showModal({
                title: '授权失败',
                content: '需要获取定位权限，请前往设置中开启定位权限。',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        } else {
          self.getLocationAndSignIn();
        }
      },
      fail() {
        console.error('Get setting failed');
        wx.showToast({
          title: '检查授权失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  } else if (res.cancel) {
    // 用户点击了取消按钮
    console.log('用户取消了签到操作');
  }
},
});
},

  getLocationAndSignIn() {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        console.log('Location success:', res);
        const userLatitude = res.latitude;
        const userLongitude = res.longitude;

        const distance = this.getDistance(userLatitude, userLongitude, this.data.companyLocation.latitude, this.data.companyLocation.longitude);
        console.log('Distance to company:', distance);

        if (distance <= 1000) {
          wx.showToast({
            title: `签到成功`,
            icon: 'success',
            duration: 2000
          });

          // 更新地图上的用户位置标记
          this.setData({
            markers: this.data.markers.concat([{
              iconPath: "/assets/house2.png", // 这里可以放置用户图标的路径
              id: 1,
              latitude: userLatitude,
              longitude: userLongitude,
              width: 50,
              height: 50,
              label: {
                content: '我的位置',
                color: '#0000FF',
                fontSize: 14,
                bgColor: '#FFFFFF',
                padding: 5,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#0000FF'
              }
            }])
          });
          const app = getApp();
          const u_id = app.globalData.u_id;
          // 发送签到信息到服务器
          wx.request({
            url: 'http://127.0.0.1:8080/testapp/api/attendanceupdate/', // 确保URL与Django配置一致
            method: 'POST',
            data: {
              account: u_id,
              latitude: userLatitude,
              longitude: userLongitude
            },
            success: res => {
              console.log('Attendance update success:', res);
              if (res.statusCode === 201) {
                wx.showToast({
                  title: '签到成功',
                  icon: 'success',
                  duration: 2000
                });

                // 更新签到状态
                this.setData({
                  canSignIn: false,
                  canSignOut: true,//签到成功后允许签退
                  a_id: res.data.a_id // 设置签到记录的ID
                });
              } else {
                wx.showToast({
                  title: '签到失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            },
            fail: err => {
              console.error('Attendance update failed:', err);
              wx.showToast({
                title: '签到请求失败',
                icon: 'none',
                duration: 2000
              });
            }
          });
        } else {
          wx.showToast({
            title: '不在签到范围内',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: err => {
        console.error('Location failed:', err);
        wx.showToast({
          title: '获取定位失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  dailySignOut() {
    if (!this.data.canSignOut) {
      wx.showToast({
        title: '请先签到',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.showModal({
      title: '确认签退',
      content: '确定要签退吗？',
      success: (res) => {
        if (res.confirm) {

    const self = this;

    wx.getLocation({
      type: 'gcj02',
      success: res => {
        console.log('Location success:', res);
        const userLatitude = res.latitude;
        const userLongitude = res.longitude;

        const distance = this.getDistance(userLatitude, userLongitude, this.data.companyLocation.latitude, this.data.companyLocation.longitude);
        console.log('Distance to company:', distance);

        if (distance <= 1000) {
          wx.showToast({
            title: `签退成功`,
            icon: 'success',
            duration: 2000
          });
          
          const app = getApp();
          const u_id = app.globalData.u_id;
          // 发送签退信息到服务器
          wx.request({
            url: 'http://127.0.0.1:8080/testapp/api/signout/', // 确保URL与Django配置一致
            method: 'POST',
            data: {
              account: u_id,
              a_id: this.data.a_id,
              latitude: userLatitude,
              longitude: userLongitude
            },
            success: res => {
              console.log('Sign out success:', res);
              if (res.statusCode === 200) {
                wx.showToast({
                  title: `签退成功`,
                  icon: 'success',
                  duration: 2000
                });

                // 更新签退状态
                this.setData({
                  canSignOut: false // 签退成功后禁用签退按钮
                });
              } else {
                wx.showToast({
                  title: '签退失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            },
            fail: err => {
              console.error('Sign out failed:', err);
              wx.showToast({
                title: '签退请求失败',
                icon: 'none',
                duration: 2000
              });
            }
          });
        } else {
          wx.showToast({
            title: '不在签退范围内',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: err => {
        console.error('Location failed:', err);
        wx.showToast({
          title: '获取定位失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  } else if (res.cancel) {
    // 用户点击了取消按钮
    console.log('用户取消了签退操作');
  }
},
});
  },

  // 计算两个经纬度之间的距离，返回单位为米
  getDistance(lat1, lon1, lat2, lon2) {
    const toRad = (d) => d * Math.PI / 180;
    const R = 6378137; // 地球半径，单位为米

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  },

  

  attendanceRecords() {
    wx.navigateTo({
      url: '/pages/attendanceRecords/attendanceRecords'
    });
  },

  myLeave() {
    wx.navigateTo({
      url: '/pages/leave/leave'
    });
  },
  LeaveRecord() {
    wx.navigateTo({
      url: '/pages/leaverecords/leaverecords'
    });
  }
});
