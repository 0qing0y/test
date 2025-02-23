Page({
  data: {
    fruits: [],
    showAddModal: false,
    showEditModal: false,
    newFruitName: '',
    newFruitDesc: '',
    newFruitImg: '',
    newFruitDays: '',
    newFruitSeason: '',
    editFruitId: null,
    editFruitName: '',
    editFruitDesc: '',
    editFruitDays: '',
    editFruitSeason: '',
    editFruitImg: '',
    showMap: false, // 控制地图组件显示与隐藏的状态
    currentLongitude: 115.857444, // 当前地图中心的经度
    currentLatitude: 39.464692, // 当前地图中心的纬度
    markers: [], // 存放地图标记点的数组
    selectedMarker:null,
    farmBoundaries: [], // 农田边界数据数组
  },

  onLoad: function() {
    this.fetchFruits();
  },

  fetchFruits: function() {
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/croplist', // 替换为你的实际API地址
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            fruits: res.data
          });
        } else {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      }
    });
  },

  openAddModal: function() {
    this.setData({
      showAddModal: true
    });
  },

  closeAddModal: function() {
    this.setData({
      showAddModal: false,
      newFruitName: '',
      newFruitDesc: '',
      newFruitDays: '',
      newFruitSeason: '',
      newFruitImg: ''
    });
  },

  openEditModal: function(e) {
    const { id, name, desc, img, days, season } = e.currentTarget.dataset;
    this.setData({
      showEditModal: true,
      editFruitId: id,
      editFruitName: name,
      editFruitDesc: desc,
      editFruitDays: days,
      editFruitSeason: season,
      editFruitImg: img
    });
  },

  closeEditModal: function() {
    this.setData({
      showEditModal: false,
      editFruitId: null,
      editFruitName: '',
      editFruitDesc: '',
      editFruitDays: '',
      editFruitSeason: '',
      editFruitImg: ''
    });
  },

  onNameInput: function(e) {
    this.setData({
      newFruitName: e.detail.value
    });
  },

  onDescInput: function(e) {
    this.setData({
      newFruitDesc: e.detail.value
    });
  },

  onDaysInput: function(e) {
    this.setData({
      newFruitDays: e.detail.value
    });
  },

  onSeasonInput: function(e) {
    this.setData({
      newFruitSeason: e.detail.value
    });
  },
  onImgInput: function(e) {
    this.setData({
      newFruitImg: e.detail.value
    });
  },

  onEditNameInput: function(e) {
    this.setData({
      editFruitName: e.detail.value
    });
  },

  onEditDescInput: function(e) {
    this.setData({
      editFruitDesc: e.detail.value
    });
  },

  onEditDaysInput: function(e) {
    this.setData({
      editFruitDays: e.detail.value
    });
  },

  onEditSeasonInput: function(e) {
    this.setData({
      editFruitSeason: e.detail.value
    });
  },
  onEditImgInput: function(e) {
    this.setData({
      editFruitImg: e.detail.value
    });
  },

  addFruit: function() {
    const { newFruitName, newFruitDesc,newFruitDays, newFruitSeason} = this.data;
    if (newFruitName && newFruitDesc && newFruitDays && newFruitSeason) {
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/cropfill/',
        method: 'POST',
        data: {
          crop_name: newFruitName,
          crop_desc: newFruitDesc,
          crop_time: newFruitDays,
          crop_month: newFruitSeason,
          //img: newFruitImg
        },
        success: (res) => {
          if (res.statusCode === 201) {
            this.fetchFruits();
            this.closeAddModal();
            wx.showToast({
              title: '添加成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '添加失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '请求失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '请输入完整信息',
        icon: 'none'
      });
    }
  },

  updateFruit: function() {
    const { editFruitId, editFruitName, editFruitDesc,editFruitDays, editFruitSeason} = this.data;
    if (editFruitName && editFruitDesc && editFruitDays && editFruitSeason ) {
      wx.request({
        url: `http://127.0.0.1:8080/testapp/api/cropupdate/`,
        method: 'PUT',
        data: {
          crop_id: editFruitId,
          crop_name: editFruitName,
          crop_desc: editFruitDesc,
          crop_time: editFruitDays,
          crop_month: editFruitSeason,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.fetchFruits();
            this.closeEditModal();
            wx.showToast({
              title: '更新成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '更新失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '请求失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '请输入完整信息',
        icon: 'none'
      });
    }
  },

  deleteFruit: function(e) {
    const { id } = e.currentTarget.dataset;
    wx.request({
      url: `http://127.0.0.1:8080/testapp/api/cropdelete/`,
      method: 'DELETE',
      data: {
        crop_id: id,
      },
      success: (res) => {
        if (res.statusCode === 204) {
          this.fetchFruits();
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      }
    });
  },
  viewFields: function (e) {
    const { id } = e.currentTarget.dataset;
  
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/getCropFields/?crop_id=' + id,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const fields = res.data;
  
          const markers = fields.map(field => {
            const marker = {
              id: Number(field.f_id),
              name: field.f_name,
              longitude: field.f_longitude,
              latitude: field.f_latitude,
              square: field.f_square,
              desc: field.f_desc,
              type: field.f_type,
              iconPath: '/assets/marker.png',
              width: 48,
              height: 75,
            };
  
            if (field.boundary_points && field.boundary_points.length > 0) {
              const boundaryPoints = field.boundary_points.map(point => ({
                latitude: point.latitude,
                longitude: point.longitude,
                sequence: point.sequence,
              }));
              // 添加到farmBoundaries数组中
              marker.boundaryPoints = boundaryPoints;
            }
            return marker;
          });
  
          // 构造farmBoundaries数组
          const farmBoundaries = markers.map(marker => ({
            points: marker.boundaryPoints || [], // 如果没有边界点信息，则为空数组
            width:2,
            color:"#338833",
            dottedLine: true
          }));
          console.log(farmBoundaries);

  
          this.setData({
            markers: markers,
            farmBoundaries: farmBoundaries, // 设置farmBoundaries数组
            showMap: true,
          });
          console.log(farmBoundaries);
  
          wx.showToast({
            title: '成功获取信息',
            icon: 'success',
          });
        } else {
          wx.showToast({
            title: '未找到农田信息',
            icon: 'none',
          });
        }
      },
      fail: (err) => {
        console.error('获取信息失败', err);
        wx.showToast({
          title: '获取信息失败',
          icon: 'none',
        });
      },
    });
  },
  markerTapHandler: function(event) {
    const markerId = event.markerId;
    const markers = this.data.markers;
    const selectedMarker = markers.find(marker => marker.id === markerId);

    if (selectedMarker) {
      this.setData({
        selectedMarker: selectedMarker
      });
    }
  },
  // 关闭标记信息
  closeMarkerInfo: function() {
    this.setData({
      selectedMarker: null
    });
  },
  closeMapModal: function() {
    // 关闭弹窗
    this.setData({
      showMap: false
    });
  }
});