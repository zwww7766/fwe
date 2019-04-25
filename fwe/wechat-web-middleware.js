
/**
 * Created by zhy on 2019/1/25.
 */

import {ut} from "./module";
import token from "../centerLayer/tokenCenter"
/** 微信网页授权access_token和普通access_token区别
 * 有效期：两者有效时间都是7200s。
 * 使用范围：通过网页授权获得的access_token，只能获取到对应的微信用户信息，与微信用户是一对一关系；而普通的access_token在有效期内可以使用，可以获取所有用户信息。
 * 次数限制：普通access_token每天获取最多次数为2000次，而网页授权的access_token获取次数没有限制。
 */
const express = require('express');
const crypto = require('crypto')

import wechat from '../Utils/wechatUtil'
import ald from '../centerLayer/aldingCenter'
var config = {
    // host:'http://backstage.vgame.maopp.cn/wx',
    // appid: 'wx95eedeabe5831a9a',
    // appsecret: 'e4aff408802dec950d0a5c7e2367a1ea',
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
function sha1(str) {
    let shasum = crypto.createHash("sha1")
    shasum.update(str)
    str = shasum.digest("hex")
    return str
}
function doSign (jsapi_ticket, ranDomStr, timestamp, url) {

    var ret = {
        jsapi_ticket: jsapi_ticket,
        nonceStr: ranDomStr,
        timestamp: timestamp,
        url: url
    }
    var string = raw(ret)
    var signature = sha1(string)
    return signature
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
//---------------------------------- property -----------------------------------
/**
 * options = {host:'', appid:'', appsecret:''}
 * @param options
 */
function wechat_middleware_init(options){
    console.log(`return ${JSON.stringify(options)}`)
    const wmv = express.Router()
    wmv.config = {...options}
    wmv.wxApi = new wechat(options)

    wmv.use((req , res, next) => {
        console.log('router header  >'+req.originalUrl)
        // 有${wmv.config.logpath}/auth 或有有session 则 next()
        if (!req.originalUrl.startsWith(`${wmv.config.logpath}/auth`)  &&
            !access_token_check(req.session ? req.session : false)) {
            //todo step1 从头开始无缓存的步骤，重定向到auth

            res.redirect(wmv.wxApi.auth(wmv.config.host + '/auth', wmv.config.appid));
        } else {
            next()
        }
    })

    //todo step2 已有授权从 /wx/ald004进入   ->   session中有redirectUrl 直接重定向走，没有则重新授权
    wmv['get']('/', (req, res) => {

        let auth = `${wmv.config.logpath}/auth`
        res.redirect(req.session ? req.session.redirectUrl ? req.session.redirectUrl : auth : auth );
    });

    //auth后重定向回来 包含code
    wmv['get']('/auth', (req, res) => {
        let { code } = req.query
        console.log(`/auth  level: ${wmv.config.level}`)
            if(wmv.config.level == 'jsapi') {
                res.redirect(wmv.config.host + '/authTicket')
            }
            if(wmv.config.level == 'regis') {
                res.redirect(wmv.wxApi.auth(wmv.config.host + '/authUser', wmv.config.appid, 'userinfo'))
            }
    })

    //userinfo后重定向回来 包含code
    wmv['get']('/authUser', (req, res) => {
        let {code} = req.query
            wmv.wxApi.getUserToken(code, req, user_token => {
                wmv.wxApi.subscribe((u) => {//todo 是否关注公众号，关注公众号用基础access_token  未关注用授权获取用户信息
                    console.log(JSON.stringify(u))
                    wmv.wxApi.subscribe_info(u.access_token, user_token.openid, k => {
                        console.log('订阅消息：'+JSON.stringify(k))
                        wmv.wxApi.getUserInfo(user_token.access_token, user_token.openid, user_info => {
                            req.session.user_info = user_info
                            const { unionid } = user_info

                            //用户获取成功，自行添加绑定用户
                        })
                    })
                })
        })
    })

    wmv['get']('/authTicket', (req, res) => {
        var reAuth = 0
        const nowGetTicket = (refresh) => { refresh = refresh||false
            wmv.wxApi.getBaseToken(wmv, base_access_token => {
                // console.log('base_token:' + JSON.stringify(base_token))
                wmv.wxApi.getTicket(base_access_token, (msg) => {
                    if(msg.errcode == 0){
                        signAndRediret(msg)
                    }else{
                        reAuth ++
                        if(reAuth<3) {
                            nowGetTicket(true)
                        }
                    }
                })
            },refresh)
        }
        const signAndRediret = (msg) =>{
                var ranDomStr = (Math.random() + "").substring(2, 16),
                    ticket = msg.ticket,
                    timestamp = Date.parse(new Date()) / 1000
                var signStr = doSign(ticket, ranDomStr, timestamp, wmv.config.redirect)
                // var url = `${wmv.config.redirect}#uuid=${req.session.uuid}&timestamp=${timestamp}&nonceStr=${ranDomStr}&signature=${signStr}`
                var url = ''

                if(wmv.config.level == 'jsapi') {
                    url = `${wmv.config.redirect}#timestamp=${timestamp}&nonceStr=${ranDomStr}&signature=${signStr}`
                }
                if(wmv.config.level == 'regis') {
                    url = `${wmv.config.redirect}#uuid=${req.session.uuid}&timestamp=${timestamp}&nonceStr=${ranDomStr}&signature=${signStr}&token=${token.createToken({sessionKey:123,uuid:req.session.uuid})}`
                }
                console.log('重定向url:'+url)
                req.session.redirectUrl = url
                res.redirect(url)
        }
        nowGetTicket(false)
    })
    return wmv
}
export default wechat_middleware_init