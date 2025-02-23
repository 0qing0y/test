  Page({
    data: {
      rightitem: [],
      number: 0,
      cartCount: 0,
      cartItems: []
    },
  
    onLoad(options) {
      const data_two = options.data;
      this.fetchGoodsData(data_two);
      this.setData({
        number: data_two,
        cartItems: wx.getStorageSync('cartItems') || []
      });
    },
  
    fetchGoodsData(data_two) {
      const that = this;
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/goods/', // 替换为你的Django服务器地址
        method: 'GET',
        success:(res) =>{
          const allGoods = res.data;
          console.log(res.data);
          console.log(this.data.number);
          const categorizedGoods = allGoods.map(item => ({
            ...item,
            tag: item.g_desc == 1 ? 0 : 1,
            url: item.g_name + ".jpg"
          }));
          //const selectedGoods = categorizedGoods.filter(item => item.tag == data_two);
          //that.setData({ rightitem: selectedGoods });
          that.setData({ rightitem: categorizedGoods });
        },
        fail(err) {
          console.error("Failed to fetch goods data:", err);
        }
      });
    },
  
    goBackToGoods() {
      wx.navigateTo({
        url: '/pages/goods/goods'
      });
    },
  
    goBackTocart() {
      wx.navigateTo({
        url: '/pages/cart/cart'
      });
    },
  
    /*addToCart(e) {
      const currentIndex = e.currentTarget.dataset.index;
      console.log(currentIndex);
      const currentItem = { ...this.data.rightitem[currentIndex] };
  
      let cartItems = this.data.cartItems;
      let index = cartItems.findIndex(item => item.id === currentItem.id);
      if (index > -1) {
        cartItems[index].quantity += 1;
      } else {
        currentItem.quantity = 1;
        cartItems.push(currentItem);
      }
  
      this.setData({
        cartCount: this.data.cartCount + 1,
        cartItems: cartItems
      });
  
      wx.setStorageSync('cartItems', cartItems);
    }*/

    addToCart(e) {
      const currentIndex = this.data.number;
      console.log(currentIndex);
      const currentItem = { ...this.data.rightitem[currentIndex] };
      console.log(currentItem)
      const app = getApp();
      const u_id1 = app.globalData.u_id;
    
      /*let cartItems = this.data.cartItems;
      let index = cartItems.findIndex(item => item.id === currentItem.id);
      if (index > -1) {
        cartItems[index].quantity += 1;
      } else {
        currentItem.quantity = 1;
        cartItems.push(currentItem);
      }*/
    
      // 更新购物车数量和购物车数据
      this.setData({
        cartCount: this.data.cartCount + 1,
        //cartItems: cartItems
      });
    
      // 将购物车数据存储到本地缓存
      //wx.setStorageSync('cartItems', cartItems);
    
      // 向后端发送请求更新订单表的数量
      wx.request({
        url: 'http://127.0.0.1:8080/testapp/api/addtocart/',
        method: 'POST',
        data: {
          g_id: currentItem.g_id,
          g_price: currentItem.g_price,
          g_name: currentItem.g_name,
          u_id:u_id1,
          images:'/assets/'+currentItem.g_name+'.jpg'
        },
        success: function(response) {
          // 处理成功响应
        },
        fail: function(error) {
          // 处理失败情况
        }
      });
    }




  });
  