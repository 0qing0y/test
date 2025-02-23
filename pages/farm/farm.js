// pages/farm/farm.js
const wxCharts = require('../../utils/wxcharts.js');
Page({
  data: {
    farms: [],
    isonaddland: false, // 控制弹出层显示与隐藏的变量
    onid:'',
    onName: '',         // 输入的土地名字
    onQuantity: '',     // 输入的面积（作为字符串处理）
    onAdd: '',          // 输入的位置
    onLong: '',          // 输入的经度
    long:'', //中心经度的备份
    lat:'', //中心纬度的备份
    onLat:'',            //输入的纬度
    onType:'',            //输入的土壤类型
    desc: '' ,           // 输入的描述信息
    latitude: 39.464692, // 初始化纬度
    longitude: 115.857444, // 初始化经度
    markers: [],
    boundaryPoints: [], // 保存边界点的数组
    boundaryPointsSend: [], //要传给后端的
    boundaryPointsShow:[],
    sequenceCounter: 1, // 边界点序号计数器



    startDate: '',
    endDate: '',
    chartData: [], // 用于存放柱状图数据
    showDateSelector: false, // 控制日期选择器的显示与隐藏
    showChartModal:false,
    InOutDate:false,
  },


  onLoad: function () {
    // 页面加载时获取土地数据
    this.getFarmList();
  },
  getFarmList: function () {
    // 发起网络请求，获取后端接口返回的土地数据
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/enclosure-list', // 替换为实际的后端接口地址
      method: 'GET',
      success: (res) => {
        console.log(res.data); // 打印后端返回的圈舍数据，确认数据格式与字段名
        this.setData({
          farms: res.data // 更新页面的圈舍数据
        });
      },
      fail: (err) => {
        console.error('请求失败', err);
      }
    });
  },
  viewDetails: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url:`/pages/farmdetail/farmdetail?id=${id}`
      //url:'/pages/login/login'
    });
  },

  
  seStockInModal: function() {
    this.setData({
      isonaddland: false
    });
  },
  onaddland: function() {
    this.setData({
      isonaddland: true
    });
  },
  // 输入名字变化时触发
  onNameChange: function(e) {
    this.setData({
      onName: e.detail.value
    });
  },

  // 输入变化时触发
  onQuantityChange: function(e) {
    this.setData({
      onQuantity: e.detail.value
    });
  },
/*
  // 输入变化时触发
  onAddChange: function(e) {
    this.setData({
      onAdd: e.detail.value
    });
  },
  onidChange: function(e) {
    this.setData({
      onid: e.detail.value
    });
  },*/
  onMarkerTap: function(e) {
    console.log('Marker Tap:', e.detail);
    // 处理标记点被点击的事件，获取点击的位置信息
    // 更新经度和纬度数据
    this.setData({
      onLong: e.detail.longitude,
      onLat: e.detail.latitude,
    });
    this.setData({
      markers: [{
        id: 1,
        latitude: this.data.onLat,
        longitude: this.data.onLong,
        iconPath: '/assets/redflag.png', // 自定义标记图标的路径
        width: 48,
        height: 75
      }]
    });
    console.log(this.data.markers[0]);
  },
  onRegionChange: function(e) {
    console.log('Region Change:', e.detail);
    // 处理地图视野变化的事件，可以根据需要进行相应操作
  },
  onLongChange: function(e) {
    this.setData({
      onLong: e.detail.value,
      markers: [{
        id: 1,
        latitude: this.data.onLat,
        longitude: e.detail.value,
        iconPath: '/assets/redflag.png', // 自定义标记图标的路径
        width: 48,
        height: 75
      }]
    });
  },
  onLatChange: function(e) {
    this.setData({
      onLat: e.detail.value,
      markers: [{
        id: 1,
        latitude: e.detail.value,
        longitude: this.data.onLong,
        iconPath: '/assets/redflag.png', // 自定义标记图标的路径
        width: 48,
        height: 75
      }]
    });
  },


  addBoundaryPoint() {
    const { onLat, onLong } = this.data;
    const latitude = parseFloat(onLat);
    const longitude = parseFloat(onLong);
    const sequence = this.data.sequenceCounter++;

    if (!isNaN(latitude) && !isNaN(longitude)) {
        const newPoint = { latitude, longitude, sequence };
        //const markers = [...this.data.markers, { latitude, longitude }];
        const boundaryPoints = [...this.data.boundaryPoints, newPoint];

        this.setData({
            //markers,
            boundaryPoints,
            //onLat: '',
            //onLong: ''
        });
        wx.showToast({
          title: '成功添加边界点',
          icon: 'none',
          duration:600,
        });

    } else {
        console.error('Invalid latitude or longitude');
    }
},

