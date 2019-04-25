//令牌中心，不提供服务，只提供超时令牌

var stu = require('../config/config')
var crypto=require("crypto");
var token={
    createToken:function(obj,timeout){
        console.log(parseInt(timeout)||0);
        var obj2={
            data:obj,//payload
            created:parseInt(Date.now()/1000),//token生成的时间的，单位秒
            exp:parseInt(timeout)||10,//token有效期
            channel:'apiserver'
        };

        //payload信息
        var base64Str=Buffer.from(JSON.stringify(obj2),"utf8").toString("base64");

        //添加签名，防篡改
        var secret="eerwlrehtwilrtwrlwerjn54i";
        var hash=crypto.createHmac('sha256',secret);
        hash.update(base64Str);
        var signature=hash.digest('base64');


        return  base64Str+"."+signature;
    },
    decodeToken:function(token){
        var decArr=token.split(".");
        if(decArr.length<2){
            //token不合法
            return false;
        }

        var payload={};
        //将payload json字符串 解析为对象
        try{
            payload=JSON.parse(Buffer.from(decArr[0],"base64").toString("utf8"));
        }catch(e){
            return false;
        }

        //检验签名
        var secret="eerwlrehtwilrtwrlwerjn54i";
        var hash=crypto.createHmac('sha256',secret);
        hash.update(decArr[0]);
        var checkSignature=hash.digest('base64');

        return {
            payload:payload,
            signature:decArr[1],
            checkSignature:checkSignature
        }
    },
    /**
     *
     * @param token
     * @returns {number}  0:错误 1:succes 2:超时
     */
    checkToken:function(token){
        if(stu.mode=='release'){
            return 1
        }
        var resDecode=this.decodeToken(token);
        if(!resDecode){
            return 0;
        }
        //是否过期
        var expState=(parseInt(Date.now()/1000)-parseInt(resDecode.payload.created))>parseInt(resDecode.payload.exp)?false:true;
        if(resDecode.signature===resDecode.checkSignature && expState){
            return 1;
        }
        return 2;
    },
    refrshToken:function(token){

    }
}
module.exports=token;
