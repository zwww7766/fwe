# fwe
一个基于nodejs、express的快速开发脚手架

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

#### useage
- ```./init.sh```
- ```babel-node server.js```
- ```npm run fix-memory-limit``` 增加内存上线
- ```./babel-build.sh```
- 约定大于配置！ logic 下每一个文件夹都包含一个同名js文件夹，作为文件夹根路由。
