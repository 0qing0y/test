Page({
  data: {
    warehouse: [],
    id:'',
    isStockInModalVisible: false,
    isStockOutModalVisible: false,
    isQueryModalVisible:false,
    stockInItemName: '',
    stockInItemQuantity: '',
    stockOutItemName: '',
    stockOutItemQuantity: '',
    queryResult:'',
    wareinfo:null,
    isselect:false,
    selectResult:'',
    isSelectModalVisible:false
  },

  onLoad(options) {
    const id = options.id;
    this.setData({ id });
    this.fetchWarehouseDetails(id);
  },

  fetchWarehouseDetails(id) {
    const u_id = getApp().globalData.u_id; // 获取全局变量 u_id
  
    wx.request({
      url: `http://127.0.0.1:8080/testapp/api/warehouse/${id}?u_id=${u_id}`,
      method: 'GET',

      success: (res) => {
        console.log(res.data);
        // 假设后端返回的数据中包含 u_condition 字段
        if (res.data.u_condition === 1) {
          this.setData({
            warehouse: res.data
          });
        } else {
          // 处理无权限查看的情况，例如提示用户或者做其他逻辑
          wx.showToast({
            title: '无权限查看',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求失败', err);
      }
    });
  },
  

  showStockInModal() {
    this.setData({ isStockInModalVisible: true });
  },

  closeStockInModal() {
    this.setData({ isStockInModalVisible: false });
  },

  onStockInItemNameChange(e) {
    this.setData({ stockInItemName: e.detail.value });
  },

  onStockInItemQuantityChange(e) {
    this.setData({ stockInItemQuantity: e.detail.value });
  },

  handleStockIn() {
    const { id, stockInItemName, stockInItemQuantity } = this.data;
    const app = getApp();
    const u_id=app.globalData.u_id;
    wx.request({
      url: `http://127.0.0.1:8080/testapp/api/warehouse/${id}/stock-in`, // 替换为实际的后端接口地址
      method: 'PUT',

      data: {
        itemid: stockInItemName,
       
      },
      success: (res) => {
        if(res.statusCode === 200 ){
        wx.showToast({
          title: '入库成功',
          icon: 'success'
        });
        this.fetchWarehouseDetails(id); // 更新仓库详情
        this.closeStockInModal();}
        else if(res.statusCode === 400){
          wx.showToast({
            title: '请输入数据',
            icon: 'none'
          });
        }else if(res.statusCode === 401){
          wx.showToast({
            title: '该批次产品已入库',
            icon: 'none'
          });
        }
        else{
          wx.showToast({
            title: '入库失败',
            icon: 'False'
          });
        }
      },
      fail: (err) => {
        console.error('入库请求失败', err);
        wx.showToast({
          title: '入库失败',
          icon: 'none'
        });
      }
    });
  },

  showStockOutModal() {
    this.setData({ isStockOutModalVisible: true });
  },

  closeStockOutModal() {
    this.setData({ isStockOutModalVisible: false });
  },

  onStockOutItemNameChange(e) {
    this.setData({ stockOutItemName: e.detail.value });
  },

  onStockOutItemQuantityChange(e) {
    this.setData({ stockOutItemQuantity: e.detail.value });
  },

  handleStockOut() {
    const { id, stockOutItemName, stockOutItemQuantity } = this.data;
    const app = getApp();
    const u_id = app.globalData.u_id;
    wx.request({
        url: `http://127.0.0.1:8080/testapp/api/warehouse/${id}/stock-out`, // 替换为实际的后端接口地址
        method: 'PUT',
        data: {
            itemid: stockOutItemName,
            quantity: stockOutItemQuantity,
        },
        success: (res) => {
            if(res.statusCode === 200 ){
                wx.showToast({
                    title: '出库成功',
                    icon: 'success'
                });
                this.fetchWarehouseDetails(id); // 更新仓库详情
                this.closeStockOutModal();
            } else if(res.statusCode === 400){
                wx.showToast({
                    title: '请输入数据',
                    icon: 'none'
                });
            } else if(res.statusCode === 401){
                wx.showToast({
                    title: '出库失败，数量不足',
                    icon: 'none'
                });
            } else {
                wx.showToast({
                    title: '出库失败',
                    icon: 'none'
                });
            }
        },
        fail: (err) => {
            console.error('出库请求失败', err);
            wx.showToast({
                title: '出库失败',
                icon: 'none'
            });
        }
    });
},


showQueryModal() {
  this.setData({ isQueryModalVisible: true });
},

closeQueryModal() {
  this.setData({ isQueryModalVisible: false });
},



handleQuery() {
  const { id } = this.data; // 假设从数据中获取仓库的id
  const app = getApp();
  const u_id=app.globalData.u_id;
  wx.request({
    url: `http://127.0.0.1:8080/testapp/api/warehouse/${id}/warehousequery`, // 替换为实际的后端查询接口地址
    method: 'GET',
    data: {},
    success: (res) => {
      if (res.statusCode === 200) {
        const { input, output } = res.data; // 获取入库和出库记录

        // 处理入库和出库数据，格式化为统一的结构
        const inputFormatted = input.map(item => ({
          type: '入库',
          id: item.in_id,
          num: item.in_num,
          time: item.in_time,
          product: item.p,
          warehouse: item.w,
          // 其他字段根据实际需要展示
        }));

        const outputFormatted = output.map(item => ({
          type: '出库',
          id: item.out_id,
          num: item.out_num,
          time: item.out_time,
          product: item.p,
          warehouse: item.w,
          // 其他字段根据实际需要展示
        }));

        // 合并入库和出库记录，并按时间排序
        let mergedRecords = [...inputFormatted, ...outputFormatted];
        mergedRecords.sort((a, b) => new Date(a.time) - new Date(b.time));

        const queryResult = {
          input: inputFormatted,
          output: outputFormatted,
          sortedRecords: mergedRecords // 新增排序后的记录字段
        };

        // 更新页面状态，显示弹窗和数据
        this.setData({
          isQueryModalVisible: true,
          queryResult: queryResult
        });
        wx.showToast({
          title: '查询成功',
          icon: 'success'
        });
        console.log('查询结果:', queryResult);
      } else {
        // 处理查询失败的情况
        wx.showToast({
          title: '查询失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('查询请求失败', err);
      wx.showToast({
        title: '查询失败',
        icon: 'none'
      });
    }
  });
},

closeQueryResultModal() {
  this.setData({
    isQueryModalVisible: false,
    queryResult: '', // 清空查询结果内容
  })
},


showSelectyModal() {
  this.setData({ isselect: true });
},

closeSelectModal() {
  this.setData({ isselect: false });
},

closeSelectResultModal() {
  this.setData({
    isSelectModalVisible: false,
    selectResult: '', // 清空查询结果内容
  })
},

selectdetial() {
  const { id } = this.data; // 假设从数据中获取仓库的id
  const app = getApp();
  const u_uid=app.globalData.u_uid;
  if (u_uid !== 1) {
    wx.showToast({
      title: '没有权限',
      icon: 'none',
    });
    return;
  }
  wx.request({
    url: `http://127.0.0.1:8080/testapp/api/warehouse/${id}/selectstorage`, // 替换为实际的后端查询接口地址
    method: 'GET',

    success: (res) => {
  
      if (res.statusCode === 200) {

        const Selectdata=res.data

        // 更新页面状态，显示弹窗和数据
        this.setData({
          selectResult: Selectdata,
          isSelectModalVisible: true,
        });
        wx.showToast({
          title: '查询成功',
          icon: 'success'
        });
        console.log('查询结果:', this.data.selectResult);
        // 处理查询结果，更新界面等操作
      } else {
        // 处理查询失败的情况
        wx.showToast({
          title: '查询失败',
          icon: 'none'
        });
      }
    //  this.closeQueryModal(); // 关闭查询弹窗
    },
    fail: (err) => {
      console.error('查询请求失败', err);
      wx.showToast({
        title: '查询失败',
        icon: 'none'
      });
      this.closeselectModal(); // 关闭查询弹窗
    }
  });
},

});
