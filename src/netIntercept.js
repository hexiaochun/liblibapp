const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { session,BrowserWindow } = require('electron')


function executeExternalJavaScript(window, filePath, args) {
    // 读取外部JavaScript文件
    let jsCode = fs.readFileSync(path.join(__dirname, filePath), 'utf8');

    // 使用JSON.stringify来处理参数，以防止XSS攻击
    let argsString = JSON.stringify(args);

    // 将参数插入到JavaScript代码中
    jsCode = jsCode.replace('/* ARGS_PLACEHOLDER */', argsString);

    // 使用Electron的executeJavaScript来执行JavaScript代码
    window.webContents.executeJavaScript(jsCode);
}


function interceptRequests(window, db) {

  
      window.on('close', () => {
        if (global.intervalId) {
            clearInterval(global.intervalId);
        }
    });

  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ['<all_urls>'] }, (details, callback) => {
    console.log(details.url)  // 打印出每一个请求的URL

    if (details.url.indexOf('www.liblibai.com/editor/#?id=') > 0) {
      // 如果定时器已经存在，清除它
      if (global.intervalId) {
        clearInterval(global.intervalId);
      }
      // 设置新的定时器
      global.intervalId = setInterval(()=>handleTask(window,db), 30000); // 30000 毫秒等于 30 秒
    }

    if(details.url.indexOf('liblibai-tmp-image.liblibai.com')>0){
        global.paintingFinished = true;
        handleImage(details,window,db);
    }

    
    
    callback({cancel: false}) // 继续请求
  })
}


async function handleImage(details, window, db) {
    // console.log(details);
    let image_url = details.url;
    let headers = details.requestHeaders;
    let save_path = await db.Config.get_image_path()
    // 使用 node-fetch 下载图片
    fetch(image_url, { headers })
        .then(res => {

            let image_path = path.join(save_path, `${global.current_info.id}`+'_'+Math.floor(Date.now() / 1000)+'.png');
            const dest = fs.createWriteStream(image_path);
            res.body.pipe(dest);
            dest.on('finish', async () => {
                console.log('Image downloaded and saved!',global.current_info.id);
                await db.Image.updateImage(global.current_info.id, { image_url: image_path, status: 2 });
            });

            BrowserWindow.getAllWindows().forEach(win => {
                win.webContents.send('database-updated');
              });

        })
        .catch(err => console.error(err));

    global.intervalId = setInterval(() => handleTask(window, db), 3000); // 30000 毫秒等于 30 秒

    
}



//发送作图的脚本
async function handleTask(window,db){
    clearInterval(global.intervalId);
    global.paintingFinished = false; 
    console.log('task start');
    // window.webContents.executeJavaScript(`
    //     console.log("Intercepted a specific request");
    // `);
    let info = await db.Image.getTask();
    if(info.length == 0 ){
        console.log("没有任务等待30秒");
        global.intervalId = setInterval(() => handleTask(window, db), 30000); // 30000 毫秒等于 30 秒
        return;
    }
    global.current_info = info[0]

    executeExternalJavaScript(window, './webjs/draw.js', global.current_info);

    await db.Image.updateImage(global.current_info.id, {  status: 1 });
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('database-updated');
      });

}




module.exports = { interceptRequests }
