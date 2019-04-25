/**
 * Created by zhy on 2019/2/15.
 */
var express = require('express');
const router = express.Router()


router.use((req, res, next)=>{
    next()
})
module.exports = {url: 'api',router: router, status: 1}