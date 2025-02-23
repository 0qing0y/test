Page({
  data: {
    animals: [],
    showAddModal: false,
    showEditModal: false,
    newAnimalName: '',
    newAnimalDesc: '',
    newAnimalImg: '',
    editAnimalId: null,
    editAnimalName: '',
    editAnimalDesc: '',
    editAnimalImg: '',
    showMap: false, // 控制地图组件显示与隐藏的状态
    currentLongitude: 115.857444, // 当前地图中心的经度
    currentLatitude: 39.464692, // 当前地图中心的纬度
    markers: [], // 存放地图标记点的数组
    selectedMarker:null,
    farmBoundaries: [], // 农田边界数据数组
  },

  onLoad: function() {
    this.fetchAnimals();
  },

  fetchAnimals: function() {
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/animallist', // 替换为你的实际API地址
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            animals: res.data
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
      newAnimalName: '',
      newAnimalDesc: '',
      newAnimalImg: ''
    });
  },

  openEditModal: function(e) {
    const { id, name, desc, img } = e.currentTarget.dataset;
    this.setData({
      showEditModal: true,
      editAnimalId: id,
      editAnimalName: name,
      editAnimalDesc: desc,
      editAnimalImg: img
    });
  },

  closeEditModal: function() {
    this.setData({
      showEditModal: false,
      editAnimalId: null,
      editAnimalName: '',
      editAnimalDesc: '',
      editAnimalImg: ''
    });
  },

  onNameInput: function(e) {
    this.setData({
      newAnimalName: e.detail.value
    });
  },

  onDescInput: function(e) {
    this.setData({
      newAnimalDesc: e.detail.value
    });
  },

  onImgInput: function(e) {
    this.setData({
      newAnimalImg: e.detail.value
    });
  },

  onEditNameInput: function(e) {
    this.setData({
      editAnimalName: e.detail.value
    });
  },

  onEditDescInput: function(e) {
    this.setData({
      editAnimalDesc: e.detail.value
    });
  },

  onEditImgInput: function(e) {
    this.setData({
      editAnimalImg: e.detail.value
    });
  },

  addAnimal: function() {
    const { newAnimalName, newAnimalDesc} = this.data;
    if (newAnimalName && newAnimalDesc) {
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/animalfill/',
        method: 'POST',
        data: {
          an_name: newAnimalName,
          an_desc: newAnimalDesc,
          //img: newAnimalImg
        },
        success: (res) => {
          if (res.statusCode === 201) {
            this.fetchAnimals();
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

  updateAnimal: function() {
    const { editAnimalId, editAnimalName, editAnimalDesc} = this.data;
    if (editAnimalName && editAnimalDesc ) {
      wx.request({
        url: `http://127.0.0.1:8080/testapp/api/animalupdate/`,
        method: 'PUT',
        data: {
          an_id: editAnimalId,
          an_name: editAnimalName,
          an_desc: editAnimalDesc,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.fetchAnimals();
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

  deleteAnimal: function(e) {
    const { id } = e.currentTarget.dataset;
    wx.request({
      url: `http://127.0.0.1:8080/testapp/api/animaldelete/`,
      method: 'DELETE',
      data: {
        an_id: id,
      },
      success: (res) => {
        if (res.statusCode === 204) {
          this.fetchAnimals();
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
      url: 'http://127.0.0.1:8080/testapp/api/getAnimalEnclosures/?an_id=' + id,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const fields = res.data;
  
          const markers = fields.map(field => {
            const marker = {
              id: Number(field.e_id),
              name: field.e_name,
              longitude: field.e_longitude,
              latitude: field.e_latitude,
              square: field.e_square,
              desc: field.e_desc,
              //type: field.f_type,
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
            title: '未找到圈舍信息',
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