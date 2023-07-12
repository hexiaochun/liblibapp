let paintingFinished = false;
let timer;
let current_info = null;

async function getTaskInfoAndSendMessage() {
  try {
    const response = await fetch('http://127.0.0.1:3410/task');
    const data = await response.json();
    
    if (data.info.length == 0) {
      console.log('Task info is missing. Retrying in 1 minute...');
      timer = setTimeout(getTaskInfoAndSendMessage, 1000 * 60); // retry after 1 minute
      return;
    }
    current_info = data.info[0];
    sendMessageToActiveTab('draw_img', current_info);
    console.log('Message sent: ', current_info);

    // 设置一个状态等待绘画完成的监控
    paintingFinished = false;
    timer = setTimeout(checkPaintingStatus, 1000 * 60 * 4); // 4 minutes
  } catch (error) {
    console.error('Failed to get task info: ', error);
  }
  timer = setTimeout(getTaskInfoAndSendMessage, 1000 * 60); // retry after 1 minute
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
timer = setTimeout(getTaskInfoAndSendMessage, 1000 * 60); // retry after 1 minute
