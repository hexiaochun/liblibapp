## 安装
npm install electron --save-dev
npm install --save react react-dom
npm install --save-dev nodemon
npm install react-bootstrap
npm install electron-store


npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader webpack webpack-cli html-webpack-plugin

npm install --save-dev css-loader style-loader

#增加数据库
npm install sqlite3 --save
npm install knex --save

## 添加langchain
npm install -S langchain

## 添加路径选择
npm install @electron/remote
npm install path-browserify


## 打包
npm install electron-packager --save-dev

npm install electron-builder --save-dev

## mac 打包
npx electron-builder

## win打包
npx electron-builder --windows

##  运行

npm install

npm run build

npm run start

## 开发
npm run watch


## 包损坏执行命令
sudo xattr -d com.apple.quarantine /Applications/text2video.app
