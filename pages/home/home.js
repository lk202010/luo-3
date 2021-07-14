// pages/home/home.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   * KEY 和 SECRET 需要配置 **************************
   */
  data: {
      APP_KEY: "{{yUNhI8qdPVuKGUlSGOZnBHGX}}",
      APP_SECRET: "{{Gl2wTRpZt3QdsQi2ImsiQiB3RR6sfE5W}}",
      token: "",
      height: 0,
      position: "back",
      src: "",
      userinfo: "",
      map: {
          gender: { male: "男性", female: "女性" },
          glasses: { none: "无眼镜", common: "普通眼镜", sun: "墨镜" },
          emotion: { angry: "愤怒", disgust: "厌恶", fear: "恐惧", happy: "高兴", sad: "伤心", surprise: "惊讶", neutral: "无表情", pouty: "撅嘴", grimace: "鬼脸" },
          expression: { none: "不笑", smile: "微笑", laugh: "大笑" }
      },
      img: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
      const sysinfo = wx.getSystemInfoSync()
      // console.log(sysinfo)
      //取出屏幕的高
      this.setData({
          height: sysinfo.screenHeight
      })

  },
  // 前置后置摄像头
  reverse() {
      this.setData({
          position: this.data.position === "back" ? "front" : "back"
      });
  },
  //拍照
  takePhoto() {
      var that = this;
      // console.log(that);
      const ctx = wx.createCameraContext()
      // console.log(ctx);
      ctx.takePhoto({
          quality: 'high',
          success: (res) => {
              // res.tempImagePath 点击拍照 之后的图片路径
              console.log("path");
              console.log(res.tempImagePath);
              var team_image = wx.getFileSystemManager().readFileSync(res.tempImagePath, "base64");
              const imgpath = res.tempImagePath;
              this.setData({
                  src: res.tempImagePath,
                  // img: team_image
              }, () => {
                  // that.handlePic();
                  // url: /pages/mobilenet/mobilenet/
                  wx.navigateTo({
                    // url: '../mobilenet/mobilenet?imgpath=' +  res.tempImagePath
                    // url: '../demo02/demo02?imgpath=' +  res.tempImagePath
                    url: '../demo03/demo03?imgpath=' +  res.tempImagePath
                  })
              })
          }
      })
  },
  //从本地选择照片
  choosePhoto() {
      var that = this;
      wx.chooseImage({
          count: 1,
          sizeType: ['original'],
          sourceType: ['album'],
          success(res) {
              // console.log(res);
              console.log("本地");
              console.log(res.tempFilePaths[0]);
              if (res.errMsg === "chooseImage:ok" &&
                  res.tempFilePaths.length > 0) {
                  that.setData({
                      src: res.tempFilePaths[0]
                  }, () => {
                      // that.handlePic();
                      wx.navigateTo({
                        // url: '../mobilenet/mobilenet?imgpath=' +  res.tempImagePath
                        // url: '../demo02/demo02?imgpath=' +  res.tempImagePath
                        url: '../demo03/demo03?imgpath=' +  res.tempImagePath
                      })
                  })
              }
          }
      })
  },
  // 重新拍照 或重新选择照片
  reChoose() {
      // console.log("1");
      this.setData({
          src: "",
          userinfo: "",
          token: ""
      })
  },


  // 图像处理
  handlePic(){
      var that = this;
      console.log("handlePic");
      console.log(that);
      // console.log(src);
      // console.log(that.data.APP_KEY);
      // console.log(that.data.src);
      // var team_image = wx.getFileSystemManager().readFileSync(that.data.src, "base64")
      // console.log(team_image);

  },
})