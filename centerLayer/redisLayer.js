/**
 * Created by zhy on 2018/11/14.
 */
var config = require('../config/config')
var poolModule = require('generic-pool'),
    redis = require("redis");
    // cli = redis.createClient(6379,"127.0.0.1")
const factory = {
    create: function() {
        var redis_cli = redis.createClient(config.redis.master.port, config.redis.master.host);
        redis_cli.on("ready",function(err){
            if(err){
                console.log("err : "+err);
            }else{
                console.log("redis start ");
            }
        })
        return redis_cli
    },
    destroy: function(client) {
        client.end()
    }
};
const opts = {
    max: 10,
    min: 2,
}

    var redisPool = poolModule.createPool(factory, opts)
    redisPool.start()
    var redisClient = {
        // 数据库选择
        /*
         * redis默认连接数据库0,可以利用select选择指定数据库0~15
         * 使用示例：
         * redisClient.select("15", function (err) {
         *  if (err) {
         *      return false;
         *  } else {
         *      console.log('connect success');
         *  }
         * });
         */

        set(key, val, cb) {
            redisPool.acquire().then((cli) => {
                cli.set(key, JSON.stringify(val), (err, res) => {
                    if (err) console.log(err)
                    console.log(res)
                    cb(res)
                })
                redisPool.release(cli);
            })
        },
        del(key, cb) {
            redisPool.acquire().then((cli) => {
                cli.del(key, (err, res) => {
                    if (err) console.log(err)
                    console.log(res)
                    cb(res)
                })
                redisPool.release(cli);
            })
        },
        get(key, cb) {
            redisPool.acquire().then((cli) => {
                cli.get(key, (err, res) => {
                    if (err) {
                        console.log(err)
                        cb(false)
                    } else {
                        if (res) {
                            cb(res)
                        } else {
                            cb(false)
                        }
                    }
                    redisPool.release(cli);
                })
            })
        },
        /**
         *
         * @param key
         * @param time  秒单位
         */
        expire(key, time) {
            redisPool.acquire().then((cli) => {
                cli.expire(key, time, (res) => {

                })
                redisPool.release(cli);
            })
        },
        setExpire(key, val, time, cb) {
            redisPool.acquire().then((cli) => {
                cli.set(key, val, (res) => {
                    cli.expire(key, time)
                    cb(res)
                })
                redisPool.release(cli);
            })
        },
        _setExpire(key, val, time, cb) {
            redisPool.acquire().then((cli) => {

                redisPool.release(cli);
            })
        },
        lpush(queue, val, cb) {
            redisPool.acquire().then((cli) => {
                cli.rpush(queue, val, (res) => {
                    cb(res)
                })
                redisPool.release(cli);
            })
        },
        lpop(queue, cb) {
            redisPool.acquire().then((cli) => {
                cli.lpop(queue, (res) => {
                    cb(res)
                })
                redisPool.release(cli);
            })
        },
        /**
         *
         * @param queue
         * @param cb 阻塞左出栈
         */
        blpop(queue, cb) {
            redisPool.acquire().then((cli) => {
                cli.blpop(queue, (res) => {
                    cb(res)
                })
                redisPool.release(cli);
            })
        },
        /**
         * 数组切片  保留指定区域内的元素,
         * @param queue
         * @param start
         * @param end
         * @param cb
         */
        ltrim(queue, start, end, cb) {
            rredisPool.acquire().then((cli) => {
                cli.ltrim(queue, start, end, (data) => {
                    cb(data)
                })
                redisPool.release(cli);
            })
        },
        lrange(queue, start, end, cb) {
            redisPool.acquire().then((cli) => {
                cli.lrange(queue, start, end, (data) => {
                    cb(data)
                })
                redisPool.release(cli);
            })
        },
        hset(queue, key, val, cb) {
            redisPool.acquire().then((cli) => {
                cli.hset(queue, key, JSON.stringify(val), (data) => {
                    cb(data)
                })
                redisPool.release(cli);
            })
        },
        hmset(queue, key, val, cb) {
            redisPool.acquire().then((cli) => {
                cli.hmset(queue, key, val, (data) => {
                    cb(data)
                })
                redisPool.release(cli);
            })
        },
        hget(queue, key, cb) {//存储json
            redisPool.acquire().then((cli) => {
                cli.hget(queue, key, (err, data) => {
                    if (err) {
                        cb(false);
                        console.log('err', err);
                        return
                    } else {
                        cb(JSON.parse(data))
                    }
                })
                redisPool.release(cli);
            })
        },
        hdel(queue, key) {
            redisPool.acquire().then((cli) => {
                cli.hdel(queue, key, (data) => {
                    console.log('delete msg:', data)
                })
                redisPool.release(cli);
            })
        },
        hgetall(queue, cb) {
            redisPool.acquire().then((cli) => {
                cli.hgetall(queue, (data) => {
                    cb(data)
                })
                redisPool.release(cli);
            })
        },
        hlen(queue, cb) {
            redisPool.acquire().then((cli) => {
                cli.hlen(queue, (data) => {
                    cb(data)
                })
                redisPool.release(cli);
            })
        },
        hexists(queue, key, cb) {
            redisPool.acquire().then((cli) => {
                cli.hexists(queue, key, (data) => {
                    cb(data)
                })
                redisPool.release(cli);
            })
        },
    }


module.exports = redisClient