const { Worker } = require('worker_threads');
const { app, BrowserWindow ,ipcMain,dialog,shell} = require('electron');
const fs = require('fs');
const path = require('path');
const userDataPath = app.getPath('userData');
const configDirectory = path.join(userDataPath, 'liblibapp');
const express = require('express');
const expressApp = express();
const port = 3410;

const { interceptRequests } = require('./src/netIntercept.js')

const setupIpcHandlers = require('./src/ipcHandlers');

const os = require('os');

//导入数据库引用
const Database = require('./src/db/index');
//导入数据库配置
console.log(configDirectory);

// 检查目录是否存在
if (!fs.existsSync(configDirectory)) {
  // 如果目录不存在，创建它
  fs.mkdirSync(configDirectory, { recursive: true });
}

const dbPath = path.join(configDirectory, 'database_v2.sqlite');
const db = new Database(dbPath);
db.dbPath = configDirectory

// main.js
app.on('ready', () => {
    // 初始化数据库
    db.initializeTables().then(() => console.log("Tables initialized"));

    // 使用 express.json() 中间件来解析请求体中的 JSON 数据
    expressApp.use(express.json());
    // 引入我们的接口
    require('./src/api.js')(expressApp,db);
    // 服务器开始监听
    expressApp.listen(port, () => console.log(`Server is running on port ${port}`));

});


function createWindow () {
  
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      defaultEncoding: 'UTF-8',
      nodeIntegration: true, // 允许在渲染器进程中使用 Node.js 功能
      contextIsolation: false, // 需要设置为 false，以便在渲染器进程中访问 nodeIntegration
    }
  })
  // 加载 webpack 打包后的 index.html
  mainWindow.loadFile(path.join(__dirname, './dist/index.html'))

   // 设置 IPC Handlers
   setupIpcHandlers(db, mainWindow);
   // 创建 Workers
   
    
  
}


app.whenReady().then(() => {
  createWindow()
  // 创建一个新的窗口用于打开www.liblibai.com
  // createLibWindow()
})

function createLibWindow(url) {
  // 创建新的窗口用于打开www.liblibai.com
  const libWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      defaultEncoding: 'UTF-8',
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  // 加载 www.liblibai.com 网站
  libWindow.loadURL(url)
  // 添加网络拦截代码，并传入 libWindow 实例
  interceptRequests(libWindow, db);
  // 当网页加载完成时执行 JavaScript 代码
  ipcMain.on('intercept-navigation', (event, url) => {
    // 在主进程中拦截到导航请求，重新加载 URL
    libWindow.loadURL(url);
  });

}


// 每次需要打开新窗口时，调用 createLibWindow()
ipcMain.on('open-new-window', (event, url) => {
  createLibWindow(url)
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


ipcMain.on('restart_app', () => {
  
});