import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Offcanvas, Nav, Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Book, Gear, House, Images, InfoCircle } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import WebApp from './components/WebApp';

import './css/index.css';


function App () {
  // console.log('App 组件渲染');
  
  const { ipcRenderer } = window.require('electron');
  

  ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    // 这里可以提示用户有新的更新可用
  });

  ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    // 这里可以提示用户更新已经下载完成，询问他们是否需要重启应用来应用更新
    ipcRenderer.send('restart_app');
  });



  useEffect(() => {
    // console.log('组件已挂载或更新');

    return () => {
      // console.log('组件将要卸载');
      
    }
  }, []);
  
  return (
    <div fluid id="main" className="h-100">
      <div className='mine-content'>
      <WebApp  />
      </div>
    </div>
  );
}

// 使用 createRoot 方法来替代原有的 render 方法
createRoot(document.getElementById('root')).render(<App />);
