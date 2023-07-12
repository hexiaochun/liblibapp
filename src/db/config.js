const moment = require('moment');
class Config {
    constructor(knex) {
        this.knex = knex;
    }

    // 根据 name 查询 value
    async getValueByName(name) {
        const config = await this.knex.select('value').from('config').where('name', '=', name).first();

        if (config) {
            // 如果找到了配置，就返回它的 value
            return config.value;
        } else {
            // 如果没有找到配置，就返回空字符串
            return "";
        }
    }
    //更新时间
    async update_task_time(){
        return await this.updateValueByName('db_task_time', moment().format('YYYY-MM-DD HH:mm:ss'));
    }
    //获取更新时间
    async get_task_time(){
        return await this.getValueByName('db_task_time');
    }

    async get_image_path(){
        return await this.getValueByName('db_image_path');
    }
    async save_image_path(vale){
        return await this.updateValueByName("db_image_path",vale);
    }

    // 根据 name 更新 value
    async updateValueByName(name, value) {
        const config = await this.knex('config').where('name', '=', name).first();

        if (config) {
            // 如果找到了配置，就更新它
            return this.knex('config').where('name', '=', name).update({ value });
        } else {
            // 如果没有找到配置，就插入新的配置
            return this.knex('config').insert({ name, value });
        }
    }
        



}

module.exports = Config;
