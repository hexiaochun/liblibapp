const { ipcMain,app,shell } = require('electron');
const fs = require('fs');
const path = require('path');
const dialog = require('electron').dialog;
const Papa = require('papaparse');

module.exports = function(db, mainWindow) {
    ipcMain.handle('rebuild_db', () => {
        
        return true;
    });

    ipcMain.handle('open-url', (event, url) => {
        shell.openExternal(url);
    });

    ipcMain.handle('join-path', (event,base_path,dis_path) => {
        dis_path = dis_path+"";
        console.log(base_path,dis_path);
        return path.join(base_path,dis_path);
    });

    ipcMain.handle('database', async (event, operation, ...args) => {
        const [tableName, methodName] = operation.split('.');
        const result = await db[tableName][methodName](...args);
        return result;
    });

    ipcMain.handle('get-app-version', () => {
        return app.getVersion();
    })

    ipcMain.handle('open-db-path', async () => {
        //这里添加一个打开文件夹的功能electron.shell.openPath
        shell.openPath(db.dbPath);
    })


    ipcMain.handle('select-data-file', async (event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Files', extensions: ['csv'] }
            ]
        });
    
        if (!result.canceled && result.filePaths.length > 0) {
            const originalPath = result.filePaths[0];
            return originalPath;
        }
    });

    ipcMain.handle('get-csv-data', async (event, path) => {
        const csvData = fs.readFileSync(path, 'utf8');
        const results = Papa.parse(csvData, {
            delimiter: ",",
            header: false,
            dynamicTyping: true,
        });
      
        return results.data;
      });


    ipcMain.handle('select-image-file', async (event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Images', extensions: ['jpg', 'png', 'gif', 'bmp', 'jpeg'] }
            ]
        });
    
        if (!result.canceled && result.filePaths.length > 0) {
            const originalPath = result.filePaths[0];
            const fileName = path.basename(originalPath);
            
            let destinationDir =await db.Config.getValueByName('image_path');
            console.log(destinationDir);
            destinationDir = destinationDir + '/role_img'
            if (!fs.existsSync(destinationDir)) {
                fs.mkdirSync(destinationDir);
            }

            const destinationPath = path.join(destinationDir, fileName);
    
            fs.copyFileSync(originalPath, destinationPath);
    
            return destinationPath;
        }
    });

    ipcMain.handle('export-prompt', async(event, imageData,open_path) => {
        const prompts = imageData.map(data => `"${data.id}","${data.text_content}","${data.prompt}","${data.negative_prompt}","${data.image_width}","${data.image_height}","${data.sampler_name}","${data.steps}","${data.cfg_scale}","${data.image_url}"`).join(',\n');
        console.log('导出',open_path+'/output.csv');  
        // 将字符串写入txt文档
        fs.writeFile(open_path+'/output.csv', prompts, 'utf8', (err) => {
          if (err) {
            console.log('写入文件时发生错误：', err);
          } else {
            console.log('成功将prompt字段导出到txt文档！');
          }
        });
      })
    

    ipcMain.handle('select-file', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });

        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
    })
}
