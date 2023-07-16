// netIntercept.js
const { session } = require('electron')

function interceptRequests(window, db) {

  
      window.on('close', () => {
        if (global.intervalId) {
            clearInterval(global.intervalId);
        }
    });

  session.defaultSession.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (details, callback) => {
    console.log(details.url)  // 打印出每一个请求的URL

    if (details.url.indexOf('www.liblibai.com/editor/#?id=') > 0) {
      // 执行特定的 JavaScript 代码
      window.webContents.executeJavaScript(`
        // 你的 JavaScript 代码，例如
        console.log("Intercepted a specific request");
      `);
      
      // 如果定时器已经存在，清除它
      if (global.intervalId) {
        clearInterval(global.intervalId);
      }

      // 设置新的定时器
      global.intervalId = setInterval(() => {
        window.webContents.executeJavaScript(`
          // 你的 JavaScript 代码，例如
          console.log("This is executed every 30 seconds");
          
        `);
      }, 10000); // 30000 毫秒等于 30 秒
    }

    
    
    callback({cancel: false}) // 继续请求
  })
}

module.exports = { interceptRequests }
