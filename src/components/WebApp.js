import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Toast, FormControl, Button, Spinner, ListGroup, Modal, ButtonGroup } from 'react-bootstrap';


function WebApp ({ countdown }) {
  const { ipcRenderer } = window.require('electron');
 
  // 页面加载的时候，把url和openai_key从配置文件里面读取出来
  useEffect(() => {
    
  }, []);



  return (
    <div>
      <Row>
        <Col>
        你好
        </Col>
      </Row>
    </div>
  );
}

export default WebApp;
