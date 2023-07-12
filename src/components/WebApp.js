import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Toast, FormControl, Button, Spinner, ListGroup, Modal, ButtonGroup, Table } from 'react-bootstrap';


function WebApp () {
  const { ipcRenderer } = window.require('electron');
 
  const [csvData, setCsvData] = useState([]); // Add this line to create a state for storing CSV data

  // 页面加载的时候，把url和openai_key从配置文件里面读取出来
  useEffect(() => {
    
  }, []);

  const getDataFile = async () => { // 获取csv数据文件

    const path = await ipcRenderer.invoke('select-data-file');
    console.log(path);
    if (path === undefined || path.indexOf(" ") !== -1) {
      alert("保存失败！文件夹名字中存在空格等特殊字符");
      return;
    }
    
    const data = await ipcRenderer.invoke('get-csv-data', path);
    console.log("Finished parsing, number of lines:", data.length);
    setCsvData(data); // Save CSV data to the state
  }

  const saveData = async () => { // 保存数据
    
    await ipcRenderer.invoke('database', 'Image.save_data', csvData);

  }


  return (
    <div>
      <Row>
        <Col>
        <ButtonGroup>
          <Button onClick={getDataFile}>导入文件数据</Button>
          <Button onClick={saveData}>写入数据</Button>
          </ButtonGroup>
        </Col>
      </Row>
      <Table striped bordered hover> {/* Use React-Bootstrap Table to display data */}
        <thead>
          <tr>
            {csvData.length > 0 && Object.keys(csvData[0]).map((key, index) => (
              <th key={index}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {csvData.map((row, rowIndex) => ( // Create a table row for each row in csvData
            <tr key={rowIndex}>
              {Object.values(row).map((cell, index) => ( // Create a table cell for each cell in the row
                <td key={index}>
                  {cell}
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
