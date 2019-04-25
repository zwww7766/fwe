/**
 * Created by zhy on 2018/11/14.
 */
//abandon 不用mongo存储
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// 返回一个mongo用户库实例
module.exports = mongoose.model('User', new Schema({
    uuid: String,
    openid: String,
    balabala: Boolean   //要不要都行
}));
