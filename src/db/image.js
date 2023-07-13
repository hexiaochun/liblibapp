const moment = require('moment');

class Image {
  constructor(knex) {
    this.knex = knex;
  }

  insertImage (image) {
    image.inserted_at = moment().format('YYYY-MM-DD HH:mm:ss');
    return this.knex('image').insert(image);
  }

  updateImage (id, image) {
    image.inserted_at = moment().format('YYYY-MM-DD HH:mm:ss');
    return this.knex('image').where('id', '=', id).update(image);
  }

  deleteImage (id) {
    return this.knex('image').where('id', '=', id).del();
  }
  clear_data(){
    return this.knex('image').del();
  }
  
  getTask () {
    return this.knex.select('*').from('image').where('status', '=', '0').limit(1)
      .then((result) => {
        if (result.length === 0) {
          return this.knex.select('*').from('image').where('status', '=', '1').limit(1);
        }
        else {
          // 在此处，我们需要更新检索到的数据的状态
          // 假设我们的数据包含一个唯一标识符，例如'id'
          // 您需要根据您的数据结构进行更改
          const idToUpdate = result[0].id;

          return this.knex('image')
            .where('id', '=', idToUpdate)
            .update({
              'status': '1'
            })
            .then(() => {
              // 这里我们返回已更新的数据
              // 您可能希望在此处包含更多的字段，取决于您需要的信息
              return this.knex.select('*').from('image').where('id', '=', idToUpdate).limit(1);
            });
        }
      });
  }


  getImage (id) {
    return this.knex.select('*').from('image').where('id', '=', id);
  }

  beginTask() {
    return this.knex('image').update({ status: 0 });
  }
  
  endTask() {
    return this.knex('image').whereIn('status', [0, 1]).update({ status: -1 });
  }

  getAllImage(){
    return this.knex.select('*').from('image');
  }

  async saveToDatabase(dataObjects) {
    for (let data of dataObjects) {
      // 检查对象的所有属性值是否都不为空
      if (Object.values(data).every(value => value !== null && value !== '')) {
        // 如果所有属性值都不为空，则将对象插入到数据库中
        await this.insertImage(data);
      }
    }
  }


  async save_data(data) {
    let keys = ["book_id",  "text_content", "prompt", "negative_prompt", "image_width","image_height",  "sampler_name", "steps","cfg_scale"];
  
    let dataObjects = [];
    for(let i = 0; i<data.length; i++){
      console.log(data[i]);
      let tmp = {};
      
      for(let j = 0; j<keys.length; j++){
        tmp[keys[j]] = data[i][j]; // use values instead of keys
      }
      
      // console.log(tmp);
      dataObjects.push(tmp);
      
    }
    // console.log(dataObjects);
    this.saveToDatabase(dataObjects);
  }
}  

module.exports = Image;
