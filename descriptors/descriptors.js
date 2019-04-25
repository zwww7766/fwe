/**
 * Created by zhy on 2019/2/11.
 */

export function timeCount(){
    /**
     *  descriptor elements
     *  1.writable。该property是否可写。
     *  2.enumerable。当使用for/in语句时，该property是否会被枚举。
     *  3.configurable。该property的属性是否可以修改，property是否可以删除。
     *
     *  target, class name
     *  key, element name
     */
    return function (target, key, descriptor) {
        descriptor.enumerable = 'false';
        let fn = descriptor.value
        descriptor.value = function () {
            let start = Date.parse(new Date())
            fn()
            let end = Date.parse(new Date())
            console.log(`differ time ${end - start}`)
        }
        return descriptor;
    }
}
