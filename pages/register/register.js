Page({
  data: {
    u_id: '',  // 用户名
    u_pw: '',  // 密码
    u_pw_confirm: '',  // 确认密码
    roleTypes: ['管理员', '农田员工', '养殖场员工', '仓库员工', '买家'],
    selectedRoleIndex: -1,  // 初始化为无效索引
    selectedRole:'',
    rolesMap: {  // 角色映射到uuid
      '管理员': 11,
      '农田员工': 12,
      '养殖场员工': 13,
      '仓库员工': 14,
      '买家': 5
    },
    uuid:0,
  },

  onInputUsername(e) {
    this.setData({ u_id: e.detail.value });
  },

  onInputPassword(e) {
    this.setData({ u_pw: e.detail.value });
  },

  onRoleSelectChange(e) {
    const index = e.detail.value;
    if (index === undefined || index === null || index < 0) {
      return;
    }
    const selectedRole = this.data.roleTypes[index];
    this.setData({
      selectedRoleIndex: index,
      selectedRole: selectedRole,
      uuid: this.data.rolesMap[selectedRole]
    });
  },

  onInputConfirmPassword(e) {
    this.setData({ u_pw_confirm: e.detail.value });
  },
  validateUsername(username) {
    // 用户名必须是字母开头，允许字母、数字、下划线，长度在5-20个字符之间
    const re = /^[a-zA-Z][a-zA-Z0-9_]{4,19}$/;
    return re.test(username);
  },
  onRegisterSubmit() {
    const { u_id, u_pw, u_pw_confirm, selectedRoleIndex,uuid } = this.data;
  
    // 验证输入是否完整
    if (!u_id || !u_pw || !u_pw_confirm || selectedRoleIndex < 0) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
  
    // 验证用户名格式
    if (!this.validateUsername(u_id)) {
      wx.showToast({
        title: '用户名格式不正确，必须是字母开头，长度在5-20个字符之间，允许字母、数字、下划线',
        icon: 'none',
        duration: 5000,
      });
      return;
    }
  
    // 验证密码是否一致
    if (u_pw !== u_pw_confirm) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }
  
    // 密码复杂性验证
    if (!this.isPasswordComplex(u_pw)) {
      wx.showToast({
        title: '密码不符合复杂性要求',
        icon: 'none'
      });
      return;
    }
  
    // 发送注册请求到后端
    console.log("!!@@!@",u_id,u_pw,uuid);
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/register/',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        u_id: u_id,
        u_pw: u_pw,
        u_uid: uuid
      },
      success: (res) => {
        console.log(res.data);
        if (res.statusCode === 201) {
          wx.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 1000,
            complete: () => {
              setTimeout(() => {
                wx.navigateBack();
              }, 1000); // 1000毫秒即1秒延迟跳转
            },
          });
        } else if (res.statusCode === 500) {
          wx.showToast({
            title: res.data.error || '用户名或密码不符合规范',
            icon: 'none'
          });
        } else if (res.statusCode === 200||res.statusCode === 400) {
          wx.showToast({
            title: '用户名已存在，请选择其他用户名',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: '注册失败，未知错误',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('注册失败', err);
        wx.showToast({
          title: '注册失败，请稍后再试',
          icon: 'none'
        });
      }
    });
  },

  isPasswordComplex(password) {
    // 密码复杂性检查：包含至少一个特殊字符、一个数字、一个大写字母和一个小写字母
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password);
    const hasNumber = /\d+/.test(password);
    const hasLowercase = /[a-z]+/.test(password);
    const hasUppercase = /[A-Z]+/.test(password);

    return hasSpecialChar && hasNumber && hasLowercase && hasUppercase && password.length >= 8;
  }
});