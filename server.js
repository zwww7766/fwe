var express = require('express'),
    app     = express(),
    config  = require('./config/config'),
    log4js  = require('log4js');
const serverlist = ['-','api'];

import proxy from './fwe/proxy-middleware'
import bindRouter from './fwe/bind-engine'
import session from 'express-session'
const RedisStore = require('connect-redis')(session)
import wmv from './fwe/wechat-web-middleware'

config.app.session ? app.use(session({
    secret: '!@!UYEK)(@&&!().123',
    name: 'wc-session',
    cookie: {maxAge: 5400000},//1h
    resave: true,
    saveUninitialized: true,
    store: new RedisStore(config.redis.master)
})): console.log('no session')
for(let i in config.wx){
    //微信web中间件
    app.use(`${config.wx[i].logpath}`, wmv(config.wx[i]))
}

//路由代理中间件
app.use(proxy)

// 跨域  Cros
if(config.mode=='release'){

}else{
    app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
}

//日志中间件
app.use(log4js.connectLogger(log4js.getLogger('express'), { level: 'auto' }));

app.use((req, res, next)=>{
    if (config.mode=='release'){console.log(req.originalUrl)}
    let branch = req.path.split('/')[1]
    if(serverlist.indexOf(branch)){
        next()
    }else{
        res.send({data:'useless request 404!',code:'404'})
        console.log('useless request 404!')
    }
});
bindRouter(app)
let server = app.listen(config.app.port, ()=>{
    const host = server.address().address
    const port = server.address().port
    console.log("Instance，location: http://%s:%s", host, port)
});
