# fast-web-engine
一个基于nodejs、express的webapi快速开发脚手架

# 目前实现的功能
- mysql主从、读写分离
- redis分级缓存
- 微信web中间件
- babel支持es6全语法
- jwt令牌检测
- 基于约定的路由配置
- 请求参数约束检测
- log4js日志
- 接口代理
- 装饰器功能
- Dockerfile

# TODO List
- gRPC
- 配置优化

# useage

#### helloworld
-  观察./logic/api1.0/users目录
```
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
```
- 自动绑定逻辑：fwe/bind-engine 会按照约定从logic开始逐层解析，每个文件夹都拥有一个与之同名的js文件确定此层的url和状态。
- 接口定制逻辑：mapBind下get内是自定义get接口，以key-value形式定义路由逻辑。must定义检测入参，token也在此检测。
- 对外映射逻辑：config下app对象:
```
app:{
        mode:'release',
        port:3001,
        session:true,
        version:1.0,
        //todo 设置全局dev、 pro环境
    },
```
- ```babel-node server.js``` 后 访问 ```localhost:3002/api/1.0/helloword```请求就会被路由到user内定义的接口
#### babel
```$xslt
# init.sh
npm --save-dev install babel-cli
npm -g install babel-cli
echo '{
        "presets": [
          "es2015"
        ],
        "plugins": []
      }' >> .babelrc
npm install --save-dev babel-preset-es2015
```
#### 升级到babel7
- 全局安装```sudo npm install -g @babel/core @babel/cli @babel/node```
- 本地安装```npm install --save-dev @babel/core @babel/node ``` 
- 本地更新```npx babel-upgrade --write --install```


#### Docker build
- step1 ```./babel-build.sh```
- step2 ```docker build -t fwe:latest .```

#### 开始运行
- ```./init.sh```
- ```babel-node server.js```
- ```npm run fix-memory-limit``` 增加内存上线
- ```./babel-build.sh```
- 约定大于配置！ logic 下每一个文件夹都包含一个同名js文件夹，作为文件夹根路由。


