let paintingFinished = false;
let timer;
let current_info = null;

async function getTaskInfoAndSendMessage() {
  clearTimeout(timer);
  try {
    sendMessageWithTime("开始检测任务");
    const response = await fetch('http://127.0.0.1:3410/task');
    const data = await response.json();
    
    if (data.info.length == 0) {
      console.log('Task info is missing. Retrying in 1 minute...');
      sendMessageWithTime("没有任务等待30秒");
      timer = setTimeout(getTaskInfoAndSendMessage, 1000 * 30); // retry after 1 minute
      return;
    }
    sendMessageWithTime("获取到任务，开始执行ID："+data.info[0].id);
    current_info = data.info[0];
    sendMessageToActiveTab('draw_img', current_info);
    console.log('Message sent: ', current_info);

    // 设置一个状态等待绘画完成的监控
    paintingFinished = false;
    timer = setTimeout(checkPaintingStatus, 1000 * 60 * 4); // 4 minutes
    return;
  } catch (error) {
    sendMessageWithTime("获取出错，30秒后重试");
    console.error('Failed to get task info: ', error);
  }
  timer = setTimeout(getTaskInfoAndSendMessage, 1000 * 30); // retry after 1 minute
}

function sendMessageWithTime( messageContent) {
  let messageType = "task_status"
  var date = new Date();
  var currentTime = date.toLocaleTimeString();
  var fullMessage = currentTime + ": " + messageContent;

  // 使用浏览器提供的接口发送消息到当前活动的标签页
  // 这里假设 `sendMessageToActiveTab` 是浏览器提供的函数用于发送消息
  // 具体的调用方式可能会因浏览器或者环境的不同而有所不同
  sendMessageToActiveTab(messageType, fullMessage);
}




function sendMessageToActiveTab(cmd, message) {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, { cmd: cmd, message: message });
    });
  });
}

function checkPaintingStatus() {
  if (!paintingFinished) {
    console.log('Painting not finished in 4 minutes. Requesting new task info...');
    getTaskInfoAndSendMessage();
  }
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    if(details.url.indexOf('liblibai-tmp-image.liblibai.com')>0){
      console.log('Painting finished');
      paintingFinished = true;
      clearTimeout(timer);
      
      let headers = {};
      for (let header of details.requestHeaders) {
          headers[header.name] = header.value;
      }
      console.log(details);

    postData('http://127.0.0.1:3410/submit', {book_data:current_info,image:details})
      .then((data) => {
        console.log(data); // JSON 来自 `response.json()` 的数据
        timer = setTimeout(getTaskInfoAndSendMessage, 1000 * 5); // retry after 1 minute
      })
      .catch((error) => {
        console.error('Error:', error);
    });


    }
  },
  {urls: ["<all_urls>"]},
  ["requestHeaders", "extraHeaders"]
);


async function postData(url = '', data = {}) {
  // 默认的 options 是指示 fetch 发送 POST 请求的参数
  const response = await fetch(url, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) // body 数据类型必须与 "Content-Type" 头相匹配
  });
  
  return response.json(); // 解析并返回 JSON 响应数据
}



// 请求任务信息并发送消息
timer = setTimeout(getTaskInfoAndSendMessage, 1000 * 30); // retry after 1 minute
