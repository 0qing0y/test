Page({
  data: {
    leaveRecords: [], // 请假记录列表
    u_id: '', // 用户ID，假设从全局数据获取
  },

  onLoad(options) {
    // 查询请假记录
    const app = getApp();
    const u_id = app.globalData.u_id;
    this.setData({
      u_id: u_id,
    });

    // 模拟请求后端接口获取请假记录数据
    wx.request({
      url: 'http://127.0.0.1:8080/testapp/api/leave_records/?u_id=' + u_id,
      method: 'GET',
      data: {},
      success: (res) => {
        if (res.statusCode === 200) {
          const leaveRecords = res.data.map(record => ({
            ...record,
            steps: this.generateStepsForRecord(record),
            icon: this.IconForRecord(record),
            ischeck: this.Check(record),
            color: this.Color(record),
          }));

          // 根据 l_startdate 字段排序
          leaveRecords.sort((a, b) => {
            return new Date(b.l_startdate) - new Date(a.l_startdate);
          });

          this.setData({
            leaveRecords: leaveRecords,
          });
        } else {
          wx.showToast({
            title: '获取数据失败，请稍后再试',
            icon: 'none',
          });
        }
      },
      fail: (error) => {
        console.error('请求失败', error);
        wx.showToast({
          title: '请求失败，请稍后再试',
          icon: 'none',
        });
      },
    });
  },

  // 根据每条记录生成对应的步骤数组
  generateStepsForRecord(record) {
    const steps = [];

    // 第一个步骤：已申请
    steps.push({
      text: '已申请', // 根据具体需求设置文本
    });

    // 第二个步骤：待审批
    steps.push({
      text: '待审批', // 根据具体需求设置文本
    });

    // 第三个步骤：根据审批状态添加步骤
    if (record.l_permit === 1) {
      steps.push({
        text: '已审批',
        desc: '审批通过',
      });
    } else if (record.l_permit === 2) {
      steps.push({
        text: '已审批',
        desc: '审批不通过',
      });
    }

    return steps;
  },

  // 根据审批状态返回图标
  IconForRecord(record) {
    if (record.l_permit === 2) {
      return 'cross';
    } else if (record.l_permit === 0) {
      return 'star';
    } else {
      return 'success';
    }
  },

  // 根据审批状态返回 ischeck（示例中返回1或2）
  Check(record) {
    if (record.l_permit === 0) {
      return 1;
    } else {
      return 2;
    }
  },

  // 根据审批状态返回颜色
  Color(record) {
    if (record.l_permit === 2) {
      return 'red';
    } else if (record.l_permit === 0) {
      return 'blue';
    } else {
      return '#1aad19';
    }
  },
});