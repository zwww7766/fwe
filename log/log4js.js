/**
 * Created by zhy on 2018/12/9.
 */
const log4js = require('log4js');
const config = require('./config');
const apiConfig = require('../config/config')
config.categories.dbdata.level = apiConfig.mode=='release' ? 'error':'info'
log4js.configure(config);

log4js.dev = (str)=>{
    apiConfig.mode!=='release' ? console.info(str):''
}
module.exports = log4js
