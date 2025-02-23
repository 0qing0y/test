Page({
  data: {
    products: [], // 商品列表
    showListModal: false, // 控制上架弹窗显示
    categories: ['作物', '畜禽'], // 模拟种类数据
    selectedCategory: null, // 选择的种类
    selectedQuantity: null, // 选择的数量
    selectedPrice: null, // 选择的单价
    selectedDescription: '' // 选择的描述
  },

  onLoad: function() {
    // 初始化已上架的商品数据
/*    this.setData({
      products: [
        { id: 1, name: '商品A', category: '种类A', quantity: 10, price: 50, description: '这是商品A的描述', status: true },
        { id: 2, name: '商品B', category: '种类B', quantity: 5, price: 30, description: '这是商品B的描述', status: true }
      ]
    });*/
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/goods/', // 替换为你的Django服务器地址
      method: 'GET',
      success:(res)=> {
        const Goods = res.data.map((item, index) => ({
          ...item,
          id: index
        }));
        this.setData({ products: Goods });
        console.log(this.data.products);
      },
      fail(err) {
        console.error("Failed to fetch goods data:", err);
      }
    });
  },

  openListModal: function() {
    this.setData({
      showListModal: true
    });
  },

  closeListModal: function() {
    this.setData({
      showListModal: false,
      selectedCategory: null,
      selectedQuantity: 0,
      selectedPrice: 0,
      selectedDescription: ''
    });
  },

  onCategoryChange: function(e) {
    const index = e.detail.value;
    this.setData({
      selectedCategory: this.data.categories[index]
    });
  },

  onQuantityChange: function(e) {   //名称修改
    this.setData({
      selectedQuantity: e.detail.value
    });
  },

  onPriceChange: function(e) {
    this.setData({
      selectedPrice: e.detail.value
    });
  },

  onDescriptionChange: function(e) {  //输入批次号
    this.setData({
      selectedDescription: e.detail.value
    });
  },

  confirmList: function() {
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/upgoods/', // 后端接口地址
      method: 'POST',
      header: {
        'Content-Type': 'application/json' // 确保Content-Type为application/json
      },
      data: {
        g_desc: this.data.selectedCategory =="作物"? 1:2,
        g_name: this.data.selectedQuantity,
        g_price:this.data.selectedPrice,
        id: this.data.selectedDescription,
      },
      success: (res) => {
        console.log(res)
        if (res.statusCode === 201) {
          this.setData({
            showListModal:false
          });
          wx.showToast({
            title: '商品上架成功',
            icon: 'success'
          });

        } else if(res.statusCode === 404||res.statusCode === 400){
          wx.showToast({
            title: '该批次已上架，上架失败',
            icon: 'none'
          });
        }
        wx.request({
          url: 'http://127.0.0.1:8080/testapp/api/goods/', // 替换为你的Django服务器地址
          method: 'GET',
          success:(res)=> {
            const Goods = res.data.map((item, index) => ({
              ...item,
              id: index
            }));
            this.setData({ products: Goods });
            console.log(this.data.products);
          },
          fail(err) {
            console.error("Failed to fetch goods data:", err);
          }
        });

      },
      fail: (error) => {
        console.error('请求失败: ', error);
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      }
    });



/*
    const { selectedCategory, selectedQuantity, selectedPrice, selectedDescription, products } = this.data;
    if (selectedCategory && selectedQuantity > 0 && selectedPrice > 0 && selectedDescription) {
      // 生成新商品ID
    //  const newProductId = products.length ? products[products.length - 1].id + 1 : 1;
      // 创建新商品对象
    //  const newProduct = {
    //    id: newProductId,
    //    name: `商品${String.fromCharCode(64 + newProductId)}`, // 假设商品名称为"商品A", "商品B"等
    //    category: selectedCategory,
    //    quantity: selectedQuantity,
    //    price: selectedPrice,
    //    description: selectedDescription,
    //    status: true
    //  };
      // 更新商品列表
      this.setData({
      //  products: [...products, newProduct],
        showListModal: false,
        selectedCategory: null,
        selectedQuantity: 0,
        selectedPrice: 0,
        selectedDescription: ''
      });
      //wx.showToast({
      //  title: '商品已上架',
      //  icon: 'success'
      //});
    } else {
      wx.showToast({
        title: '请完整填写所有信息',
        icon: 'none'
      });
    }*/
  },

  unlistProduct: function(e) {
    const productId = e.currentTarget.dataset.id;
    console.log(productId);
    console.log(this.data.products);
    console.log(this.data.products[productId]);
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/unlistgoods/', // 后端接口地址
      method: 'DELETE',
      header: {
        'Content-Type': 'application/json' // 确保Content-Type为application/json
      },
      data: {
        g_desc: this.data.products[productId].g_desc,
        id: this.data.products[productId].g_desc=='1'? this.data.products[productId].p:this.data.products[productId].b,
      },
      success: (res) => {
        console.log(res)
        if (res.statusCode === 404) {
          wx.showToast({
            title: '商品下架失败',
            icon: 'success'
          });

        } else {
          wx.showToast({
            title: '商品下架成功',
            icon: 'none'
          });
        }
        wx.request({
          url: 'http://127.0.0.1:8080/testapp/api/goods/', // 替换为你的Django服务器地址
          method: 'GET',
          success:(res)=> {
            const Goods = res.data.map((item, index) => ({
              ...item,
              id: index
            }));
            this.setData({ products: Goods });
            console.log(this.data.products);
          },
          fail(err) {
            console.error("Failed to fetch goods data:", err);
          }
        });

      },
      fail: (error) => {
        console.error('请求失败: ', error);
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      }
    });


    //const productId = e.currentTarget.dataset.id;
    // 更新本地商品状态
    //const updatedProducts = this.data.products.map(product => {
    //  if (product.id === productId) {
    //    product.status = false;
    //  }
    //  return product;
    //});
    //this.setData({
    //  products: updatedProducts
    //});
    //wx.showToast({
    //  title: '商品已下架',
    //  icon: 'success'
    //});
  }
});
