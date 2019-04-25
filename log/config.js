module.exports={
    appenders: {
        err:
            {
                type: "dateFile",
                filename: "/log/err/",
                pattern: "dberr-yyyy-MM-dd.log",
                alwaysIncludePattern: true
            },
        dbdata:
            {
                type: "dateFile",
                filename: "/log/dbdata/",
                pattern: "dbdata-yyyy-MM-dd.log",
                alwaysIncludePattern: true
            },
        normal: {//其他日志
            type: "dateFile",
            filename: "/log/api/",
            pattern: "apiserver-yyyy-MM-dd.log",
            alwaysIncludePattern: true
        },
        express:{
            type:'dateFile',
            filename: "/log/express/",
            pattern: "router-yyyy-MM-dd.log",
            alwaysIncludePattern: true
        },
        pay:{
            type:'dateFile',
            filename: "/log/pay/",
            pattern: "tender-yyyy-MM-dd.log",
            alwaysIncludePattern: true
        },
        group:{
            type:'dateFile',
            filename: "/log/group/",
            pattern: "group-yyyy-MM-dd.log",
            alwaysIncludePattern: true
        },
        sms:{
            type:'dateFile',
            filename: "/log/sms/",
            pattern: "sms-yyyy-MM-dd.log",
            alwaysIncludePattern: true
        },
        asj:{
            type:'dateFile',
            filename: "/log/asj/",
            pattern: "asj-yyyy-MM-dd.log",
            alwaysIncludePattern: true
        },
        jxw:{
            type:'dateFile',
            filename: "/log/jxw/",
            pattern: "jxw-yyyy-MM-dd.log",
            alwaysIncludePattern: true
        }
    },
    categories: {//元素和appenders中的元素绑定
        default: {appenders: ["normal"], level: "trace"},
        api: {appenders: ["normal"], level: "trace"},
        express: {appenders: ["express"], level: "trace"},
        dberror: {appenders: ["err"], level: "error"},
        tender:{appenders: ["pay"], level: "info"},
        dbdata:{appenders: ["dbdata"], level: "info"},
        groupBind:{appenders:["group"], level: "info"},
        sms:{appenders:["sms"], level: "info"},
        asj:{appenders:["asj"], level: "info"},
        jxw:{appenders:["jxw"], level: "info"},
    }
}