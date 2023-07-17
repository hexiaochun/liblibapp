import React, { useState, useEffect } from 'react';
const electron = window.require('electron');
import { Container,Row, Col, Toast, FormControl, Button, Spinner, ListGroup, Modal, ButtonGroup, Table } from 'react-bootstrap';


function WebApp () {
  const { ipcRenderer } = window.require('electron');
  
  const [csvData, setCsvData] = useState([]); // Add this line to create a state for storing CSV data
  const [update_task_time,setTaskTime] = useState('');

  // 页面加载的时候，把url和openai_key从配置文件里面读取出来
  useEffect(() => {
    getAllImage();

    ipcRenderer.on('database-updated', (event, someData) => {
      // 在这里根据 `someData` 更新你的界面
      console.log('获取到数据更新');
      getAllImage();
    });


  }, []);

  const openText = async() =>{
    await ipcRenderer.invoke('open-url','https://snvazev2ds.feishu.cn/docx/MlKrdrjJfoRey0xun33chtoOnye');
  }
  const getDataFile = async () => { // 获取csv数据文件

    const path = await ipcRenderer.invoke('select-data-file');
    console.log(path);
    if (path === undefined ) {
      alert("保存失败！文件夹名字中存在空格等特殊字符");
      return;
    }
    
    const data = await ipcRenderer.invoke('get-csv-data', path);
    console.log("Finished parsing, number of lines:", data.length);
    // setCsvData(data); // Save CSV data to the state

    await ipcRenderer.invoke('database', 'Image.save_data', data);

    alert("数据导入成功");
    getAllImage();
  }

  const getAllImage = async () =>{
    let time =  await ipcRenderer.invoke('database','Config.get_task_time');
    setTaskTime(time);
    let images =  await ipcRenderer.invoke('database', 'Image.getAllImage');
    setCsvData(images);
    
  }

  //情况数据
  const clearData = async()=>{
    await ipcRenderer.invoke('database', 'Image.clear_data');
    alert("清空成功");
    getAllImage();
  }

  const saveImagePath = async () => { // New function to handle saving image path

    const path = await ipcRenderer.invoke('select-file');
    console.log(path);
    if (path === undefined || path.indexOf(" ") !== -1) {
      alert("保存失败！文件夹名字中存在空格等特殊字符");
      return;
    }
    
    await ipcRenderer.invoke('database', 'Config.save_image_path', path);
    
    alert("图片路径已保存！");

  }

  const exportPrompt = async () => {
    ipcRenderer.invoke('database', 'Config.get_image_path').then(async (res) => {
      await ipcRenderer.invoke('export-prompt', csvData,res);
      alert('导出成功')
    });
  }

  const openLiblib = async() =>{
    ipcRenderer.send('open-new-window', 'https://www.liblibai.com/')
  }

  const openLiblibDraw = async() =>{
    ipcRenderer.send('open-new-window', 'https://www.liblibai.com/sd')
  }

  const setDraw = async(id) =>{
      console.log(id);
      await ipcRenderer.invoke('database', 'Image.updateImage',id,{status : 0 });
      getAllImage();
  }

  const openFolder = () => {

    ipcRenderer.invoke('database', 'Config.get_image_path').then(async (res) => {
      if(res == ""){
        alert("请先设置图片路径");
        return
      }
      electron.shell.openPath(res);

    });

  }
  const beiginTask = async()=>{
    await ipcRenderer.invoke('database', 'Image.beginTask');
    alert("已经开始");
  }
  const endTask = async()=>{
    await ipcRenderer.invoke('database', 'Image.endTask');
    alert("已经结束");
  }

  
  const fields = [
    { id: 'id', name: '编号' },
    { id: 'image_url', name: '图片' },
    { id: 'status', name: '状态' },
    { id: 'cfg_scale', name: '相关性' },
    { id: 'steps', name: '迭代' },
    { id: 'image_height', name: '高度' },
    { id: 'image_width', name: '宽度' },
    { id: 'text_content', name: '内容' },
    { id: 'prompt', name: '提示' },
    { id: 'negative_prompt', name: '负提示' },
    { id: 'sampler_name', name: '采样器' },
  ];
  
  return (
    <div>
      <Row>
        <Col xl='10'>
        <ButtonGroup>
          <Button variant='success' onClick={openText}>使用教程</Button>
          <Button variant='secondary' onClick={openLiblib}>先登录liblibAI</Button>
          <Button variant='success'  onClick={getDataFile}>导入文件数据</Button>
          <Button onClick={saveImagePath}>设置图片路径</Button>
          <Button variant='success' onClick={openFolder}>打开图片路径</Button>
          <Button onClick={beiginTask}>开始下发</Button>
          <Button variant='success'  onClick={openLiblibDraw}>打开绘画liblibAI</Button>
          <Button variant="secondary" onClick={endTask}>暂停下发</Button>
          <Button variant="danger" onClick={clearData}>清空内容</Button>
          <Button variant="success" onClick={exportPrompt}>导出数据</Button>
        </ButtonGroup>
        </Col>
        <Col xl='2'>
          <Row>插件最近更新时间： {update_task_time}</Row>
        </Col>
      </Row>
      <Table striped bordered hover>
        <thead>
          <tr>
          <th >操作</th>
            {fields.map((field, index) => (
              <th key={index}>{field.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {csvData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>
                <Button onClick={()=>{ setDraw(row.id)}}>绘画</Button>
              </td>
              {fields.map((field, index) => (
                <td key={index}>
                  {field.id === 'image_url' && row[field.id]
                    ? <img src={`file://${row[field.id]}?${new Date().getTime()}`} alt="" style={{ width: '200px', height: '100%' }} />
                    : field.id === 'status'
                      ? row[field.id] === "-1"
                        ? '未提交'
                        : row[field.id] === "0"
                          ? '等待'
                          : row[field.id] === "1"
                            ? '下发'
                            : row[field.id] === "2"
                              ? '完成'
                              : ''
                      : row[field.id]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
  
  
}

export default WebApp;
