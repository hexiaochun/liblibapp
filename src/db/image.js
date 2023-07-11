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

  getImage (id) {
    return this.knex.select('*').from('image').where('id', '=', id);
  }
  
}

module.exports = Image;
