/**
 * Created by zhy on 2019/1/25.
 */
import { ald, router, mapBind, request } from '../../../fwe/module'

mapBind({
    get: {
        '/auth':{
            must: ['appid'],
            fun: (req, res)=> { const { appid } = req.query

            }
        },

    }
})
module.exports = {url: 'wx',router: router, status: 1}