/**
 * 这里是版本头文件，版本中间件控制可以再在这里做，但是自动绑定还没做这方面考虑。需要做
 *
 */

console.log('init api1.0')
var express = require('express');
const router = express.Router()


router.use((req, res, next)=>{
    next()
})
module.exports = {url: '1.0',router: router, status: 1}
