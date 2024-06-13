// index.js
/*
Page({
  data: {
    time: (new Date()).toString()
  },
})
*/

Page({
  data: {
    username: '',
    password: '',


    e_id: '',
    e_name: '',
    e_square: '',
    e_add: '',
    e_desc: '',
  /*
    name: '',
    class: '',
    gender: '',
    id: '',
      // 其他学生信息的数据变量*/
  },/*
  inputName: function(e) {
    this.setData({
      name: e.detail.value
    });
  },
  inputAge: function(e) {
    this.setData({
      age: e.detail.value
    });
  },
  inputGender: function(e) {
    this.setData({
      gender: e.detail.value
    });
  },
  submitForm: function(e) {
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/fill/', // 后端 API 的 URL
      method: 'POST',
      header: {
        'content-type': 'application/json' // 设置请求头为 JSON 格式
      },
      
      data: {
        id: this.data.id,
        name: this.data.name,
        class: this.data.class,
        gender: this.data.gender,

        // 其他学生信息的数据
      },
      success: function(res) {
        // 处理新增学生记录成功的情况
        wx.showToast({
          title: '新增成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(res) {
        // 处理新增学生记录失败的情况
        wx.showToast({
          title: '新增失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },*/
  bindInput: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value

    });
  },
  submitForm: function() {
    const data = {
      e_id: this.data.e_id,
      e_name: this.data.e_name,
      e_square: this.data.e_square,
      e_add: this.data.e_add,
      e_desc: this.data.e_desc,
    };
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/efill/',
      method: 'POST',
      data: data,
      success: function(res) {
        console.log(res.data);
        wx.showToast({
          title: '信息增加成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(err) {
        console.error(err);
        wx.showToast({
          title: '信息增加失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  deleteForm: function() {
    const data = {
      e_id: this.data.e_id,
      //e_name: this.data.e_name,
      //e_square: this.data.e_square,
      //e_add: this.data.e_add,
      //e_desc: this.data.e_desc,
    };
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/edelete/', // 这里改成你的删除接口的 URL
      method: 'DELETE', // 使用 DELETE 方法
      data: data,
      success: function(res) {
        console.log(res.data);
        wx.showToast({
          title: '信息删除成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(err) {
        console.error(err);
        wx.showToast({
          title: '信息删除失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  updateForm: function() {
    const data = {
      e_id: this.data.e_id,
      e_name: this.data.e_name,
      e_square: this.data.e_square,
      e_add: this.data.e_add,
      e_desc: this.data.e_desc,
    };
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/eupdate/', // 将主键添加到 URL 中
      method: 'PUT', // 或者使用 PATCH 方法，根据你的需求
      data: data,
      success: function(res) {
        console.log(res.data);
        wx.showToast({
          title: '信息更新成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(err) {
        console.error(err);
        wx.showToast({
          title: '信息更新失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },


/*
  onUsernameChange(event) {
    this.setData({
      username: event.detail
    });
  },
  onPasswordChange(event) {
    this.setData({
      password: event.detail
    });
  },
  login() {
    // 处理登录逻辑，可以发送登录请求等操作
    console.log('用户名：', this.data.username);
    console.log('密码：', this.data.password);
  },
  */
  give: function(e){		//与服务器进行交互
    console.log("执行give服务器这里了！！"),
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/efind/',	//获取服务器地址，此处为本地地址
      method: "GET",
      header:{
        "content-type": "application/x-www-form-urlencoded"		//使用POST方法要带上这个header
      },
      data: {		//向服务器发送的信息
        mname: this.data.mname,
        clent_name: this.data.clent_name,
        id_code: this.data.id_code,
        id_phone:this.data.id_phone,
        choice_lipin: this.data.choice_lipin,
      },
      success: res => {
        console.log(this.mname)
        if (res.statusCode == 200) {
          console.log(res)
          this.setData({
            result: res.data	//服务器返回的结果 
          })    
        }    
      },
    })
  }
})
