var token = require('../centerLayer/tokenCenter'),
    stu = require('../config/config').status,
    request = require('request');
// const ald = require('../centerLayer/aldingCenter');
const moment = require('moment')
const md5 = require('md5')
module.exports = {
    createUuid(){
        console.log('create uuid')
        let timeStamp = (new Date()).valueOf()
        let uuid = '2'+timeStamp
        return uuid
    },
    key_chain_check(chain, query, cb){
        if(!chain || chain==undefined){
            cb({code:stu.dataerror,data:'Not quoted interface'})
            return
        }
        this.key_check =  (key) => {
            if(query[key]){
                let v = query[key]
                if(v=='' || v==null || v==undefined|| v=='null' || v=='undefined'){
                    return {code:stu.elementNull,data:`element [${key}] is null or undefined`}
                }else{
                    return {code:200}
                }
            }else{
                return {code:stu.elementNeed,data:`element [${key}] lose`}
            }
        }
        this.remove = (v, chain) =>{
            if(chain.indexOf(v)>=0){
                chain.splice(chain.indexOf(v),1)
            }
            return chain
        }
        if(chain.indexOf('token')>-1){
            let res = this.key_check('token')
            if(res.code==200){
                let tokenRes = token.checkToken(query.token)
                switch (tokenRes) {
                    case 0:
                        cb({code:stu.tokenError,data:`token error`});return
                    case 1:
                        break
                    case 2:
                        cb({code:stu.tokenTimeout,data:`token timeout`});return
                }
            }else{
                cb(res)
                return
            }
        }
        chain = this.remove('token', chain)
        for(let i in chain){
            let res = this.key_check(chain[i])
            if(res.code==200){
                continue
            }else{
                cb(res)
                return
            }
        }
        cb({code:200})
    },
    httpGet(url, param, cb){
        url = `${url}?${this.paramFormat(param)}`
        let start = new Date().valueOf()
        request({url: url, method: `get`,
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            json:false,
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                // 请求成功的处理逻辑
                console.log(`[${new Date().valueOf() - start}] ${url}`)
                console.log(body)
                cb(JSON.parse(body))
            }else{
                cb({code:404})
            }
        })
    },
    // 左右值编码 区间嵌套
    // treeAdd(parent, child){
    //     ald.select(`select YOU, LAST_RIGHT from ald_jfq.binarytree where USER_ID = ${parent}`,data =>{
    //         console.log(data)
    //         let y = data[0].YOU.split('/')
    //         let x = data[0].LAST_RIGHT.split('/')
    //
    //         let new_x_0 = [2 * parseInt(x[0]) , 3 * parseInt(x[1])]
    //         let new_x_1 = [ parseInt(y[0]) , 3 * parseInt(y[1])]
    //
    //         let new_y_0 = [ parseInt(x[0]) , 3 * parseInt(x[1])]
    //         let new_y_1 = [2 * parseInt(y[0]) , 3 * parseInt(y[1])]
    //
    //
    //         let newx = [new_x_0[0]*new_x_1[1] + new_x_1[0]* new_x_0[1], new_x_0[1] * new_x_1[1]]
    //         let newy = [new_y_0[0]*new_y_1[1] + new_y_1[0]* new_y_0[1], new_y_0[1] * new_y_1[1]]
    //         let newx_y = commonDivisor1(newx[0], newx[1])
    //         newx = `${newx[0]/newx_y}/${newx[1]/newx_y}`
    //         let newy_y = commonDivisor1(newy[0], newy[1])
    //         newy = `${newy[0]/newy_y}/${newy[1]/newy_y}`
    //         ald.insert(`insert into ald_jfq.binarytree values(${child}, '${newx}', '${newy}', '${newx}')`)
    //         ald.update(`update ald_jfq.binarytree set LAST_RIGHT='${newy}' where  USER_ID = ${parent}`)
    //     })
    // },
    // 时间差
    /**
     *
     * @param before 前置时间
     * @param after  后置时间
     * @param type  差额样式  hours \ days \ minutes
     */
    momentDiffer(after, before, type){
        console.log(moment().format('YYYY-MM-DD HH:mm:ss'))
        let differ = moment().diff(before, type)
        console.log(`differ time：${differ} ${type}`)
        return differ
    },

    /**
     * salt 1 \ 2 \ 3
     */
    generateKey(salt){
        return md5(Date.now()+'>'+salt)
    },
    /**
     * http 对象拼接路由
     * @param params
     */
    paramFormat(params){
        if (params != null || params != "") {
            let formData = '';
            let i = 0;
            let size = 0;
            for (let pa in params) {
                size++;
            }
            for (let p in params) {
                formData += (p + '=' + params[p]);
                if (i < size - 1) {
                    formData += '&';
                }
                i++;
            }
            return formData;
        }
        return 'null'
    },
    /**
     *
     */
    getTimeStamp(){
        return new Date().valueOf()
    },
}
//计算最大公约数
function math_gongyueshu(a, b) {
        if (a % b === 0) {
            return b;
        }
        return arguments.callee(b, a % b);
    }
function commonDivisor1(num1,num2) {
    if ((num1-num2) < 0) {
        var k = num1;
        num1 = num2;
        num2 = k;
    }
    while (num2 !=0) {
        var remainder = num1%num2;
        num1 = num2;
        num2 = remainder;
    }
    return num1;
}