
const Config = require('./config');
const Image = require('./image');
const knex = require('knex');
const moment = require('moment');

class Database {
    constructor(dbFilePath) {
        this.knex = knex({
            client: 'sqlite3',
            connection: {
                filename: dbFilePath
            },
            useNullAsDefault: true
        });

        this.Config = new Config(this.knex);
        this.Image = new Image(this.knex);
        
    }

    // 初始化数据库表
    initializeTables() {
        return Promise.all([
            
           
            this.knex.schema.hasTable('image').then((exists) => {
                if (!exists) {
                    return this.knex.schema.createTable('image', (table)  => {
                        table.increments('id').primary();
                        table.string('image_url');
                        table.integer('book_id').references('id').inTable('book');
                        table.integer('book_info_id').references('id').inTable('book_info');
                        table.string('status').defaultTo('-1');
                        table.string('gpt_status').defaultTo('0');
                        table.string('mp3_status').defaultTo('-1');
                        table.string('mp4_status').defaultTo('-1');//0 为生成 1 为生成中 2 为生成完成  字符串类型
                        table.string('mp4_url');//保存文件

                        table.timestamp('inserted_at').defaultTo(moment().format('YYYY-MM-DD HH:mm:ss'));
                        table.string('text_content');//分镜内容
                        table.string('prompt');
                        table.string('cn_prompt');  //带中文的提词
                        table.string('negative_prompt');
                        table.integer('image_width').defaultTo('1024');
                        table.integer('image_height').defaultTo('576');

                        // 模型
                        table.string('big_model');
                        // 是否开启高清修复
                        table.integer('enable_hr').defaultTo(0);
                        // 重绘幅度
                        table.float('denoising_strength').defaultTo(0.0);
                        // 放大比例
                        table.integer('hr_scale').defaultTo(1);
                        // 放大算法
                        table.string('hr_upscaler');
                        // 高清采样步数
                        table.integer('hr_second_pass_steps').defaultTo(0);
                        // 随机种子
                        table.integer('seed').defaultTo(-1);
                        // 算法
                        table.string('sampler_name').defaultTo('DPM++ SDE Karras');
                        // 步数
                        table.integer('steps').defaultTo(30);
                        // 相关性
                        table.integer('cfg_scale').defaultTo(7);
                        // 宽度
                        table.integer('width').defaultTo(1024);
                        // 高度
                        table.integer('height').defaultTo(576);
                        // 人脸修复
                        table.integer('restore_faces').defaultTo(0);

                        //duration：5  播放时长
                        table.integer('duration').defaultTo(5);
                        //动画：1（从左到右）2（从右到左）3（从上往下）4（从下往上）
                        table.integer('animation').defaultTo(1);
                        // 特效 effects
                        table.integer('effects').defaultTo(0);

                        //增加lora设置,多个用逗号分割
                        table.string('style_id').defaultTo('');

                        //增加配音地址
                        table.string('mp3').defaultTo('');
                        //配音人
                        table.string('py_name');
                        //语速
                        table.float('py_speed').defaultTo('1.0');
                        //情绪
                        table.string('py_emotion');
                        //配音的角色
                        table.string('py_roles');
                        table.integer('mp3_duration').defaultTo(1);

                        table.index('book_id', 'book_id_index');
                        table.index('book_info_id', 'book_info_id_index');
                        table.string('mp4_mute_url');//没有音轨的视频
                        table.integer('cnt').defaultTo(1);

                        
                    });
                }
            }),

            this.knex.schema.hasTable('config').then((exists) => {
                if (!exists) {
                    return this.knex.schema.createTable('config', (table)  => {
                        table.increments('id').primary();
                        table.string('name');
                        table.string('value');
                        table.timestamp('inserted_at').defaultTo(moment().format('YYYY-MM-DD HH:mm:ss'));
                    });
                }
            }),
          
            
            


        ]);
    }
}

module.exports = Database;
