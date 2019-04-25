/**
 * Created by zhy on 2019/1/25.
 */
import userDb from "../dataBase/user/userDb";

var https = require('https')
var urlEnc = require('urlencode');
var wechat_options_template = {hostname: 'api.weixin.qq.com', port: 443, method: 'GET'};
import redis from '../centerLayer/redisLayer'

var app = {
}
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function https_request(options, cbk, body) {
    let req = https.request(options, (res) => {

        // console.log('statusCode:', res.statusCode);
        res.on('data', (d) => {
            let resdata = '';
            try {
                resdata = JSON.parse(d);
            } catch (err) {
                resdata = d.toString();
            }
            if (cbk && typeof(cbk) === 'function') {
                cbk(resdata);
            }
        });
    });

    req.on('error', (e) => {
        console.log('错误！')
        console.error(e);
    });

    if (body !== undefined) {
        req.write(body);
    }
    req.end();

}
function raw (args) {
    var keys = Object.keys(args)
    keys = keys.sort()
    var newArgs = {}
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key]
    })

    var string = ''
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k]
    }
    string = string.substr(1)
    return string
}

function sign (jsapi_ticket, url) {
    var ret = {
        jsapi_ticket: jsapi_ticket,
        nonceStr: createNonceStr(),
        timestamp: createTimestamp(),
        url: url
    }
    var string = raw(ret)
    ret.signature = sha1(string)
    ret.appId =  config.appid
    return ret
}

/**
 *
 * @param generate_time
 * @param expires_in
 * @returns {boolean}  true 未超时 false 超时   被redis自动超时替代
 */
function base_access_token_check (baseToken) {
    if(!(baseToken.generate_time && baseToken.expires_in)) return false //有不存在的指向auth
    let { generate_time, expires_in } = baseToken
    return (Date.parse(new Date())/1000 - generate_time) > expires_in ? false : true
}

/**
 *
 * @param generate_time
 * @param expires_in
 * @returns {boolean}  true 未超时 false 超时
 */
function access_token_check (session) {
    if(!session) return false
    if(!session.utoken) return false
    if(!(session.utoken.generate_time && session.utoken.expires_in)) return false //有不存在的指向auth
    let { generate_time, expires_in } = session.utoken
    return (Date.parse(new Date())/1000 - generate_time) > expires_in ? false : true
}
export default class wechat {
    constructor(props) {
        app = {...props}
    }
    //网页授权作用域，每次请求一个和相关作用域吻合的code，再拿code调取相关接口。所以这是网页授权的前置接口。
    auth(callback_url, appid, scope = 'base'){
        let url = [
            'https://open.weixin.qq.com/connect/oauth2/authorize?',
            'appid=' + appid,
            '&redirect_uri=' + urlEnc.encode(callback_url),
            '&response_type=code&scope=snsapi_' + scope,
            '#wechat_redirect'
        ].join('');
        return url;
    }
    //获取基本授权accesstoken
    getBaseToken(wmv, cb, refresh=false) {
        if (refresh) {
            // console.log('refresh get new base token')
            let wechat_options = deepCopy(wechat_options_template);
            wechat_options.path = [
                '/cgi-bin/token?appid=', app.appid,
                '&secret=', app.appsecret,
                '&grant_type=client_credential'
            ].join('');
            // console.log(wechat_options)
            https_request(wechat_options, base_token => {
                cb(base_token.access_token)
                redis.setExpire('wechat_middle_base_token', base_token.access_token, 7000, ()=>{console.log()})
            })
        } else {
            // fetch old base_token
            redis.get('wechat_middle_base_token', new_base_token=>{
                // console.log('redis 存储的basetoken：'+new_base_token)
            if(new_base_token){
                // console.log('返回存储过的token')
                cb(new_base_token)
            } else {
                // console.log('get new base token')
                let wechat_options = deepCopy(wechat_options_template);
                wechat_options.path = [
                    '/cgi-bin/token?appid=', app.appid,
                    '&secret=', app.appsecret,
                    '&grant_type=client_credential'
                ].join('');
                https_request(wechat_options, base_token => {
                    cb(base_token.access_token)
                    redis.setExpire('wechat_middle_base_token', base_token.access_token, 7000, ()=>{console.log()})
                })
            }
            })
        }
    }
    //网页授权access_token
    getUserToken = (code, req, cb) => {
        if(access_token_check(req.session ? req.session : false)){
            cb(req.session.utoken)
        }else {
            let wechat_options = deepCopy(wechat_options_template);
            wechat_options.path = [
                '/sns/oauth2/access_token?appid=', app.appid,
                '&secret=', app.appsecret,
                '&code=', code,
                '&grant_type=authorization_code'
            ].join('');
            https_request(wechat_options, user_token =>{
                user_token.generate_time = Date.parse(new Date()) / 1000;
                req.session.utoken = user_token
                cb(user_token)
            });
        }
    };
    getTicket(access_token, cb){
        let wechat_options = deepCopy(wechat_options_template);
        wechat_options.path = [
            '/cgi-bin/ticket/getticket?access_token=', access_token,
            '&type=jsapi'
        ].join('');
        https_request(wechat_options, cb);
    }
    refreshToken(refresh_token, cb){
        let wechat_options = deepCopy(wechat_options_template);
        wechat_options.path = [
            '/sns/oauth2/refresh_token?appid=' + configs.weChat.appId,
            '&grant_type=refresh_token&refresh_token=' + refresh_token
        ].join('');
        https_request(wechat_options, cb);
    }
    getBaseUserInfo(accessToken, openId, cb){
        let wechat_options = deepCopy(wechat_options_template);
        wechat_options.path = '/cgi-bin/user/info?access_token=' + accessToken + '&openid=' + openId + '&lang=zh_CN';
        https_request(wechat_options, cb);
    }
    getUserInfo(accessToken, openId, cb){
        let wechat_options = deepCopy(wechat_options_template);
        wechat_options.path = '/sns/userinfo?access_token=' + accessToken + '&openid=' + openId + '&lang=zh_CN';
        https_request(wechat_options, cb);
    }
    subscribe(cb){
        let wechat_options = deepCopy(wechat_options_template);
        wechat_options.path = '/cgi-bin/token?grant_type=client_credential&appid='+app.appid+'&secret='+app.appsecret
        https_request(wechat_options, cb)
    }
    subscribe_info(accessToken, openId, cb){
        let wechat_options = deepCopy(wechat_options_template);
        wechat_options.path = '/cgi-bin/user/info?access_token=' + accessToken + '&openid=' + openId + '&lang=zh_CN';
        https_request(wechat_options, cb);
    }
}