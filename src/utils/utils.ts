import { message } from 'antd';
import * as _ from 'lodash-es';
import Base64 from 'base-64';

//获取用户信息
export function getUserData() {
    try {
        const res = JSON.parse(localStorage.getItem('userInfo') || "{}");
        return res;
    } catch (err) {
        return {};
    }
}
//获取用户权限
export function getUserAuth() {
    const res = getUserData();
    return res?.auth || [];
}
//获取用户权限列表
export function getUserAuthList() {
    const res = getUserData();
    return res?.authList || [];
}
//获取用户登录时间
export function getLoginTime() {
    const res = getUserData();
    return res?.loginTime || 0;
}
// 加盐
export function getRandomSalt() {
    return Math.random().toString().slice(2, 5);
}
// base64加密
export function cryptoEncryption(message: string) {
    message = message.padEnd(32, 'ubvision');
    var encodeStr = Base64.encode(message);
    return encodeStr;
}
// base64解密
export function cryptoDecrypt(message: string) {
    message = message.padEnd(32, 'ubvision');
    var decodeStr = Base64.decode(message);
    return decodeStr;
}
// 生成唯一id,8位数
export const guid = () => {
    return 'xxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * uuid,32位
 */
export const getuid = () => {
    var s: any = [];
    var hexDigits = '0123456789abcdef';
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    var uuid = s.join('');
    return uuid;
};
/**
 * 复制到剪切板
 * @param {any} str
 */
export function copyUrlToClipBoard(str: string) {
    var input: any = document.createElement('input');
    input.style.opacity = 0;
    document.body.appendChild(input);
    input.setAttribute('value', str);
    input.select();
    document.execCommand('copy'); // 执行浏览器复制命令
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        message.success('已复制到剪切板');
    }
    document.body.removeChild(input);
}
/** *
 * 将params转为 a=b&c=d 格式
 * @param params
 */
export function parseParamsToUrl(params: any) {
    let queryParam: any = null;
    if (params) {
        const keys = Object.keys(params);

        keys.forEach((key) => {
            const _value =
                typeof params[key] === 'object'
                    ? JSON.stringify(params[key])
                    : params[key];
            queryParam = queryParam
                ? `${queryParam}&${key}=${_value}`
                : `${key}=${_value}`;
        });
    }
    return queryParam;
}
// url的参数转换成对象
export function GetQueryObj(url: string) {
    let arr = url?.split('?') || [];
    let params = (!!arr?.[1] ? arr?.[1] : arr?.[0])?.split('&') || [];
    let obj: any = {};
    for (let i = 0; i < params.length; i++) {
        let param = params[i].split('=');
        obj[param[0]] = param[1];
    }
    return obj;
}
// 后端接口返回数据格式化
export function formatResponse(res: any) {
    if (res.data && _.isObject(res.data)) {
        for (const key in res.data) {
            switch (key) {
                case 'error_code':
                    res.data.code = res.data.error_code;
                    if (res.data.error_code == '000000') {
                        res.data.code = 100000;
                    }
                    delete res.data.error_code;
                    break;
                case 'error_msg':
                    res.data.msg = res.data.error_msg;
                    if (res.data.error_msg == '请求成功') {
                        res.data.status = 'success';
                    } else {
                        res.data.status = 'failed';
                    }
                    delete res.data.error_msg;
                    break;
                default:
                    break;
            }
        }
    }
    return res;
};
// 毫秒转为 天时分秒
export function timeToString(time: number) {
    const d = parseInt(time / (24 * 60 * 60 * 1000) + '') || 0;
    const h =
        parseInt((time - d * 24 * 60 * 60 * 1000) / (60 * 60 * 1000) + '') || 0;
    const m =
        parseInt(
            (time - d * 24 * 60 * 60 * 1000 - h * 60 * 60 * 1000) / (60 * 1000) + ''
        ) || 0;
    const s =
        parseInt(
            (time - d * 24 * 60 * 60 * 1000 - h * 60 * 60 * 1000 - m * 60 * 1000) /
            1000 +
            ''
        ) || 0;
    return { d, h, m, s };
};
/**
 * 公共导出方法，支持ie10
 * @param data
 * @param name
 */
export function downFileFun(data = '{}', name = '') {
    const blob = new Blob([data], { type: 'application/x-sql;charset=UTF-8' });
    // @ts-ignore
    if (window.navigator && window.navigator?.msSaveOrOpenBlob) {
        // @ts-ignore
        window.navigator?.msSaveOrOpenBlob?.(blob, name);
    } else {
        const a = document.createElement('a');
        a.download = name;
        a.style.display = 'none';
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}