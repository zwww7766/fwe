/**
 * Created by zhy on 2019/1/29.
 */

const proxy = require('http-proxy-middleware');//引入代理中间件

export  default  proxy('/api/missions/**',
    {
        target: 'http://mission:5000/',
        changeOrigin: false,
        exports,
        pathRewrite: {
            '^/api/missions' : '/',     // 重写请求，比如我们源访问的是api/old-path，那么请求会被解析为/api/new-path
        }
    })