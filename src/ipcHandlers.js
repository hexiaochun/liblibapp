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

    ipcMain.handle('select-file', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });

        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
    })
}
