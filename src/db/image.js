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
  
  getTask () {
    return this.knex.select('*').from('image').where('status', '=', '0').limit(2)
      .then((result) => {
        if (result.length === 0) {
          return this.knex.select('*').from('image').where('status', '=', '1').limit(2);
        }
        return result;
      });
  }

  getImage (id) {
    return this.knex.select('*').from('image').where('id', '=', id);
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
    let keys = ["book_id", "cfg_scale", "steps", "image_height","image_width", "text_content", "prompt", "negative_prompt", "sampler_name"];
  
    let dataObjects = [];
    for(let i = 0; i<data.length; i++){
      console.log(data[i]);
      let tmp = {};
      let dataValues = Object.values(data[i]); // get values of the data object
      for(let j = 0; j<keys.length; j++){
        tmp[keys[j]] = dataValues[j]; // use values instead of keys
      }
      
      console.log(tmp);
      dataObjects.push(tmp);
      
    }
    // console.log(dataObjects);
    this.saveToDatabase(dataObjects);
  }
}  

module.exports = Image;