// 点击完成按钮
completeBoundaryInput() {
  let { boundaryPoints } = this.data;

  // 复制第一个点并添加到数组末尾，并设置新的 sequence 值
  if (boundaryPoints.length > 0) {
      const firstPoint = boundaryPoints[0];
      const lastSequence = boundaryPoints[boundaryPoints.length - 1].sequence;
      const newPoint = {
          latitude: firstPoint.latitude,
          longitude: firstPoint.longitude,
          sequence: lastSequence + 1
      };
      boundaryPoints.push(newPoint);
  }
    console.log('Boundary points:', boundaryPoints);

    // 计算面积和中心点逻辑
    const { centerLongitude, centerLatitude } = this.calculateCenter(boundaryPoints);
    const area = this.calculateArea(boundaryPoints);
    console.log('center:', centerLatitude,centerLongitude);
    console.log('area:', area);
    //边界显示设置
    let additionalInfo = {
      width: 3,
      color: "#338833",
      dottedLine: true
    };
    
    // 将新对象添加到数组末尾
    const boundaryPointsShow = [];
    const boundaryPointsShow1 =  {
      points: boundaryPoints, // 如果没有边界点信息，则为空数组
      width:2,
      color:"#338833",
      dottedLine: true
    };
    boundaryPointsShow.push(boundaryPointsShow1);
    // 更新数据显示
    this.setData({
        onLat:centerLatitude,
        onLong:centerLongitude,
        long:centerLongitude,
        lat:centerLatitude,
        sequenceCounter: 1,
        boundaryPointsSend:boundaryPoints,
        boundaryPoints: [],
        boundaryPointsShow:boundaryPointsShow,
        //markers: boundaryPoints.map(point => ({ latitude: point.latitude, longitude: point.longitude })),
        onQuantity: area.toFixed(2), // 设置面积显示，假设 onQuantity 绑定的是显示面积的 input
        markers: [{
          id: 1,
          latitude: centerLatitude,
          longitude: centerLongitude,
          iconPath: '/assets/marker.png', // 自定义标记图标的路径
          width: 48,
          height: 75
        }]
    });
    console.log(this.data.boundaryPointsShow);
},

// 计算多边形的中心点
calculateCenter(boundaryPoints) {
    let sumLongitude = 0;
    let sumLatitude = 0;

    boundaryPoints.forEach(point => {
        sumLongitude += point.longitude;
        sumLatitude += point.latitude;
    });

    const centerLongitude = sumLongitude / boundaryPoints.length;
    const centerLatitude = sumLatitude / boundaryPoints.length;
    console.log('center',centerLongitude,centerLatitude);
    return { centerLongitude, centerLatitude };
},

