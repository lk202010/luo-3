const app = getApp()
var ctx = ""
// pages/demo03/demo03.js
Page({
  data: {
    display: "none",
    src:"",
    img:"",
    y:[],
    imgwidth:0,
    imgheight:0,
    IMAGE_SIZE_X:320,
    IMAGE_SIZE_Y:240,
  },
  //全局变量
  globalData:{
    x:null,
    y:null,
    width:null,
    height:null,
  },

  onLoad: function (options) {
    var that = this;
    console.log("path "+options.imgpath);
    this.setData({
      img:options.imgpath
    });
 
    // that.RGBtoGray();
    console.log("img "+this.data.img);
    // that.drawline(32, 11, 40, 40)
  },
  onReady: function(){
    var that = this;
    wx.getImageInfo({
      src: "2.jpg",
      success: function(res){
        that.setData({
          imgwidth:res.width,
          imgheight:res.height,
        })
      }
    })
  },
  getRGB(){
    var that = this;
    const query = wx.createSelectorQuery()  // 创建一个dom元素节点查询器
    query.select('#mobileCanvas')
      .fields({   			// 需要获取的节点相关信息
        node: true,       // 是否返回节点对应的 Node 实例
        size: true         // 是否返回节点尺寸（width height）
      }).exec((res) => {
        const canvas = res[0].node                // canvas就是我们要操作的画布节点
        const ctx = canvas.getContext('2d')   // 以2d模式，获取一个画布节点的上下文对象

        const img = canvas.createImage()
        img.src = "2.jpg"
        // console.log("x " + that.data.imgwidth, that.data.imgheight);
        img.onload = function(e) {
          ctx.drawImage(img, 0, 0, 320, 240)
          var imageData = ctx.getImageData(0, 0, that.data.imgwidth, that.data.imgheight)
          console.log(imageData)
          
          // RGBA to RGB
          var color1 = [];
          var color2 = [];
          var gray = [];
          var graybox = [];
          var colorloc = [];
          let idx = 0;
          // console.log(that.data.imgwidth, that.data.imgheight);//901 631
          for (let i = 0; i < imageData.data.length; i +=4) {
            // idx+=3 i+=4 把RGBA --> RGB
            
            var g = Math.floor((imageData.data[i]*299 + imageData.data[i + 1]*587 + imageData.data[i + 2]*114 + 500)/1000)
            if (g>200){
              g = 255
            }else{
              g = 0
            }
            gray.push(g);

            color1.push([imageData.data[i], imageData.data[i + 1],imageData.data[i + 2]])
            idx += 1;
            if (idx % that.data.imgwidth === 0){//每901 width个像素就
              color2.push(color1);
              graybox.push(gray);
              color1 = [];
              gray = [];
            }
          }
          // console.log(color2[0][0], color2[0][1], color2[0][2]);
          // console.log(color2[0][0].toString() == color2[0][1].toString());
          console.log(graybox);
          for (let i = 0; i < that.data.imgheight; i++){
            for (let j = 1; j < that.data.imgwidth-1; j++){
              // console.log(i,j);
              // console.log(color2[i][j-1], color2[i][j], color2[i][j+1])
              // if (color2[i][j-1].toString() != color2[i][j].toString() && color2[i][j].toString() != color2[i][j+1].toString()){
              //   console.log(i,j);
              // }
            }
          }
          
        }
        
        
      })

  },
  // 获取图像RGB数据
  getImageData() {
    var that = this;
    var canvasId = "mobileCanvas"
    var imgUrl = "2.jpg"
    var imgWidth = that.data.imgwidth
    var imgHeight = that.data.imgheight
    console.log(imgWidth, imgHeight);
    console.log("entering getImageData");
    console.log(canvasId);
    const ctx = wx.createCanvasContext(canvasId);
    console.log("bb");
    ctx.drawImage(imgUrl, 0, 0, 320 , 240 );
    ctx.draw(false, () => {
      console.log("ctx.draw");

      // API 1.9.0 获取图像数据  获取 canvas 区域隐含的像素数据。
      wx.canvasGetImageData({
        canvasId: canvasId,
        x: 0,
        y: 0,
        width: imgWidth,
        height: imgHeight,
        success(res) {
          //图像像素点数据，一维数组，每四项表示一个像素点的 rgba
          var result = res; 
          // console.log(res.data.length) //200704 = 224 * 224 * 4然后把他变为224*224*3的RGB图像
          console.log("buf:" + [result.data.buffer]);
          console.log(res);
          // RGBA to RGB
          var rgbData = new Uint8Array(res.width * res.height * 3);
          let idx = 0;
          // for (let i = 0; i < res.data.length; i +=4) {
          //   // idx+=3 i+=4 把RGBA --> RGB
          //   rgbData[idx] = res.data[i];
          //   rgbData[idx + 1] = res.data[i + 1];
          //   rgbData[idx + 2] = res.data[i + 2];
          //   idx += 3;
          // }
          // console.log(rgbData);
          // console.log(rgbData.length) //150528 = 224 * 224 * 3
        },
        fail: e => {
          console.error(e);
        },
      })
    })
  },
  draw(ctx, a,b){
    var that = this
    var x = that.data.IMAGE_SIZE_X || that.data.imgwidth
    var y = that.data.IMAGE_SIZE_Y || that.data.imgheight
    ctx.drawImage("2.jpg", 0, 0, x, y)
    ctx.strokeRect(a, b, 3, 3)
    ctx.draw(true)
    console.log("hha");
  },
  drawGray(data){
    var that = this
    var x = that.data.IMAGE_SIZE_X || that.data.imgwidth
    var y = that.data.IMAGE_SIZE_Y || that.data.imgheight
    wx.canvasPutImageData({
      canvasId: 'canvas1',
      x: 0,
      y: 0,
      width: x,
      height: y,
      data: new Uint8ClampedArray(data),
    })
  },
  getImg(){
    //画图
    var that = this
    var x = that.data.IMAGE_SIZE_X || that.data.imgwidth
    var y = that.data.IMAGE_SIZE_Y || that.data.imgheight
    console.log("x,y: "+ x,y);
    const ctx = wx.createCanvasContext('canvas')
    ctx.drawImage("2.jpg", 0, 0, x, y)
    //按位置框选
    ctx.strokeRect(300, 128, 43, 60)
    //写字
    ctx.setFontSize(20)
    ctx.fillStyle = 'rgb(192, 80, 77)';
    ctx.fillText('first', 10,30)
    // ctx.draw()
    ctx.draw(false, () => {
      // console.log("ctx.draw");
      // API 1.9.0 获取图像数据
      wx.canvasGetImageData({
        canvasId: 'canvas',
        x: 0,
        y: 0,
        width: x, 
        height: y,
        success(res) {
          var imageData = res;
          // console.log(res.data.length)
          // console.log(result.data)

          // RGBA to RGB
          var color1 = [];
          var color2 = [];
          var gray = [];
          var graybox = [];
          var gray1 = [];
          let idx = 0;
          console.log(x, y);
          for (let i = 0; i < imageData.data.length; i +=4) {
            
            //灰度化 255白色 0黑色
            var g = Math.floor((imageData.data[i]*299 + imageData.data[i + 1]*587 + imageData.data[i + 2]*114 + 500)/1000)
            if (g>254){
              g = 255
            }else{
              g = 0
            }
            gray.push(g);
            gray1.push(g)

            color1.push([imageData.data[i], imageData.data[i + 1],imageData.data[i + 2]])
            idx += 1;
            if (idx % y === 0){//每901 width个像素就
              color2.push(color1);
              graybox.push(gray);
              color1 = [];
              gray = [];
            }
          }
          //graybox是灰度数值，color2是RGB数值
          console.log(graybox);
          console.log(color2);
          console.log(gray1);
          // that.drawGray(gray1)
          
          


          //检测灰度值中为0的边缘点 如果为0即黑色，就把他的位置记录下来
          var colorloc = [];
          for (let i = 0; i < x; i++){
            for (let j = 1; j < y-1; j++){
              if ((graybox[i][j-1] === 255 && graybox[i][j] === 0) || (graybox[i][j] === 0 && graybox[i][j+1] === 255)){
                colorloc.push([i,j])
                // that.draw(ctx, i,j)
              }
            }
          }
          // for (let i = 1; i < x*y-1; i++){
          //   if ((gray1[i-1]===255 && gray1[i] === 0) || (gray1[i]===0 && gray1[i+1] === 255)){
          //     colorloc.push([i])
          //   }
          // }
          console.log(colorloc);


        },
        fail: e => {
          console.error(e);
        },
      })
    })

  },

  drawline(x, y, width, height){
    const query = wx.createSelectorQuery()  // 创建一个dom元素节点查询器
    query.select('#canvas')
      .fields({   			// 需要获取的节点相关信息
        node: true,       // 是否返回节点对应的 Node 实例
        size: true         // 是否返回节点尺寸（width height）
      }).exec((res) => {
        const canvas = res[0].node                // canvas就是我们要操作的画布节点
        const ctx = canvas.getContext('2d')   // 以2d模式，获取一个画布节点的上下文对象
        
        this.loadImgData(canvas, ctx)

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        console.log("canvas.width"+canvas.width);
        console.log("canvas.height"+canvas.height);
        ctx.scale(dpr, dpr)
    
        ctx.strokeStyle = "#00ff00"
        ctx.lineWidth = 5
        ctx.rect(x, y, width, height)
        ctx.stroke()
      })
    console.log("xx");
  },

  loadImgData(canvas, ctx){
    //drawimage并getimagedata
    var that = this;
    const img = canvas.createImage()
    img.src = "2.jpg"
    img.onload = function(e) {
      ctx.drawImage(img, 0, 0, 28, 28)
      var imageData = ctx.getImageData(0, 0, 28, 28)
      console.log(imageData)

      that.RGBtoGray(imageData)

    }

  },

  RGBtoGray(res) {
    // RGBA to RGB
    console.log("res:" + res);

  },
})
