module.exports = {
    status:{
        msg:100,//相关信息
        success:200,//操作成功
        mysqlerr:601,
        redirect:300,//重定向
        cleneterr:400,//客户端错误
        tokenNeed:402,//需要token
        tokenTimeout:403,//token超时
        tokenError:405,//token错误
        servererr:500,//服务器错误
        dataerror:602,//数据结构不符合
        elementNeed:440,//元素缺失
        elementNull:441,//元素为空或不符合形式
        timeerror:603,//活动未开放
    },

    app:{
        mode:'release',
        port:3001,
        session:true,
        version:1.0,
        //todo 设置全局dev、 pro环境
    },
    mode:'release',//'debug' 'dev'  'release'
    log:'trace',
    redis: {
        status:true,//是否开启redis
        master:{
            port: '6379',
            host: '111.111.111.111'
        }
    },
    mysql:{
        master_slave:false,//是否开启主从节点
        slaveNum:1,
        master:{
            host:'mysql',
            user:'root',
            port:'3306',
            password:'123456',
            database : 'ald',
            charset:'UTF8MB4_GENERAL_CI',
            multipleStatements: true,
            connectionLimit:30,
        },
        slave1: {
            host:'mysql',
            user:'root',
            port:'3306',
            password:'123456',
            database : 'ald',
            charset:'UTF8MB4_GENERAL_CI',
            multipleStatements: true,
            connectionLimit:50,
        },
        dev:{
            host:'172.21.3.106',
            user:'root',
            port:'43378',
            password:'1qaz!QAZ',
            database : 'alding',
            charset:'UTF8MB4_GENERAL_CI',
            multipleStatements: true,
            connectionLimit:30,
        },
    },
    wx:{
        'ald001':{//视频游戏
            aldid:'ald007',
            logpath:'/wx/ald007',
            host:'https://game.cn/wx/ald001',
            appid: '1233',
            appsecret: '123',
            redirect:'https://game.cn/qiuhuo/',
            level:'jsapi'
        }
    },
}