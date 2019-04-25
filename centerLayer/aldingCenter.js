//数据库中心
const mysql =  require('mysql');
const md5  = require('md5')
const stu = require('../config/config')
const pool = mysql.createPool(stu.mysql.master)
const slavePool = mysql.createPool(stu.mysql.slave1)
const moment = require('moment');
const request = require('request');
const redis = require('./redisLayer')
const log4js = require('../log/log4js')
const ut = require('../Utils/util')
var logger = log4js.getLogger('dbdata')
var errLogger = log4js.getLogger('dberror')
var groupLogger = log4js.getLogger('groupBind')
var apiLogger = log4js.getLogger('api')
var cacheLevel =  {
    "1":900,//15分钟
    "2":3600,//小时
    "3":7200,//排行
    "4":86400,//日
}
// var bbk = require('./dataBase/bbk/bbkquery')
//todo 增加数据库锁
var INSERT_QUEUE = [];
var UPDATE_QUEUE = [];
var INSERTSQLS = '';
(()=>{
    setInterval(()=>{
        INSERTSQLS = ''
        if(INSERT_QUEUE.length>10){
            INSERTSQLS = INSERT_QUEUE.splice(0,10).join(';')
        }else{
            if(INSERT_QUEUE.length>0) {
                INSERTSQLS = INSERT_QUEUE.splice(0, INSERT_QUEUE.length).join(';')
            }else{
                // console.log('QUEUE clean')
            }
        }
        if(INSERTSQLS==''){

        }else {
            ald.query(INSERTSQLS, (data) => {
            })
        }
    },100)

})()



const ald =  {

    _parse(data){
        return data
    },
    insert(sql){
        //插入
        console.log(sql)
        INSERT_QUEUE.push(sql)
    },
    update(sql){
        this.query(sql,()=>{})
    },
    select(sql, cb, level=0){
        if(stu.redis && level>0){
            redis.get(md5(sql),(data)=>{
                // console.log('> from redis >',data)
                if(data && data!=undefined){
                    cb([JSON.parse(data)])
                }else{
                    if(stu.mysql.master_slave){
                        this.slaveQuery(sql, (data) => {
                            if (data.length) {
                                redis.setExpire(md5(sql), JSON.stringify(data[0]), cacheLevel[level], () => {
                                })
                                cb(data)
                            } else {
                                cb(data)
                            }
                        })
                    }else {
                        this.query(sql, (data) => {
                            if (data.length) {
                                redis.setExpire(md5(sql), JSON.stringify(data[0]), cacheLevel[level], () => {
                                })
                                cb(data)
                            } else {
                                cb(data)
                            }
                        })
                    }
                }
            })
        }else {
            if(stu.mysql.master_slave){
                this.slaveQuery(sql, (data) => {
                    // console.log('>s from mysql')
                    cb(data)
                })
            }else {
                this.query(sql, (data) => {
                    // console.log(`>m from mysql ${data} `)
                    cb(data)
                })
            }
        }
    },
    //with param
    _query(sql,param,cb){//todo _query 基于需要回调的更新和插入方法-对接master
        let start = new Date().valueOf()
        pool.getConnection((err, connection)=>{
            let getDf = new Date().valueOf() - start
            if(err){
                console.log(err)
                cb(false)
            }else{
                connection.query(sql, param, (err, data) => {
                    if(err){
                        console.log(err)
                        cb(false)
                    }else {
                        // logger.error(`> _q ${sql} [${getDf}] [${new Date().valueOf() - start}]`)
                        data = this._parse(data)
                        // console.log(data)
                        cb(data)
                        connection.release();
                    }
                })
            }
        })
    },
    query(sql, cb){
        // console.log(sql)
        let start = new Date().valueOf()
        pool.getConnection((err, connection)=>{
            let getDf = new Date().valueOf() - start
            if(err){
                console.log(err)
                errLogger.error(`master ${err}`)
                cb(false)
            }else{
                // logger.info(`m >${sql}`)
                connection.query(sql, (err, data) => {
                    if(err){
                        console.log(err)
                        errLogger.error(err)
                        cb(false)
                    }else {
                        data = this._parse(data)
                        logger.error(`m > ${sql} [${getDf}] [${new Date().valueOf() - start}]`)
                        cb(data)
                        connection.release();
                    }
                })
            }   
        })
    },
    slaveQuery(sql, cb){
        let start = new Date().valueOf()
        slavePool.getConnection((err, connection)=>{
            let getDf = new Date().valueOf() - start
            if(err){
                errLogger.error(`slave ${err}`)
                cb(false)
            }else{
                logger.info(`s >${sql}`)
                connection.query(sql, (err, data) => {
                    if(err){
                        errLogger.error(err)
                        cb(false)
                    }else {
                        logger.error(`${sql} [${getDf}] [${new Date().valueOf() - start}]`)
                        data = this._parse(data)
                        // console.log(data)
                        cb(data)
                        connection.release();
                    }
                })
            }
        })
    },


}
function formatDate(time){
    var date = new Date(time);

    var year = date.getFullYear(),
        month = date.getMonth()+1,//月份是从0开始的
        day = date.getDate(),
        hour = date.getHours(),
        min = date.getMinutes(),
        sec = date.getSeconds();
    var newTime = year + '-' +
                (month < 10? '0' + month : month) + '-' +
                (day < 10? '0' + day : day) + ' ' +
                (hour < 10? '0' + hour : hour) + ':' +
                (min < 10? '0' + min : min) + ':' +
                (sec < 10? '0' + sec : sec);

    return newTime;         
}
function _encode(string) {//兼容java的_encode
    return encodeURIComponent(string).replace(/%20/gi, '').replace(/(!)|(')|(\()|(\))|(\~)/gi, item => {
        return '%' + item.charCodeAt(0).toString(16).toLocaleUpperCase();
    })
}
module.exports = ald