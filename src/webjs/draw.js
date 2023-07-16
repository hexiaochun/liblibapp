

function initdata(args) {
    console.log('This is executed from an external script.');
    console.log('Received arguments:', args);

    initWeb(args);

}


//填写网页数据
function initWeb(data){

    let iframeDocument = document.querySelector('#iframe').contentDocument;
  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.contentTop > div.left > div:nth-child(1) > textarea"),data.prompt)
  
  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.contentTop > div.left > div:nth-child(2) > textarea"), data.negative_prompt);

  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.content > div.content-left > div.contentItem > div:nth-child(2) > div.title.stepTitle > div.el-input-number.el-input-number--small.is-controls-right > div > input"),data.steps);

  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.content > div.content-left > div.contentItemSlider > div:nth-child(1) > div:nth-child(1) > div.title.stepTitle > div.el-input-number.el-input-number--small.is-controls-right > div > input") , data.image_width);
  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.content > div.content-left > div.contentItemSlider > div:nth-child(2) > div:nth-child(1) > div.title.stepTitle > div.el-input-number.el-input-number--small.is-controls-right > div > input") , data.image_height);
  changeDom(iframeDocument.querySelector("#pane-txt2img > div > div.content > div.content-left > div.contentItemSlider > div.cfgItem > div.title.stepTitle > div.el-input-number.el-input-number--small.is-controls-right > div > input") , data.cfg_scale);

  iframeDocument.querySelector("#pane-txt2img > div > div.contentTop > div.right > div.btnGenerate > div:nth-child(1)").click();


}


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

// ARGS_PLACEHOLDER 是参数的占位符，将会在executeExternalJavaScript函数中被替换
initdata(/* ARGS_PLACEHOLDER */);
