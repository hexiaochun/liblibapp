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

  getImageById (id) {
    return this.knex.select('*').from('image').where('book_info_id', '=', id);
  }

  //开始制作视频
  async beginVideo (book_id) {
    console.log(book_id, 'book_id');
    await this.knex('image').where('book_id', '=', book_id).andWhere('mp4_status', '=', -1).update({
      mp4_status: 0
    });
    await this.knex('book').where('id', '=', book_id).update({
      mp4_status: 0
    });
  }

  //重置所有视频
  async beginResetVideo (book_id) {
    await this.knex('image').where('book_id', '=', book_id).update({
      mp4_status: 0
    });
    await this.knex('book').where('id', '=', book_id).update({
      mp4_status: 0
    });
  }



  //执行剩下的任务
  async beiginTask (id) {
    await this.knex('image')
      .where('status', '=', -1).andWhere('book_id', '=', id)
      .update({
        status: 0
      });



  }
  //批量执行MP3任务
  async resetMp3Task (id) {
    await this.knex('image')
      .where('book_id', '=', id)
      .update({
        mp3_status: 0
      });
    
  }

   //批量执行MP3任务
   async beiginMp3Task (id) {
    await this.knex('image')
      .where('book_id', '=', id)
      .andWhere('mp3_status','=','-1')
      .update({
        mp3_status: 0
      });
    
  }


  //重置状态包含已经绘好的
  async beiginResetTask (id) {

    await this.knex('image')
      .where('book_id', '=', id)
      .update({
        status: 0
      });

    // await this.knex('image')
    //   .where('book_id', '=', id)
    //   .update({
    //     mp3_status: 0
    //   });
    // await this.knex('book').where('id', '=', id).update({
    //   mp3_status: 0
    // });

  }

  //获取gpt的任务
  async getImageGptTask () {
    // Check split_status in 'book' table
    const checkSplitStatus = await this.knex('book').where('split_status', '!=', '2').first();

    // If there is a book with split_status not equal to 2, return empty array
    if (checkSplitStatus) {
      return [];
    }

    // Fetch from 'image' table where gpt_status equals 0
    let result = await this.knex.select('*').from('image').where('gpt_status', '=', '0').limit(2);

    // If no results, fetch from 'image' table where gpt_status equals 1
    if (result.length === 0) {
      result = await this.knex.select('*').from('image').where('gpt_status', '=', '1').limit(2);
    }

    return result;
  }
  // 写一个方法，通过book_id获取image，计算mp3_duration的总和
  async getSumMp3Duration (book_id) {
    const result = await this.knex.select('*').from('image').where('book_id', '=', book_id);
    let sum = 0;
    let len = result.length;
    for (let i = 0; i < result.length; i++) {
      sum += result[i].mp3_duration;
    }

    return {
      sum,
      len
    };
  }

  //写一个方法，通过book_id获取image，把mp3_duration都减去一个传入的值
  async updateMp3Duration (book_id, value) {
    const result = await this.knex.select('*').from('image').where('book_id', '=', book_id);
    for (let i = 0; i < result.length; i++) {
      await this.knex('image').where('id', '=', result[i].id).update({
        mp3_duration: result[i].mp3_duration - value
      });
    }
  }

  //通过book_id获取image，检测mp3_status 是否都等于2，是就返回true
  async checkMp3Status (book_id) {
    const result = await this.knex.select('*').from('image').where('book_id', '=', book_id);
    for (let i = 0; i < result.length; i++) {
      if (result[i].mp3_status !== '2') {
        return 0;
      }
    }
    return 1;
  }


  //通过book_id获取image，检测mp3_status 是否都等于2，是就返回true
  async checkMp4Status (book_id) {
    const result = await this.knex.select('*').from('image').where('book_id', '=', book_id);
    for (let i = 0; i < result.length; i++) {
      if (result[i].mp4_status !== '2') {
        return 0;
      }
    }
    return 1;
  }



  //获取语音的任务
  getVideoTask () {
    return this.knex.select('*').from('image').where('mp4_status', '=', '0').andWhere('mp3_status', '=', '2').andWhere('status', '=', '2').limit(2)
      .then((result) => {
        if (result.length === 0) {
          return this.knex.select('*').from('image').where('mp4_status', '=', '1').andWhere('status', '=', '2').andWhere('mp3_status', '=', '2').limit(2);
        }
        return result;
      });
  }


  //获取语音的任务
  getPyTask () {
    return this.knex.select('*').from('image').where('mp3_status', '=', '0').limit(2)
      .then((result) => {
        if (result.length === 0) {
          return this.knex.select('*').from('image').where('mp3_status', '=', '1').limit(2);
        }
        return result;
      });
  }

  getImageByBookId (id) {
    return this.knex.select('*').from('image').where('book_id', '=', id).orderBy('id');
  }

  
  getImageByBookInfo (id) {
    return this.knex.select('*').from('image').where('book_id', '=', id).orderBy('id')
        .then(records =>
            Promise.all(records.map(record =>
                this.knex.select('image_url').from('batches_images').where('image_id', '=', record.id)
                    .then(images => {
                        let urls = images.map(image => image.image_url);
                        if (urls.length > 0) {
                            return { ...record, images: urls };
                        } else if (record.image_url) {
                            return { ...record, images: [record.image_url] };
                        } else {
                            return { ...record, images: [] };
                        }
                    })
            ))
        );
  }



  getImageDrawTask (cnt) {
    return this.knex.select('*').from('image')
      .where({ status: '0', gpt_status: '2' })
      .limit(cnt)
      .then((result) => {
        if (result.length === 0) {
          return this.knex.select('*').from('image')
            .where({ status: '1', gpt_status: '2' })
            .limit(cnt);
        }
        return result;
      });
  }

  //一上一下模式
  async updateU2DAnimation (book_id) {
    const images = await this.knex('image').where({ book_id: book_id });
  
    const queries = images.map((image, index) =>
      this.knex('image')
        .where({ id: image.id })
        .update({
          animation: index % 2 === 0 ? 3 : 4,
        })
    );
  
    return Promise.all(queries);
  }


  //一左一右模式
  async updateL2RAnimation (book_id) {
    const images = await this.knex('image').where({ book_id: book_id });
  
    const queries = images.map((image, index) =>
      this.knex('image')
        .where({ id: image.id })
        .update({
          animation: index % 2 === 0 ? 2 : 1,
        })
    );
  
    return Promise.all(queries);
  }

  //随机所有动画
  async updateRadAnimation (book_id) {
    const images = await this.knex('image').where({ book_id: book_id });

    const queries = images.map((image) =>
      this.knex('image')
        .where({ id: image.id })
        .update({
          animation: Math.floor(Math.random() * 6) + 1,
        })
    );

    return Promise.all(queries);
  }

  //更新动画
  updateCopyAnimation (book_id, ani_id) {

    return this.knex('image')
      .where({ book_id: book_id })
      .update({
        animation: ani_id
      });

  }
  //批量更新配音
  updatePeiYin (book_id, info) {
    return this.knex('image')
      .where({ book_id: book_id })
      .update(info);
  }

  getImages () {
    return this.knex.select('*').from('image');
  }
  getImageCountByBookIdAndStatus (id) {
    return this.knex.transaction(async trx => {

      const imageCount = await trx('image').where('book_id', id).andWhere(function () {
        this.where('status', '<>', 2).orWhere('mp3_status', '<>', 2)
      }).count('* as count');
      return imageCount[0].count > 0 ? 0 : 1;
    });
  }


  getImageCountByBookIdStatus (id) {
    return this.knex('image')
      .where({ book_id: id })
      .andWhere(function () {
        this.where('status', 0).orWhere('status', 1)
      })
      .count('* as count')
      .then(result => result[0].count);
  }

  getImageCountByBookIdAndGptStatus (id) {
    return this.knex('image')
      .where({ book_id: id })
      .andWhere(function () {
        this.where('gpt_status', 0).orWhere('gpt_status', 1)
      })
      .count('* as count')
      .then(result => result[0].count);
  }

  getImageCountByBookIdAndMp3Status (id) {
    return this.knex('image')
      .where({ book_id: id })
      .andWhere(function () {
        this.where('mp3_status', 0).orWhere('mp3_status', 1)
      })
      .count('* as count')
      .then(result => result[0].count);
  }
  async checkAnyCountGreaterThanZero (id) {
    const [countStatus, countGptStatus, countMp3Status] = await Promise.all([
      this.getImageCountByBookIdStatus(id),
      this.getImageCountByBookIdAndGptStatus(id),
      this.getImageCountByBookIdAndMp3Status(id)
    ]);

    return countStatus > 0 || countGptStatus > 0 || countMp3Status > 0;
  }
  // 添加新数据
  addPeiYin (info) {
    return this.knex('image')
      .insert(info);
  }

  async updatePause (book_id) {

    Promise.all([
      this.pauseMp3(book_id),
      this.pauseMp4(book_id),
      this.pauseDraw(book_id)
    ]);

  }
  pauseMp3 (book_id) {
    return this.knex('image')
      .where({ book_id: book_id })
      .andWhere(function () {
        this.orWhere('mp3_status', 0)
        this.orWhere('mp3_status', 1)
      }
        )
      .update({
        mp3_status: -1,
      });
  }
  pauseMp4 (book_id) {
    return this.knex('image')
      .where({ book_id: book_id })
      .andWhere(function () {
        this.orWhere('mp4_status', 0)
        this.orWhere('mp4_status', 1)
      })
      .update({
        mp4_status: -1,
      });
  }
  pauseDraw (book_id) {
    return this.knex('image')
      .where({ book_id: book_id })
      .andWhere(function () {
        this.orWhere('status', 0)
        this.orWhere('status', 1)
      })
      .update({
        status: -1
      });
  }
}

module.exports = Image;
