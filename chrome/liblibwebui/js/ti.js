document.addEventListener("DOMContentLoaded", function () {
  main_fun();
});

let iframe = null;
let iframeDocument = null ;

function main_fun() {
  if(iframeDocument != null) {
      return;
  }

  iframe = document.querySelector('#iframe');

  if(iframe != null) {
      iframe.addEventListener('load', () => {
          console.log("frame init--------------------- ");
          iframeDocument = iframe.contentDocument;
      });
  }

  // 如果 iframeDocument 仍然为 null，说明 iframe 还没有加载完成，所以我们需要再次调用 main_fun
  if(iframeDocument == null) {
      setTimeout(main_fun, 10);
  }
}



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      switch(request.cmd) {
          case 'command0':
              // console.log('Executing command 0');
              // 这里执行命令 0 的操作
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