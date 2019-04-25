/**
 * Created by zhy on 2019/1/23.
 */
const OSS = require('ali-oss')
var STS = OSS.STS;
var sts = new STS({
    accessKeyId: 'LTAIEeLRE2dGYfCV',
    accessKeySecret: 'E2UmH0EvYNqX1N7XrnP08VrcaHPpky'
})
async function assumeRole () {
    try {
        let token = await sts.assumeRole(
            'acs:ram::1662738271656542:role/maopaorobot', {
                "Statement": [
                    {
                        "Action": [
                            "oss:*"
                        ],
                        "Effect": "Allow",
                        "Resource": ["acs:oss:*:*:vgame-jfq/*"]
                    }
                ],
                "Version": "1"
            }, 30 * 60, '123456');
        return token
    } catch (e) {
        console.log(e);
    }
}
module.exports = assumeRole