// 计算多边形的面积（假设使用 Shoelace 公式）
calculateArea(boundaryPoints) {
  let area = 0;
  const numPoints = boundaryPoints.length;
  let j = numPoints - 1;

  for (let i = 0; i < numPoints; i++) {
      let lon1 = boundaryPoints[j].longitude;
      let lat1 = boundaryPoints[j].latitude;
      let lon2 = boundaryPoints[i].longitude;
      let lat2 = boundaryPoints[i].latitude;

      // Convert degrees to radians
      lon1 = lon1 * Math.PI / 180;
      lon2 = lon2 * Math.PI / 180;
      lat1 = lat1 * Math.PI / 180;
      lat2 = lat2 * Math.PI / 180;

      // Calculate area using spherical triangle formula
      area += (lon2 - lon1) * (Math.sin(lat1) + Math.sin(lat2));

      j = i;
  }

  // Radius of the Earth (approximately mean radius in meters)
  const earthRadius = 6371000; // meters

  // Calculate absolute area in square meters
  area = Math.abs(area * earthRadius * earthRadius / 2);

  return area;
},
  // 输入描述变化时触发
  ondescChange: function(e) {
    this.setData({
      desc: e.detail.value
    });
  },
  // 确认按钮点击事件
  onon: function() {
    if((Number(this.data.onLong)<180&&Number(this.data.onLong)>-180)&&(Number(this.data.onLat)<90&&Number(this.data.onLat)>-90))
    {
    // 在这里可以进行数据验证和提交处理
    console.log('确认按钮点击，提交数据：', this.data.onName, this.data.onQuantity,  this.data.long,this.data.lat,this.data.desc);
    const { onName, onQuantity ,long,lat, desc,boundaryPointsSend } = this.data
    const app = getApp();
    const u_id=app.globalData.u_id;
    wx.request({
      url: `http://127.0.0.1:8080/testapp/api/addfarm/?u_id=${u_id}`, // 替换为实际的后端接口地址
      method: 'PUT',

      data: {

        e_name: onName,         // 输入的名字
        e_square: onQuantity,     // 输入的面积（作为字符串处理）
        e_longitude: long,
        e_latitude: lat,
        e_desc: desc ,
        boundary_points:boundaryPointsSend,
      },
   
      success: (res) => {
        if(res.statusCode === 200 ){
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });

        this.refreshFarmList(); // 添加成功后刷新列表
        this.seStockInModal();}
        else if(res.statusCode === 400){
          wx.showToast({
            title: '请检查输入数据',
            icon: 'none'
          });
        }else if(res.statusCode===401){
          wx.showToast({
            title: '没有权限',
            icon: 'none'
          });
        }
        else{
          wx.showToast({
            title: '添加失败',
            icon: 'False'
          });
        }
      },
      fail: (err) => {
        console.error('添加请求失败', err);

        wx.showToast({
          title: '添加失败',
          icon: 'none'
        });
        console.log(data);
    


    // 提交完成后关闭弹出层
    this.seStockInModal();
  }
})}
else if(Number(this.data.onLong)>180||Number(this.data.onLong)<-180){
  wx.showToast({
    title: '经度范围为(-180,180)',
    icon: 'none'
  });
}
else{
  wx.showToast({
    title: '维度范围为(-90,90)',
    icon: 'none'
  });
}
  },
  refreshFarmList: function () {
    this.getFarmList(); // 重新获取数据
  },
    



  




  // 点击另一个按钮，显示日期选择器
  openDateSelector: function () {
    this.setData({
      showDateSelector: true,
    });
  },
  onCancel: function () {
    // 隐藏日期选择器
    this.setData({
      showDateSelector: false,
    });
  },


  onStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    });
  },
  
  onEndDateChange: function(e) {
    this.setData({
      endDate: e.detail.value
    });
  },
  
  onConfirm: function() {
    if (this.data.startDate && this.data.endDate) {
      this.setData({
        showChartModal: true,
        showDateSelector:false
      });
      this.fetchDataAndRenderChart();
    } else {
      wx.showToast({
        title: '请选择开始和结束日期',
        icon: 'none'
      });
    }
  },
  
  fetchDataAndRenderChart: function() {
  
    const startDate = this.data.startDate;
    const endDate = this.data.endDate;
  
  
    wx.showLoading({
      title: '加载中...',
    });
  
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/getBreedingData/', 
      method: 'GET',
      data: {
        startDate: startDate,
        endDate: endDate,
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const data = res.data;
          console.log('1',data)
          wx.showToast({
            title: 'OK',
            icon: 'none',
          });
          // 处理后端返回的数据，构造柱状图所需的数据格式
          const chartData = data.map(item => ({
          name: item.an_id,
            value: item.b_num,
          }));
          console.log('2',chartData)
  
  
          // 更新页面数据，渲染图表
          this.setData({
            chartData: chartData,
          });
  
          // 调用渲染柱状图的函数
          this.renderBarChart();
  
  
  
        } else {
          wx.showToast({
            title: '加载数据失败',
            icon: 'none',
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '请求失败',
          icon: 'none',
        });
        console.error('请求失败', err);
      }
    });
  },
  
  
  renderBarChart: function () {
    const chartData = this.data.chartData;
    console.log('3',chartData)
  
    const windowWidth = wx.getSystemInfoSync().windowWidth; // 获取屏幕宽度
    const barCanvas = this.selectComponent('#barCanvas'); // 选择canvas组件
  
    console.log(chartData.map(item => item.name))
    console.log(chartData.map(item => item.value))
  
    new wxCharts({
      canvasId: 'barCanvas',
      type: 'column',
      categories: chartData.map(item => item.name),
      series: [{
        name: '养殖数量',
        data: chartData.map(item => item.value),
  
      }],
      yAxis: {
        format: function (val) {
          return val + '只';
        },
        title: '养殖数量',
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'category'
      },
      extra: {
        column: {
          width: 15
        }
      },
      width: 320, // 设置图表宽度为屏幕宽度
      height: 300 // 设置图表高度
    },this);
  },
  
  //导出信息
  exportFarmData: function() {
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
      url: 'http://127.0.0.1:8080/testapp/api/exportFarm', // 替换为你的后端URL
      method: 'GET',
      responseType: 'arraybuffer', // 确保返回的是二进制数据
      success: function(res) {
        wx.hideLoading();
        
        if (res.statusCode === 200) {
          const filePath = `${wx.env.USER_DATA_PATH}/Farms.xlsx`;
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



// 导入土地数据
importFarmData: function () {
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
        url: 'http://127.0.0.1:8080/testapp/api/importFarm/',  // 替换为你的Django后端URL
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

OpenInOutDate:function(){
  this.setData({
      InOutDate: true,
    });
},
closeInOutData:function(){
  this.setData({
      InOutDate: false,
    });
},
closeParameterChart:function() { 
  this.setData({
      showChartModal: false,
    });  
},

});
