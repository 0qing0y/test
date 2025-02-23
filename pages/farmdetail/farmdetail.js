// pages/farmdetail/farmdetail.js
Page({
  data: {
    e_id: null,
    img: '',
    //details: null,
    u_uid:null,

    breedInfo: null,
    enclosureInfo:null,

    isIdle: true, // 假设初始状态为闲置
    showRecords: false,
    showAddModal: false,
    showHarvestModal: false,
    livestockTypes: [], // 默认牲畜种类
    selectedLivestockType: '',
    selectedLivestockTypeIndex:0,
    selectedLivestockTypeId:0,
    selectedQuantity: 0,
    harvestQuantity: 0,
    //livestockRecords: []
    breedings:[],
    sortedbreedings: [], // 排序后的养殖记录
    sortByBreedWeight: false, // 是否按收获质量排序的标志
    sortByTime: false, // 按开始养殖时间排序状态
    sortByBreed: false, // 按畜禽种类排序状态
    sortByAmount: false, // 按养殖数量排序状态
    sortByHarvestTime: false, // 按结束养殖时间排序状态
    livestockID:[],
  },

  onLoad: function(options) {
    const id = options.id;
    this.data.e_id=id;
    this.setData({
      img: '/assets/enclosure' + id + '.jpg'
    });
    console.log(this.data.img);
    const app = getApp();
    this.setData({
      u_uid: app.globalData.u_uid
    });
    console.log('uuid:'+this.data.u_uid);
    // 发送请求到后端接口获取 crop 数据
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/an-names', // 后端接口地址
      method: 'GET',
      success: (res) => {
        // 请求成功，处理返回的数据
        if (res.statusCode === 200 && res.data.an_name) {
          // 将 crop_names 设置到 data 中，用于页面展示
          this.setData({
            livestockTypes: res.data.an_name,
            livestockID:res.data.an_id, ///!!!!,
            selectedLivestockTypeId:res.data.an_id[0],
          });
          console.log(res.data.an_name);

          wx.request({
            url: 'http://127.0.0.1:8080/testapp/api/nowenclosureinfo/?e_id='+this.data.e_id,
            method: 'GET', // 请求方法，这里假设使用 GET 方法
            data: {
              e_id: this.data.e_id, // 发送到后端的数据，以 f_id 作为查询条件
              // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
            },
            header: {
              'content-type': 'application/json' // 根据后端要求设置请求头
            },
            success: (res) =>{
              // 请求成功的回调函数
              console.log(res.data); // 打印后端返回的数据，查看是否符合预期
              this.setData({
                enclosureInfo: {
                  e_id: res.data.e_id,
                  e_name: res.data.e_name,
                  e_add: res.data.e_add,
                  e_square: res.data.e_square,
                  e_desc: res.data.e_desc,
                  e_isfree: res.data.e_isfree,
                }
              });
              // 在这里处理后端返回的数据，更新页面或其他操作
              wx.request({
                url: 'http://127.0.0.1:8080/testapp/api/breedingrecord/?e_id='+this.data.e_id,
                method: 'GET', // 请求方法，这里假设使用 GET 方法
                data: {
                  e_id: this.data.e_id, // 发送到后端的数据，以 f_id 作为查询条件
                  // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
                },
                header: {
                  'content-type': 'application/json' // 根据后端要求设置请求头
                },
                success: (res) => {
                  const plantingsWithCropName = res.data.map(item => {
                    return {
                      ...item,
                      an_name: this.GetName(item.an_id)
                    };
                  });
                  //console.log('在这里');
                  //console.log(res.data);  // 打印返回的数据，确保数据格式正确
                  this.setData({
                    breedings: plantingsWithCropName  // 将获取的数据存入页面状态中
                  });
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
            url: 'http://127.0.0.1:8080/testapp/api/enclosureisfree/?e_id='+this.data.e_id,
            method: 'GET',
            data: {
              e_id: this.data.e_id
            },
            success: (res) => {
              //this.data.isIdle= !res.data.e_isfree;
              //this.data.selectedLivestockTypeId=res.data.e_isfree;
              //this.data.selectedLivestockTypeIndex=res.data.e_isfree-1;
              //this.data.selectedLivestockType=this.data.livestockTypes[this.data.selectedLivestockTypeIndex];
              this.setData({
                isIdle:!res.data.e_isfree,
                //selectedLivestockTypeId:res.data.e_isfree,
                selectedLivestockTypeIndex:res.data.e_isfree-1,
                selectedLivestockType:this.data.livestockTypes[this.data.selectedLivestockTypeIndex],
              });
              //console.log("12345------"+this.data.isIdle);
              //console.log(res.data);
              //console.log(this.data.selectedCropTypeId);
              //console.log(this.data.selectedCropTypeIndex);
              //console.log(this.data.cropTypes);
              //console.log(this.data.cropTypes[0]);
              //console.log(this.data.cropTypes[this.data.selectedCropTypeIndex]);
              //console.log(this.data.selectedCropType);
              if(!this.data.isIdle){
                wx.request({
                  url: 'http://127.0.0.1:8080/testapp/api/nowbreedingrecord/?e_id='+this.data.e_id,
                  method: 'GET', // 请求方法，这里假设使用 GET 方法
                  data: {
                    e_id: this.data.e_id, // 发送到后端的数据，以 f_id 作为查询条件
                    // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
                  },
                  header: {
                    'content-type': 'application/json' // 根据后端要求设置请求头
                  },
                  success: (res) =>{
                    // 请求成功的回调函数
                    console.log(res.data); // 打印后端返回的数据，查看是否符合预期
                    let index = this.data.livestockID.findIndex(livestock => livestock === res.data.an);
                    let name=this.data.livestockTypes[index];
                    this.setData({
                      breedInfo: {
                        an: res.data.an,
                        an_name:name,
                        e: res.data.e,
                        is_stored: res.data.is_stored,
                        b_endtime: null,
                        b_num: null,
                        b_id: res.data.b_id,
                        b_breedamount: res.data.b_breedamount,
                        b_starttime: res.data.b_starttime
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
          console.error('Failed to fetch animal names: Unexpected response format');
        }
      },
      fail: (error) => {
        console.error('Failed to fetch animal names: ', error);
      }
    });
    
},

openAddModal: function() {
  if(this.data.u_uid==1){
  if (this.data.isIdle) {
    this.setData({
      showAddModal: true
    });
  } else {
    wx.showToast({
      title: '圈舍不空闲，无法养殖',
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

closeAddModal: function() {
  this.setData({
    showAddModal: false,
    selectedLivestockType: null,
    selectedQuantity: 0
  });
},

onLivestockTypeChange: function(e) {//
  const index = e.detail.value;
    //console.log(this.data.selectedCropTypeId);
    this.setData({
      selectedLivestockType: this.data.livestockTypes[index],
      selectedLivestockTypeIndex: index,
      //selectedLivestockTypeId: Number(index) + 1
      selectedLivestockTypeId:this.data.livestockID[index]
    }, () => {
      // setData 回调函数，确保数据已经更新
      console.log('setData 更新完成');
    });
},

onQuantityChange: function(e) {//
  this.setData({
    selectedQuantity: e.detail.value
  });
},

addLivestock: function() { //
  //const { selectedCropType, selectedQuantity } = this.data;
  if (this.data.selectedLivestockType && this.data.selectedQuantity > 0) {
    //console.log(String(this.data.selectedCropTypeId));
    //console.log(this.data.f_id);
    //console.log(this.data.selectedQuantity);      
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/breeding/', // 后端接口地址
      method: 'POST',
      header: {
        'Content-Type': 'application/json' // 确保Content-Type为application/json
      },
      data: {
        an_id: String(this.data.selectedLivestockTypeId),
        e_id: this.data.e_id,
        b_breedamount: this.data.selectedQuantity
      },
      success: (res) => {
        console.log(res)
        if (res.statusCode === 201) {
          wx.showToast({
            title: '养殖记录添加成功',
            icon: 'success'
          });
          // 这里可以进行额外的操作，例如刷新数据等
          wx.request({
            url: 'http://127.0.0.1:8080/testapp/api/nowbreedingrecord/?e_id='+this.data.e_id,
            method: 'GET', // 请求方法，这里假设使用 GET 方法
            data: {
              e_id: this.data.e_id, // 发送到后端的数据，以 f_id 作为查询条件
              // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
            },
            header: {
              'content-type': 'application/json' // 根据后端要求设置请求头
            },
            success: (res) =>{
              // 请求成功的回调函数
              console.log(res.data); // 打印后端返回的数据，查看是否符合预期
              let index = this.data.livestockID.findIndex(livestock => livestock === res.data.an);
              let name=this.data.livestockTypes[index];
              this.setData({
                breedInfo: {
                  an: res.data.an,
                  an_name:name,
                  e: res.data.e,
                  is_stored: res.data.is_stored,
                  b_endtime: null,
                  b_num: null,
                  b_id: res.data.b_id,
                  b_breedamount: res.data.b_breedamount,
                  b_starttime: res.data.b_starttime
                }
              });
              
            },
            fail: function(err) {
              // 请求失败的回调函数
              console.error('请求失败', err); // 打印错误信息
            }
          });
          //养殖记录更新
          wx.request({
            url: 'http://127.0.0.1:8080/testapp/api/breedingrecord/?e_id='+this.data.e_id,
            method: 'GET', // 请求方法，这里假设使用 GET 方法
            data: {
              e_id: this.data.e_id, // 发送到后端的数据，以 f_id 作为查询条件
              // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
            },
            header: {
              'content-type': 'application/json' // 根据后端要求设置请求头
            },
            success: (res) => {
              const plantingsWithCropName = res.data.map(item => {
                return {
                  ...item,
                  an_name: this.GetName(item.an_id)
                };
              });
              //console.log('在这里');
              //console.log(res.data);  // 打印返回的数据，确保数据格式正确
              this.setData({
                breedings: plantingsWithCropName  // 将获取的数据存入页面状态中
              });
            },
            fail: function(err) {
              // 请求失败的回调函数
              console.error('请求失败', err); // 打印错误信息
            }
          });
        } else {
          wx.showToast({
            title: '养殖记录添加失败',
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
      title: '开始养殖新动物',
      icon: 'success'
    });
    // 更新土地状态
    this.setData({
      isIdle: false,
      //details: this.data.details + `\n种植了${this.data.selectedQuantity}株${this.data.selectedCropType}。`,         //更新详情
      showAddModal: false
    });
  } else {
    wx.showToast({
      title: '请先选择动物种类和数量',
      icon: 'none'
    });
  }
},


openHarvestModal: function() {//
  if(this.data.u_uid==1){
  this.setData({
    selectedLivestockType: this.data.selectedLivestockType
  });
  //if (!this.data.isIdle && this.data.selectedCropType) {
    if (!this.data.isIdle) {
    this.setData({
      showHarvestModal: true
    });
  } else {
    wx.showToast({
      title: '当前没有可结束养殖的动物',
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

harvestLivestock: function() {
  const { isIdle, harvestQuantity } = this.data;    //这里的isIdle指的是当前种植作物的种类
  if (harvestQuantity > 0) {
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/harvestanimal/',  // 替换为你的后端接口地址        //////
      method: 'POST',
      data: {
        b_id: this.data.breedInfo.b_id,
        b_num: harvestQuantity,
        e: this.data.e_id,
      },
      header: {
        'content-type': 'application/json'  // 默认值
      },
      success:(res) =>{
        console.log(res.data);
        // 允许收获作物
        wx.showToast({
        title: '成功结束养殖',
        icon: 'success'
    });
    this.setData({
      breedInfo: null  // 将获取的数据存入页面状态中
    });
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/breedingrecord/?e_id='+this.data.e_id,
      method: 'GET', // 请求方法，这里假设使用 GET 方法
      data: {
        e_id: this.data.e_id, // 发送到后端的数据，以 f_id 作为查询条件
        // 其他条件，例如收获时间或数量为空的记录，可以在后端进行处理
      },
      header: {
        'content-type': 'application/json' // 根据后端要求设置请求头
      },
      success: (res) => {
        const plantingsWithCropName = res.data.map(item => {
          return {
            ...item,
            an_name: this.GetName(item.an_id)
          };
        });
        //console.log('在这里');
        //console.log(res.data);  // 打印返回的数据，确保数据格式正确
        this.setData({
          breedings: plantingsWithCropName  // 将获取的数据存入页面状态中
        });
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

  } else {
    wx.showToast({
      title: '请输入收获的质量',
      icon: 'none'
    });
  }
},
sortByBreedWeight: function() {
  const { breedings } = this.data;

  // 根据质量排序
  let sortedbreedings = [...breedings];
  sortedbreedings.sort((a, b) => a.b_num - b.b_num);

  // 更新页面数据，显示排序后的养殖记录和修改排序状态
  this.setData({
    sortedbreedings: sortedbreedings,
    sortByHarvestWeight: true
  });
},
sortByBreedingTime: function() {
  const { breedings } = this.data;

  // 根据养殖时间排序
  let sortedbreedings = [...breedings];
  sortedbreedings.sort((a, b) => new Date(a.b_starttime) - new Date(b.b_starttime));

  // 更新页面数据，显示排序后的养殖记录和修改排序状态
  this.setData({
    sortedbreedings: sortedbreedings,
    sortByTime: true
  });
},

sortByBreedId: function() {
  const { breedings } = this.data;

  // 根据畜禽序号排序，如果序号相同则按养殖时间排序
  let sortedbreedings = [...breedings];
  sortedbreedings.sort((a, b) => {
    if (a.an_id === b.an_id) {
      return new Date(a.b_starttime) - new Date(b.b_starttime);
    }
    return a.an_id - b.an_id;
  });

  // 更新页面数据，显示排序后的养殖记录和修改排序状态
  this.setData({
    sortedbreedings: sortedbreedings,
    sortByCrop: true
  });
},

sortByBreedAmount: function() {
  const { breedings } = this.data;

  // 根据养殖数量排序，如果数量相同则按养殖时间排序
  let sortedbreedings = [...breedings];
  sortedbreedings.sort((a, b) => {
    if (a.b_breedamount === b.b_breedamount) {
      return new Date(a.b_starttime) - new Date(b.b_starttime);
    }
    return a.b_breedamount - b.b_breedamount;
  });

  // 更新页面数据，显示排序后的养殖记录和修改排序状态
  this.setData({
    sortedbreedings: sortedbreedings,
    sortByAmount: true
  });
},

sortByBreedTime: function() {
  const { breedings } = this.data;

  // 根据收获时间排序
  let sortedbreedings = [...breedings];
  sortedbreedings.sort((a, b) => new Date(a.b_endtime) - new Date(b.b_endtime));

  // 更新页面数据，显示排序后的养殖记录和修改排序状态
  this.setData({
    sortedbreedings: sortedbreedings,
    sortByHarvestTime: true
  });
},
// 下拉框选择
handleSortChange: function (e) {
  const index = e.detail.value;
  switch (index) {
    case '0': // '按收获重量排序'
      this.sortByBreedWeight();
      break;
    case '1': // '按种植时间排序'
      this.sortByBreedingTime();
      break;
    case '2': // '按作物序号排序'
      this.sortByBreedId();
      break;
    case '3': // '按种植数量排序'
      this.sortByBreedAmount();
      break;
    case '4': // '按收获时间排序'
      this.sortByBreedTime();
      break;
    default:
      break;
  }
},
viewRecords: function() {
  // 显示种植记录
  this.setData({
    showRecords: true
  });
},

closeModal: function() {
  // 关闭弹窗
  this.setData({
    showRecords: false,
    sortByBreedWeight: false,
    sortByTime: false, // 按养殖时间排序状态
    sortByBreed: false, // 按畜禽排序状态
    sortByAmount: false, // 按养殖数量排序状态
    sortByBreedTime: false, // 按结束养殖时间排序状态
  });
},
GetName: function(id) {
  //console.log(id);
  let index = this.data.livestockID.findIndex(crop => crop === id);
  //console.log(index);
  let name=this.data.livestockTypes[index];
  //console.log(name);
  return name;
}
});
