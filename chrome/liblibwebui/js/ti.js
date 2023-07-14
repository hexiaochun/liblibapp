document.addEventListener("DOMContentLoaded", function () {

  main_fun();


});

let iframe = null;
let iframeDocument = null ;

function main_fun() {
  if (iframeDocument != null) {
    return;
  }
  iframe = document.querySelector('#iframe');
  if (iframe != null) {
    iframe.addEventListener('load', () => {
      console.log("frame init--------------------- ");
      iframeDocument = iframe.contentDocument;
    });
  }
  // 如果 iframeDocument 仍然为 null，说明 iframe 还没有加载完成，所以我们需要再次调用 main_fun
  if (iframeDocument == null) {
    setTimeout(main_fun, 10);
  }
}




function showStatus(msg){

  if(window.location.href.indexOf("www.liblibai.com/sd") >0 ){
    //判断当前网页是正确的网页

    createFloatBox(msg);

  }

}

// 创建一个全局变量用来保存创建的浮动框
var floatBox;
function createFloatBox(content) {
    // 如果浮动框已经创建了，就只更新内容
    if (floatBox) {
        floatBox.textContent = content;
    } else {
        // 创建一个新的div元素
        floatBox = document.createElement('div');

        // 设置元素的样式
        floatBox.style.position = 'fixed';
        floatBox.style.top = '0px';
        floatBox.style.left = '0px'; // 左上角
        floatBox.style.width = '300px';
        floatBox.style.height = '100px';
        floatBox.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // 半透明黑色
        floatBox.style.color = 'white'; // 白色文字
        floatBox.style.display = 'flex';
        floatBox.style.justifyContent = 'center'; // 文字水平居中
        floatBox.style.alignItems = 'center'; // 文字垂直居中
        floatBox.style.fontSize = '18px'; // 字体大小
        floatBox.style.zIndex = '10000'; // 确保在最上层

        // 设置元素的文本内容
        floatBox.textContent = content;

        // 将新元素添加到DOM中
        document.body.appendChild(floatBox);
    }
}




chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      switch(request.cmd) {
          case 'task_status':
              // console.log('Executing command 0');
              // 这里执行命令 0 的操作
              showStatus(request.message);
              break;
          case 'command1':
              // console.log('Executing command 1');
              // 这里执行命令 1 的操作
              break;
          // 其他命令...
          case 'draw_img':
            handleDrawMsg(request.message);
            break;
          default:
              // console.log('Unknown command: ', request.cmd,request.message);
              break;
      }
  }
);

function changeDom(dom,value){
    if(dom){
      dom.value  = value;
      dom.setAttribute("aria-valuenow",value)
      // 创建并分发一个新的 'input' 事件，以模拟用户输入
      let event = new Event('input', {
        'bubbles': true,
        'cancelable': true
      });
      dom.dispatchEvent(event);
      dom.dispatchEvent(new Event('change'));
    }
}

//处理画画的命令
function handleDrawMsg(data){
  console.log(data);

  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.contentTop > div.left > div:nth-child(1) > textarea"),data.prompt)
  
  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.contentTop > div.left > div:nth-child(2) > textarea"), data.negative_prompt);

  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.content > div.content-left > div.contentItem > div:nth-child(2) > div.title.stepTitle > div.el-input-number.el-input-number--small.is-controls-right > div > input"),data.steps);

  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.content > div.content-left > div.contentItemSlider > div:nth-child(1) > div:nth-child(1) > div.title.stepTitle > div.el-input-number.el-input-number--small.is-controls-right > div > input") , data.image_width);
  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.content > div.content-left > div.contentItemSlider > div:nth-child(2) > div:nth-child(1) > div.title.stepTitle > div.el-input-number.el-input-number--small.is-controls-right > div > input") , data.image_height);
  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.content > div.content-left > div.contentItemSlider > div.cfgItem > div.title.stepTitle > div.el-input-number.el-input-number--small.is-controls-right > div > input") , data.cfg_scale);

  iframeDocument.querySelector("#pane-txt2img > div > div.contentTop > div.right > div.btnGenerate > div:nth-child(1)").click();



}