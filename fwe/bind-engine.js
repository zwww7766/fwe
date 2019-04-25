/**
 * Created by zhy on 2019/1/18.
 * 逻辑脚本绑定引擎
 * 约定根目录下 /logic  文件夹为指定绑定目录
 * 绑定子目录中文件到路由中间件
 */
const fs = require('fs');
const join = require('path').join;
const Router = require('express').Router()
/**
 *
 * @param startPath  起始目录文件夹路径
 * @returns {Array}
 */
function findSync(startPath) {
    let result=[];
    function finder(path) {
        let files=fs.readdirSync(path);
        files.forEach((val,index) => {
            let fPath=join(path,val);
            let stats=fs.statSync(fPath);
            if(stats.isDirectory()) finder(fPath);
            if(stats.isFile()&& !/.DS_Store/.test(fPath)
            ) {
                result.push(fPath);
            }
        });

    }
    finder(startPath);
    return result;
}
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * 路径结构转tree
 * 层级结构下 _router_url_ 是文件路径地址
 * @param arr
 */
function arryToTree(arr){

    arr = deepCopy(arr)
    var tree = {}

    for(let i in arr ){
        arr[i] = arr[i].split('/')
        let now = tree
        for(let j in arr[i]){
            // typeof tree[j] == 'object' ? tree[j].indexOf(arr[i][j]) >-1 ? true:tree[j].push(arr[i][j]) : tree[j] = []
            now[arr[i][j]] ? '': arr[i][j].match(/.js/) ? now._router_url_ = arr[i][j] : now[arr[i][j]] = {}
            now = now[arr[i][j]]
        }
    }
    return tree
}

/**
 * 文件树解析成路由树
 * @param tree
 */
function fileTreeToRouterTreeeee(tree){

    const subTreeCircle = function(fileUrl,subTree, rootRouter){

        var {url, router, status} = require(`../${fileUrl}/${subTree._router_url_}`)

        if(status) {
            rootRouter.use(`/${url}`, router)
        }

        for(let i in subTree){
            if(i!=='_router_url_'){
                subTreeCircle(`${fileUrl}/${i}`, subTree[i], router)
            }
        }
    }

    for(let i in tree) {
        subTreeCircle(i, tree[i], Router)
    }

}
export default function bindRouter(app){
    const fileNames = findSync('logic');
    fileTreeToRouterTreeeee(arryToTree(fileNames))
    app.use(Router)
}