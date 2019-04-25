/**
 * Created by zhy on 2019/1/18.
 * fast web engine  快速web引擎脚手架
 *
 */
const ald = require('../centerLayer/aldingCenter')
const stu = require('../config/config').status

const express = require('express');
const router = express.Router()
const token = require('../centerLayer/tokenCenter')
const redis = require('../centerLayer/redisLayer')
const ut = require('../Utils/util')
const log4js = require('../log/log4js')
const moment = require('moment')
const md5 = require('md5')
const request = require('request')
//import
import wechat from '../Utils/wechatUtil'
import assumeRole from '../Utils/ossUtil'
const key_chain = {}
/**
 * keychain内key值不能重复，由原来的单元素对象到现在的多元素对象由于key唯一，不影响效果
 */
router.use((req, res, next)=>{
    ut.key_chain_check(JSON.parse(JSON.stringify(key_chain[req.path])), req.query,(data)=>{
        if(data.code==200){
            next()
        }else{
            res.send(data)
        }
    })
})

module.exports = {
    ald:ald,
    token:token,
    stu:stu,
    router:router,
    redis:redis,
    ut:ut,
    log4js:log4js,
    moment:moment,
    md5:md5,
    request:request,
    wechat: wechat,
    ossumeRole:assumeRole,
    mapBind:map => {
        Object.getOwnPropertyNames(map.get).forEach((k)=>{router.get(k,map.get[k].fun);
            if(key_chain[k]){
                console.warn(`warn! key [${k}] has been use`);
                key_chain[k] = map.get[k].must
            }else {
                key_chain[k] = map.get[k].must
            }
        })
    }
}