
import { ald, stu, router, token, redis, ut, log4js, mapBind} from '../../../fwe/module'
mapBind({
    get:{
        '/accessUnion':{
            must:['token','app','openid','unionid'],
            fun:(req,res)=> {
                //获取用户数据，获取不到则初始化
                res.send({code:stu.success,data:'helloworld'})
            }
        },
        '/helloworld':{
            must:[],
            fun:(req, res)=>{
                res.send({code:stu.success,data:'helloworld'})
            }
        },
        '/helloworldcheck':{
            must:['app'],
            fun:(req, res)=>{
                res.send({code:stu.success,data:'helloworld:'+req.query.app})
            }
        }
    },
})
module.exports = {url: 'user',router: router, status: 1}

