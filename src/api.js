module.exports = function(app, db) {
    // 创建一个返回随机数的 GET /task 接口
    app.get('/task', async(req, res) => {
      // 生成一个 0 到 1 之间的随机数
      const randomNumber = Math.random();
      await db.Image.getImage(1);
  
      // 将随机数作为 JSON 响应返回
      res.json({ randomNumber });
    });
  
    // 创建一个处理 JSON 内容并返回处理成功信息的 POST /submit 接口
    app.post('/submit', (req, res) => {
      // 获取请求体中的 JSON 数据
      const data = req.body;
  
      // 在这里处理你的数据...
      console.log(data);
  
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
  