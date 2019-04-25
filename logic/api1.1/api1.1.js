/**
 * Created by zhy on 2019/1/18.
 */
var version = '1.1'
console.log('init api1.1')
var express = require('express');
const router = express.Router()


router.use((req, res, next)=>{
    // console.log('api1.1')
    next()
})
module.exports = {url: '1.0',router: router, status: 1}