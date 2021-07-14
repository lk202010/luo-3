import * as tf from '../../tfjs/tf.min.js'

import { IMAGENET_CLASSES } from './imagenet_classes';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    display: "none",
    src:"",
    img:""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    wx.showLoading({
      title: '正在加载模型...',
    });
    console.log("path "+options.imgpath);
    this.setData({
      img:options.imgpath
    })



    mobilenetDemo(predict);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

})

const MOBILENET_MODEL_PATH = 
  // tslint:disable-next-line:max-line-length
  'https://cnpmjs.org/mirrors/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';

const IMAGE_SIZE = 224;
const TOPK_PREDICTIONS = 10;


let that;
let mobilenet;

const mobilenetDemo = async () => {
  console.log('Loading model...');
  
  mobilenet = await tf.loadLayersModel(MOBILENET_MODEL_PATH);
  // mobilenet.summary()

  // Warmup the model. This isn't necessary, but makes the first prediction
  // faster. Call `dispose` to release the WebGL memory allocated for the return
  // value of `predict`.
  mobilenet.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])).dispose();
  // console.log(mobilenet);

getImageData('mobileCanvas', that.data.img, function (imgData) {
    //  在此处得到的RGB数据
    // console.log("imgData "+imgData.length); //150528 = 224 * 224 * 3

    console.log("getImageData");
    predict(imgData);
  });
}

// 获取图像RGB数据
var getImageData = function (canvasId, imgUrl, callback, imgWidth, imgHeight) {
  console.log(imgWidth, imgHeight);
  console.log("entering getImageData");
  console.log(canvasId);
  const ctx = wx.createCanvasContext(canvasId);
  console.log("bb");
  ctx.drawImage(imgUrl, 0, 0, imgWidth || IMAGE_SIZE, imgHeight || IMAGE_SIZE);
  ctx.draw(false, () => {
    console.log("ctx.draw");

    // API 1.9.0 获取图像数据  获取 canvas 区域隐含的像素数据。
    wx.canvasGetImageData({
      canvasId: canvasId,
      x: 0,
      y: 0,
      width: imgWidth || IMAGE_SIZE,
      height: imgHeight || IMAGE_SIZE,
      success(res) {
        //图像像素点数据，一维数组，每四项表示一个像素点的 rgba
        var result = res; 
        // console.log(res.data.length) //200704 = 224 * 224 * 4然后把他变为224*224*3的RGB图像
        console.log("buf:" + [result.data.buffer]);

        // RGBA to RGB
        var rgbData = new Uint8Array(res.width * res.height * 3);
        let idx = 0;
        for (let i = 0; i < res.data.length; i +=4) {
          // idx+=3 i+=4 把RGBA --> RGB
          rgbData[idx] = res.data[i];
          rgbData[idx + 1] = res.data[i + 1];
          rgbData[idx + 2] = res.data[i + 2];
          idx += 3;
        }
        // console.log(rgbData.length) //150528 = 224 * 224 * 3
        callback(rgbData);
      },
      fail: e => {
        console.error(e);
      },
    })
  })
};

/**
 * Given an image element, makes a prediction through mobilenet returning the
 * probabilities of the top K classes.
 */
async function predict(imgData) {
  wx.showLoading({
    title: '正在识别图像...',
  });

  // The first start time includes the time it takes to extract the image
  // from the HTML and preprocess it, in additon to the predict() call.
  const startTime1 = performance.now();
  // The second start time excludes the extraction and preprocessing and
  // includes only the predict() call.
  let startTime2;
  const logits = tf.tidy(() => {
    // tf.browser.fromPixels() returns a Tensor from an image element.
    const img = tf.tensor3d(imgData, [IMAGE_SIZE, IMAGE_SIZE, 3]).toFloat();

    const offset = tf.scalar(127.5);
    // Normalize the image from [0, 255] to [-1, 1].
    const normalized = img.sub(offset).div(offset);

    // Reshape to a single-element batch so we can pass it to predict.
    const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
    // console.log("batched" + batched);

    startTime2 = performance.now();
    // Make a prediction through mobilenet.
    return mobilenet.predict(batched);
  });

  // console.log("logits "+logits);
  // Convert logits to probabilities and class names.
  const classes = await getTopKClasses(logits, TOPK_PREDICTIONS);
  const totalTime1 = performance.now() - startTime1;
  const totalTime2 = performance.now() - startTime2;
  console.log(`Done in ${Math.floor(totalTime1)} ms ` +
    `(not including preprocessing: ${Math.floor(totalTime2)} ms)`);

  wx.hideLoading();

  // Show the classes.
  showResults(classes);
}

function showResults(classes) {
  let probabilities = "";
  for (let i = 0; i < classes.length; i++) {
    console.log("class:" + classes[i].className + ", probability:" + classes[i].probability.toFixed(3));
    probabilities = probabilities + classes[i].className + ": " + classes[i].probability.toFixed(3) + "\n";
  }
  
  that.setData({
    display: "block",
    probabilities: probabilities,
  });
}

/**
 * Computes the probabilities of the topK classes given logits by computing
 * softmax to get probabilities and then sorting the probabilities.
 * @param logits Tensor representing the logits from MobileNet.
 * @param topK The number of top predictions to show.
 */
export async function getTopKClasses(logits, topK) {
  const values = await logits.data();
  // console.log("values"+values.length); //1000分类  长度1000

  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({ value: values[i], index: i });
  }
  valuesAndIndices.sort((a, b) => {
    return b.value - a.value;
  });
  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      className: IMAGENET_CLASSES[topkIndices[i]],
      probability: topkValues[i]
    })
  }
  return topClassesAndProbs;
}


