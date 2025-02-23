const wxCharts = require('../../utils/wxcharts-min.js'); 
Page({
  data: {
    f_id: null,
    img: '',
    //details: [],
    u_uid:null,

    plantInfo: null,
    fieldInfo:null,

    isIdle: true, // 假设初始状态为闲置
    showRecords: false,
    showPlantModal: false,
    showHarvestModal: false,
    cropTypes: [], // 作物种类
    selectedCropType: '',
    selectedCropTypeIndex: 0,
    selectedCropTypeId:0,
    selecteduQantity: 0,
    harvestQuantity: 0,
    //plantingRecords: [],
    plantings: [],
    cropID:[],
      sortedPlantings: [], // 排序后的种植记录
      sortByHarvestWeight: false, // 是否按收获重量排序的标志
      sortByTime: false, // 按种植时间排序状态
      sortByCrop: false, // 按作物排序状态
      sortByAmount: false, // 按种植数量排序状态
      sortByHarvestTime: false, // 按收获时间排序状态
      showEnvironmentModal:false,
      WaterQuantity:'',
      PHQuantity:'',
      NQuantity:'',
      PQuantity:'',
      KQuantity:'',
      chart: null, // 图表实例
      chartData: [], // 图表数据
      showChartModal:false,

  },

  onLoad: function(options) {
      const id = options.id;
      this.data.f_id=id;
      this.setData({
        img: '/assets/land' + id + '.jpg'
      });
      console.log(this.data.img);
      const app = getApp();
      this.setData({
        u_uid: app.globalData.u_uid
      });
      console.log('uuid:'+this.data.u_uid);
      // 发送请求到后端接口获取 crop 数据
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/crop-names', // 后端接口地址
        method: 'GET',
        success: (res) => {
          // 请求成功，处理返回的数据
          if (res.statusCode === 200 && res.data.crop_names) {
            // 将 crop_names 设置到 data 中，用于页面展示
            this.setData({
              cropTypes: res.data.crop_names,
              cropID:res.data.crop_id,
              selectedCropTypeId:res.data.crop_id[0],
            });
            console.log('!!!!!!!!!',this.data.selectedCropTypeId);
            console.log(res.data.crop_names);
            
            wx.request({
              url: 'http://127.0.0.1:8080/testapp/api/nowfieldinfo/?f_id='+this.data.f_id,
              method: 'GET', // 请求方法，这里假设使用 GET 方法
              data: {
                f_id: this.data.f_id, // 发送到后端的数据，以 f_id 作为查询条件
                // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
              },
              header: {
                'content-type': 'application/json' // 根据后端要求设置请求头
              },
              success: (res) =>{
                // 请求成功的回调函数
                console.log(res.data); // 打印后端返回的数据，查看是否符合预期
                this.setData({
                  fieldInfo: {
                    f_id: res.data.f_id,
                    f_name: res.data.f_name,
                    f_add: res.data.f_add,
                    f_longitude: res.data.f_longitude,
                    f_latitude: res.data.f_latitude,
                    f_type: res.data.f_type,
                    f_square: res.data.f_square,
                    f_desc: res.data.f_desc,
                    f_isfree: res.data.f_isfree,
                  }
                });
                // 在这里处理后端返回的数据，更新页面或其他操作
                wx.request({
                  url: 'http://127.0.0.1:8080/testapp/api/plantingrecord/?f_id='+this.data.f_id,
                  method: 'GET', // 请求方法，这里假设使用 GET 方法
                  data: {
                    f_id: this.data.f_id, // 发送到后端的数据，以 f_id 作为查询条件
                    // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
                  },
                  header: {
                    'content-type': 'application/json' // 根据后端要求设置请求头
                  },
                  success: (res) => {
                    const plantingsWithCropName = res.data.map(item => {
                      return {
                        ...item,
                        crop_name: this.GetName(item.crop_id)
                      };
                    });
                    this.setData({
                      plantings: plantingsWithCropName  // 将获取的数据存入页面状态中
                    });
                    //console.log(this.data.plantings);
                  },
                  fail: function(err) {
                    // 请求失败的回调函数
                    console.error('请求失败', err); // 打印错误信息
                  }
                });
              },
              fail: function(err) {
                // 请求失败的回调函数
                console.error('请求失败', err); // 打印错误信息
              }
            });

            wx.request({
              url: 'http://127.0.0.1:8080/testapp/api/fieldisfree/?f_id='+this.data.f_id,
              method: 'GET',
              data: {
                f_id: this.data.f_id
              },
              success: (res) => {
                //this.data.isIdle= !res.data.f_isfree;
                //this.data.selectedCropTypeId=res.data.f_isfree;
                //this.data.selectedCropTypeIndex=res.data.f_isfree-1;
                //this.data.selectedCropType=this.data.cropTypes[this.data.selectedCropTypeIndex];
                this.setData({
                  isIdle:!res.data.f_isfree,
                  //selectedCropTypeId:res.data.f_isfree,
                  selectedCropTypeIndex:res.data.f_isfree-1,
                  selectedCropType:this.data.cropTypes[this.data.selectedCropTypeIndex],
                });
                //console.log(res.data);
                //console.log(this.data.selectedCropTypeId);
                //console.log(this.data.selectedCropTypeIndex);
                //console.log(this.data.cropTypes);
                //console.log(this.data.cropTypes[0]);
                //console.log(this.data.cropTypes[this.data.selectedCropTypeIndex]);
                //console.log(this.data.selectedCropType);
                if(!this.data.isIdle){
                  wx.request({
                    url: 'http://127.0.0.1:8080/testapp/api/nowplantingrecord/?f_id='+this.data.f_id,
                    method: 'GET', // 请求方法，这里假设使用 GET 方法
                    data: {
                      f_id: this.data.f_id, // 发送到后端的数据，以 f_id 作为查询条件
                      // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
                    },
                    header: {
                      'content-type': 'application/json' // 根据后端要求设置请求头
                    },
                    success: (res) =>{
                      // 请求成功的回调函数
                      console.log(res.data); // 打印后端返回的数据，查看是否符合预期
                      let index = this.data.cropID.findIndex(crop => crop === res.data.crop);
                      let name=this.data.cropTypes[index];
                      this.setData({
                        plantInfo: {
                          crop: res.data.crop,
                          crop_name: name,
                          f: res.data.f,
                          is_stored: res.data.is_stored,
                          p_harvesttime: null,
                          p_harvestweight: null,
                          p_id: res.data.p_id,
                          p_plantamount: res.data.p_plantamount,
                          p_sowtime: res.data.p_sowtime
                        }
                      });
                      
                    },
                    fail: function(err) {
                      // 请求失败的回调函数
                      console.error('请求失败', err); // 打印错误信息
                    }
                  });
                }

              }
            });

          } else {
            console.error('Failed to fetch crop names: Unexpected response format');
          }
        },
        fail: (error) => {
          console.error('Failed to fetch crop names: ', error);
        }
      });
      
  },

  openPlantModal: function() {
    if(this.data.u_uid==1){
    if (this.data.isIdle) {
      this.setData({
        showPlantModal: true
      });
    } else {
      wx.showToast({
        title: '土地不空闲，无法种植',
        icon: 'none'
      });
    }
  }else{
    wx.showToast({
      title: '没有操作权限！',
      icon: 'none'
    });
  }
  },

  closePlantModal: function() {
    this.setData({
      showPlantModal: false,
      selectedCropType: null,
      selectedQuantity: 0
    });
  },

  onCropTypeChange: function(e) {//
    const index = e.detail.value;
      //console.log(this.data.selectedCropTypeId);
      this.setData({
        selectedCropType: this.data.cropTypes[index],
        selectedCropTypeIndex: index,
        //selectedCropTypeId: Number(index) + 1
        selectedCropTypeId:this.data.cropID[index]
      }, () => {
        // setData 回调函数，确保数据已经更新
        console.log('setData 更新完成');
        // 在这里可以执行其他操作或者触发其他函数
      });
      //this.data.selectedCropType=this.data.cropTypes[index];
      //this.data.selectedCropTypeIndex=index;  //croptypes数组索引，id=index+1
      //this.data.selectedCropTypeId=Number(index)+1;

      // 这里是 setData 的回调函数，确保数据已经更新
      //console.log(this.data.selectedCropType);
      //console.log(this.data.selectedCropTypeIndex);
      //console.log(this.data.selectedCropTypeId);
  },

  onQuantityChange: function(e) {//
    this.setData({
      selectedQuantity: e.detail.value
    });
  },

  plantNew: function() { //
    //const { selectedCropType, selectedQuantity } = this.data;

    if (this.data.selectedCropType && this.data.selectedQuantity > 0) {
      //console.log(String(this.data.selectedCropTypeId));
      //console.log(this.data.f_id);
      //console.log(this.data.selectedQuantity);      
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/planting/', // 后端接口地址
        method: 'POST',
        header: {
          'Content-Type': 'application/json' // 确保Content-Type为application/json
        },
        data: {
          crop_id: String(this.data.selectedCropTypeId),
          f_id: this.data.f_id,
          p_plantamount: this.data.selectedQuantity
        },
        success: (res) => {
          console.log(res)
          if (res.statusCode === 201) {
            wx.showToast({
              title: '种植记录添加成功',
              icon: 'success'
            });
            // 这里可以进行额外的操作，例如刷新数据等
            wx.request({
              url: 'http://127.0.0.1:8080/testapp/api/nowplantingrecord/?f_id='+this.data.f_id,
              method: 'GET', // 请求方法，这里假设使用 GET 方法
              data: {
                f_id: this.data.f_id, // 发送到后端的数据，以 f_id 作为查询条件
                // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
              },
              header: {
                'content-type': 'application/json' // 根据后端要求设置请求头
              },
              success: (res) =>{
                // 请求成功的回调函数
                console.log(res.data); // 打印后端返回的数据，查看是否符合预期
                let index = this.data.cropID.findIndex(crop => crop === res.data.crop);
                let name=this.data.cropTypes[index];
                this.setData({
                  plantInfo: {
                    crop: res.data.crop,
                    crop_name: name,
                    f: res.data.f,
                    is_stored: res.data.is_stored,
                    p_harvesttime: null,
                    p_harvestweight: null,
                    p_id: res.data.p_id,
                    p_plantamount: res.data.p_plantamount,
                    p_sowtime: res.data.p_sowtime
                  }
                });
              },
              fail: function(err) {
                // 请求失败的回调函数
                console.error('请求失败', err); // 打印错误信息
              }
            });
            //种植记录更新
            wx.request({
              url: 'http://127.0.0.1:8080/testapp/api/plantingrecord/?f_id='+this.data.f_id,
              method: 'GET', // 请求方法，这里假设使用 GET 方法
              data: {
                f_id: this.data.f_id, // 发送到后端的数据，以 f_id 作为查询条件
                // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
              },
              header: {
                'content-type': 'application/json' // 根据后端要求设置请求头
              },
              success: (res) => {
                const plantingsWithCropName = res.data.map(item => {
                  return {
                    ...item,
                    crop_name: this.GetName(item.crop_id)
                  };
                });
                this.setData({
                  plantings: plantingsWithCropName  // 将获取的数据存入页面状态中
                });
                //console.log(this.data.plantings);
              },
              fail: function(err) {
                // 请求失败的回调函数
                console.error('请求失败', err); // 打印错误信息
              }
            });
          } else {
            wx.showToast({
              title: '种植记录添加失败',
              icon: 'none'
            });
          }
        },
        fail: (error) => {
          console.error('请求失败: ', error);
          wx.showToast({
            title: '请求失败',
            icon: 'none'
          });
        }
      },
      );    

      // 允许种植新作物
      wx.showToast({
        title: '开始种植新作物',
        icon: 'success'
      });
      // 更新土地状态
      this.setData({
        isIdle: false,
        //details: this.data.details + `\n种植了${this.data.selectedQuantity}株${this.data.selectedCropType}。`,         //更新详情
        showPlantModal: false
      });
      // 更新种植记录
      //const records = this.data.plantingRecords;
      //records.push(`种植了${this.data.selectedQuantity}个${this.data.selectedCropType}`);
      //this.setData({
      //  plantingRecords: records
      //});
    } else {
      wx.showToast({
        title: '请先选择作物种类和数量',
        icon: 'none'
      });
    }

  },


  openHarvestModal: function() {//
    if(this.data.u_uid==1){
    this.setData({
      selectedCropType: this.data.selectedCropType
    });
    //if (!this.data.isIdle && this.data.selectedCropType) {
      if (!this.data.isIdle) {
      this.setData({
        showHarvestModal: true
      });
    } else {
      wx.showToast({
        title: '当前没有可收获的作物',
        icon: 'none'
      });
    }
  }
  else{
    wx.showToast({
      title: '没有操作权限！',
      icon: 'none'
    });
  }
  },

  closeHarvestModal: function() {  //
    this.setData({
      showHarvestModal: false,
      harvestQuantity: 0
    });
  },

  onHarvestQuantityChange: function(e) { //
    this.setData({
      harvestQuantity: e.detail.value
    });
  },

  harvestCrops: function() {
    const { isIdle, harvestQuantity } = this.data;    //这里的isIdle指的是当前种植作物的种类
    if (harvestQuantity > 0) {
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/harvest/',  // 替换为你的后端接口地址
        method: 'POST',
        data: {
          p_id: this.data.plantInfo.p_id,
          p_harvestweight: harvestQuantity,
          f: this.data.f_id,
        },
        header: {
          'content-type': 'application/json'  // 默认值
        },
        success:(res) =>{
          console.log(res.data);
          // 允许收获作物
          wx.showToast({
          title: '成功收获作物',
          icon: 'success'
      });
      this.setData({
        plantInfo: null  // 将获取的数据存入页面状态中
      });
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/plantingrecord/?f_id='+this.data.f_id,
        method: 'GET', // 请求方法，这里假设使用 GET 方法
        data: {
          f_id: this.data.f_id, // 发送到后端的数据，以 f_id 作为查询条件
          // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
        },
        header: {
          'content-type': 'application/json' // 根据后端要求设置请求头
        },
        success: (res) => {
          const plantingsWithCropName = res.data.map(item => {
            return {
              ...item,
              crop_name: this.GetName(item.crop_id)
            };
          });
          this.setData({
            plantings: plantingsWithCropName  // 将获取的数据存入页面状态中
          });
          //console.log(this.data.plantings);
        },
        fail: function(err) {
          // 请求失败的回调函数
          console.error('请求失败', err); // 打印错误信息
        }
      });
        },
        fail(err) {
          console.error('更新失败', err);
          wx.showToast({
            title: '更新失败',
            icon: 'none',
            duration: 2000
          });
        }
      });


      // 更新土地状态
      this.setData({
        isIdle: true,
        //details: this.data.details + `\n收获了${harvestQuantity}kg的${isIdle}。`, // 更新详情
        showHarvestModal: false,
        //isIdle: null,
        selectedQuantity: 0
      });


      // 更新种植记录
      //const records = this.data.plantingRecords;
      //records.push(`收获了${harvestQuantity}kg的${selectedCropType}`);
      //this.setData({
      //  plantingRecords: records
      //});
    } else {
      wx.showToast({
        title: '请输入收获的质量',
        icon: 'none'
      });
    }
  },

  viewRecords: function() {
    // 显示种植记录
    this.setData({
      showRecords: true
    });
  },

      //打开环境变量弹窗
      OpenEnvironmentModal: function() {//
        if(this.data.u_uid==1){
         
          this.setData({
            showEnvironmentModal: true
          });
        } 
      else{
        wx.showToast({
          title: '没有操作权限！',
          icon: 'none'
        });
      }
      },
    
    NewFieldInfo:function() { 
        if ((this.data.WaterQuantity && this.data.PHQuantity&& this.data.NQuantity&& this.data.PQuantity&& this.data.KQuantity) > 0) {
          wx.request({
            url: 'http://127.0.0.1:8080/testapp/api/environmenting/', // 后端接口地址
            method: 'POST',
            header: {
              'Content-Type': 'application/json' // 确保Content-Type为application/json
            },
            data: {
              s_ph:this.data.PHQuantity,
              s_N:this.data.NQuantity,
              s_P:this.data.PQuantity,
              s_K:this.data.KQuantity,
              s_water:this.data.WaterQuantity,
              f_id: this.data.f_id,
              s_time:null,
            },
            success: (res) => {
              console.log(res)
              
              if (res.statusCode === 201) {
                wx.showToast({
                  title: '土壤环境参数添加成功',
                  icon: 'success'
                });
                // 重新渲染折线图
                this.renderChart();    
              } else {
                wx.showToast({
                  title: '土壤环境参数添加失败',
                  icon: 'none'
                });
              }
            },
            fail: (error) => {
              console.error('请求失败: ', error);
              wx.showToast({
                title: '请求失败',
                icon: 'none'
              });
            }
          },
          );    
          
        } else {
          wx.showToast({
            title: '请输入数值',
            icon: 'none'
          });
        }
    
      },
    OpenParameterChart: function() {
        // 初始化图表
        this.setData({
            showChartModal: true,
          });
        this.renderChart();
        
      },
    closeParameterChart:function() {
  
       
        this.setData({
            showChartModal: false,
          });
        
      },
      renderChart: function() {
        wx.request({
          url: 'http://127.0.0.1:8080/testapp/api/soilinfo/?f_id=' + this.data.f_id,
          method: 'GET',
          data: {
            f_id: this.data.f_id,
          },
          header: {
            'content-type': 'application/json'
          },
          success: (res) => {
            console.log(res.data); // 打印后端返回的数据，查看是否符合预期
            this.setData({
              chartData: res.data
            });
      
            // 对 chartData 按时间从小到大排序
            const sortedChartData = this.data.chartData.sort((a, b) => {
              return new Date(a.s_time).getTime() - new Date(b.s_time).getTime();
            });
      
            console.log(sortedChartData); // 打印排序后的数据，查看是否正确排序
      
            // 准备图表数据
            const categories = [];
            const waterData = [];
            const phData = [];
            const NData = [];
            const PData = [];
            const KData = [];
      
            sortedChartData.forEach(item => {
              if (item.s_time !== undefined) {
                categories.push(item.s_time);
              }
              if (item.s_water !== undefined) {
                waterData.push(item.s_water);
              }
              if (item.s_ph !== undefined) {
                phData.push(item.s_ph);
              }
              if (item.s_N !== undefined) {
                NData.push(item.s_N);
              }
              if (item.s_P !== undefined) {
                PData.push(item.s_P);
              }
              if (item.s_K !== undefined) {
                KData.push(item.s_K);
              }
            });
      
            // 使用 wx-charts 绘制折线图
            this.data.chart = new wxCharts({
              canvasId: 'parameterChart',
              type: 'line',
              categories: categories,
              series: [
                { name: '水含量', data: waterData, format: function(val) { return val; } },
                { name: 'PH值', data: phData, format: function(val) { return val; } },
                { name: 'N含量', data: NData, format: function(val) { return val; } },
                { name: 'P含量', data: PData, format: function(val) { return val; } },
                { name: 'K含量', data: KData, format: function(val) { return val; } },
              ],
              yAxis: {
                format: function(val) { return val; },
                title: '数值'
              },
              xAxis: {
                disableGrid: false,
                type: 'category'
              },
              legend: true,
              width: 320,
              height: 500
            });
          },
          fail: function(err) {
            console.error('请求失败', err);
          }
        });
      },
      
    
    //输入土壤水含量
    inputSoilWater:function(e) { //
        this.setData({
            WaterQuantity: e.detail.value
        });
    },

    //输入土壤PH值
    inputSoilPH:function(e) { //
        this.setData({
            PHQuantity: e.detail.value
        });
    },

    //输入土壤N含量
    inputSoilN:function(e) { //
        this.setData({
            NQuantity: e.detail.value
        });
      },
    
    //输入土壤P含量
    inputSoilP:function(e) { //
        this.setData({
            PQuantity: e.detail.value
        });
    },

    //输入土壤K含量
    inputSoilK:function(e) { //
        this.setData({
            KQuantity: e.detail.value
        });
    },

    //关闭环境变量弹窗
    closeEnvironmentModal: function() {  //
        this.setData({
            showEnvironmentModal: false,
            WaterQuantity:'',
            PHQuantity:'',
            NQuantity:'',
            PQuantity:'',
            KQuantity:'',
            });
      },

    closeModal: function() {
      // 关闭弹窗
      this.setData({
        showRecords: false,
        sortByHarvestWeight: false,
        sortByTime: false, // 按种植时间排序状态
        sortByCrop: false, // 按作物排序状态
        sortByAmount: false, // 按种植数量排序状态
        sortByHarvestTime: false, // 按收获时间排序状态
      });
    },



    //导出信息
    exportLandselfData: function() {
      const app = getApp();
      const u_uid=app.globalData.u_uid;
      const f_id = this.data.f_id;
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
        url: 'http://127.0.0.1:8080/testapp/api/exportlandself/', // 替换为你的后端URL
        method: 'GET',
        responseType: 'arraybuffer', // 确保返回的是二进制数据
        data:{
          id:f_id
        },
        success: function(res) {
          wx.hideLoading();
          if (res.statusCode === 200) {
            const filePath = `${wx.env.USER_DATA_PATH}/Land${f_id}.xlsx`;
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
  
  
  
    //导出信息
    exportLanddetailData: function() {
      const app = getApp();
      const u_uid=app.globalData.u_uid;
      const f_id = this.data.f_id;
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
        url: 'http://127.0.0.1:8080/testapp/api/exportLanddetail/', // 替换为你的后端URL
        method: 'GET',
        responseType: 'arraybuffer', // 确保返回的是二进制数据
        data:{
          id:f_id
        },
        success: function(res) {
          wx.hideLoading();
          if (res.statusCode === 200) {
            const filePath = `${wx.env.USER_DATA_PATH}/Landdetail${f_id}.xlsx`;
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
    sortByHarvestWeight: function() {
      const { plantings } = this.data;
  
      // 根据收获重量排序
      let sortedPlantings = [...plantings];
      sortedPlantings.sort((a, b) => a.p_harvestweight - b.p_harvestweight);
  
      // 更新页面数据，显示排序后的种植记录和修改排序状态
      this.setData({
        sortedPlantings: sortedPlantings,
        sortByHarvestWeight: true
      });
    },
  sortByPlantingTime: function() {
      const { plantings } = this.data;
    
      // 根据种植时间排序
      let sortedPlantings = [...plantings];
      sortedPlantings.sort((a, b) => new Date(a.p_sowtime) - new Date(b.p_sowtime));
    
      // 更新页面数据，显示排序后的种植记录和修改排序状态
      this.setData({
        sortedPlantings: sortedPlantings,
        sortByTime: true
      });
    },
    
  sortByCropId: function() {
      const { plantings } = this.data;
    
      // 根据作物序号排序，如果序号相同则按种植时间排序
      let sortedPlantings = [...plantings];
      sortedPlantings.sort((a, b) => {
        if (a.crop_id === b.crop_id) {
          return new Date(a.p_sowtime) - new Date(b.p_sowtime);
        }
        return a.crop_id - b.crop_id;
      });
    
      // 更新页面数据，显示排序后的种植记录和修改排序状态
      this.setData({
        sortedPlantings: sortedPlantings,
        sortByCrop: true
      });
    },
    
  sortByPlantAmount: function() {
      const { plantings } = this.data;
    
      // 根据种植数量排序，如果数量相同则按种植时间排序
      let sortedPlantings = [...plantings];
      sortedPlantings.sort((a, b) => {
        if (a.p_plantamount === b.p_plantamount) {
          return new Date(a.p_sowtime) - new Date(b.p_sowtime);
        }
        return a.p_plantamount - b.p_plantamount;
      });
    
      // 更新页面数据，显示排序后的种植记录和修改排序状态
      this.setData({
        sortedPlantings: sortedPlantings,
        sortByAmount: true
      });
    },
    
  sortByHarvestTime: function() {
      const { plantings } = this.data;
    
      // 根据收获时间排序
      let sortedPlantings = [...plantings];
      sortedPlantings.sort((a, b) => new Date(a.p_harvesttime) - new Date(b.p_harvesttime));
    
      // 更新页面数据，显示排序后的种植记录和修改排序状态
      this.setData({
        sortedPlantings: sortedPlantings,
        sortByHarvestTime: true
      });
    },
    
  //   cancelSorting: function() {
  //     // 取消排序，恢复到默认状态
  //     this.setData({
  //       sortedPlantings: [],
  //       sortByHarvestWeight: false,
  //       sortByTime: false, // 按种植时间排序状态
  //       sortByCrop: false, // 按作物排序状态
  //       sortByField: false, // 按田块排序状态
  //       sortByAmount: false, // 按种植数量排序状态
  //       sortByHarvestTime: false, // 按收获时间排序状态
  //     });
  //   },
  

//   
// 下拉框选择
  handleSortChange: function (e) {
  const index = e.detail.value;
  switch (index) {
    case '0': // '按收获重量排序'
      this.sortByHarvestWeight();
      break;
    case '1': // '按种植时间排序'
      this.sortByPlantingTime();
      break;
    case '2': // '按作物序号排序'
      this.sortByCropId();
      break;
    case '3': // '按种植数量排序'
      this.sortByPlantAmount();
      break;
    case '4': // '按收获时间排序'
      this.sortByHarvestTime();
      break;
    default:
      break;
  }
  },
  GetName: function(id) {
    //console.log(id);
    let index = this.data.cropID.findIndex(crop => crop === id);
    //console.log(index);
    let name=this.data.cropTypes[index];
    //console.log(name);
    return name;
  }
  
});
