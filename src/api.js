const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');



module.exports = function(app, db) {
    // 创建一个返回随机数的 GET /task 接口
    app.get('/task', async(req, res) => {
      // 生成一个 0 到 1 之间的随机数
      const randomNumber = Math.random();
      let info =  await db.Image.getTask();
  
      // 将随机数作为 JSON 响应返回
      res.json({ code:0,info:info });
    });
  
    app.post('/submit', (req, res) => {
        // 获取请求体中的 JSON 数据
        const data = req.body;
      
        // 在这里处理你的数据...
        console.log(data);
      
        let book_info = data.book_data;
        let id = data.book_data.id;
        
        let image_url = data.image.url;
        let headers = {};
        for (let header of data.image.requestHeaders) {
            headers[header.name.toLowerCase()] = header.value;
        }
        
        // 使用 node-fetch 下载图片
        fetch(image_url, { headers })
          .then(res => {
            let image_path = path.join(__dirname, `${id}.jpg`);
            const dest = fs.createWriteStream(image_path);
            res.body.pipe(dest);
            dest.on('finish', async() => {
              console.log('Image downloaded and saved!');
              await db.Image.updateImage(id,{image_url:image_path,status:2});
            });
          })
          .catch(err => console.error(err));
      
        // 响应处理成功的消息
        res.json({ message: 'Processing Successful' });
      });
  
    // 创建一个从 image 表中查询所有数据的 GET /images 接口
    app.get('/images', async (req, res) => {
      const rows = await db.getImages();
      // 将查询结果作为 JSON 响应返回
      res.json(rows);
    });
  };
  