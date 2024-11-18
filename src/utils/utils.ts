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
};
/**
 * 清理所有的时间定时器
 */
export function clearAllInterval() {
    const qc: any = setInterval(() => { }, 1) || 100;
    for (let i = 0; i <= qc; i++) {
        clearInterval(i);
    }
};
/**
 * json转string
 * @param jsonObj json数据
 * @param callback 回调函数
 * @returns 
 */
export function transitionJsonToString(jsonObj: any, callback?: any) {
    // 转换后的jsonObj受体对象
    var _jsonObj = null;
    // 判断传入的jsonObj对象是不是字符串，如果是字符串需要先转换为对象，再转换为字符串，这样做是为了保证转换后的字符串为双引号
    if (Object.prototype.toString.call(jsonObj) !== '[object String]') {
        try {
            _jsonObj = JSON.stringify(jsonObj);
        } catch (error) {
            // 转换失败错误信息
            console.error('您传递的json数据格式有误，请核对...');
            console.error(error);
            callback(error);
        }
    } else {
        try {
            jsonObj = jsonObj.replace(/(\')/g, '"');
            _jsonObj = JSON.stringify(JSON.parse(jsonObj));
        } catch (error) {
            // 转换失败错误信息
            console.error('您传递的json数据格式有误，请核对...');
            console.error(error);
            callback(error);
        }
    }
    return _jsonObj;
}
/**
 * 格式化公共方法
 * @param jsonObj 需要格式化的数据
 * @param callback 为数据格式化错误的时候处理函数
 * @returns 
 */
export function formatJson(jsonObj: any, callback?: any) {
    if (typeof jsonObj === 'string') return jsonObj.trim();
    // 正则表达式匹配规则变量
    var reg = null;
    // 转换后的字符串变量
    var formatted = '';
    // 换行缩进位数
    var pad = 0;
    // 一个tab对应空格位数
    var PADDING = '    ';
    // json对象转换为字符串变量
    var jsonString: any = transitionJsonToString(jsonObj, callback);
    if (!jsonString) {
        return jsonString;
    }
    // 存储需要特殊处理的字符串段
    var _index: any = [];
    // 存储需要特殊处理的“再数组中的开始位置变量索引
    var _indexStart: any = null;
    // 存储需要特殊处理的“再数组中的结束位置变量索引
    var _indexEnd: any = null;
    // 将jsonString字符串内容通过\r\n符分割成数组
    var jsonArray: any = [];
    // 正则匹配到{,}符号则在两边添加回车换行
    jsonString = jsonString.replace(/([\{\}])/g, '\r\n$1\r\n');
    // 正则匹配到[,]符号则在两边添加回车换行
    jsonString = jsonString.replace(/([\[\]])/g, '\r\n$1\r\n');
    // 正则匹配到,符号则在两边添加回车换行
    jsonString = jsonString.replace(/(\,)/g, '$1\r\n');
    // 正则匹配到要超过一行的换行需要改为一行
    jsonString = jsonString.replace(/(\r\n\r\n)/g, '\r\n');
    // 正则匹配到单独处于一行的,符号时需要去掉换行，将,置于同行
    jsonString = jsonString.replace(/\r\n\,/g, ',');
    // 特殊处理双引号中的内容
    jsonArray = jsonString.split('\r\n');
    jsonArray.forEach(function (node: any, index: number) {
        // 获取当前字符串段中"的数量
        var num = node.match(/\"/g) ? node.match(/\"/g).length : 0;
        // 判断num是否为奇数来确定是否需要特殊处理
        if (num % 2 && !_indexStart) {
            _indexStart = index;
        }
        if (num % 2 && _indexStart && _indexStart != index) {
            _indexEnd = index;
        }
        // 将需要特殊处理的字符串段的其实位置和结束位置信息存入，并对应重置开始时和结束变量
        if (_indexStart && _indexEnd) {
            _index.push({
                start: _indexStart,
                end: _indexEnd,
            });
            _indexStart = null;
            _indexEnd = null;
        }
    });
    // 开始处理双引号中的内容，将多余的"去除
    _index.reverse().forEach(function (item: any, index: number) {
        var newArray = jsonArray.slice(item.start, item.end + 1);
        jsonArray.splice(item.start, item.end + 1 - item.start, newArray.join(''));
    });
    // 奖处理后的数组通过\r\n连接符重组为字符串
    jsonString = jsonArray.join('\r\n');
    // 将匹配到:后为回车换行加大括号替换为冒号加大括号
    jsonString = jsonString.replace(/\:\r\n\{/g, ':{');
    // 将匹配到:后为回车换行加中括号替换为冒号加中括号
    jsonString = jsonString.replace(/\:\r\n\[/g, ':[');
    // 将上述转换后的字符串再次以\r\n分割成数组
    jsonArray = jsonString.split('\r\n');
    // 将转换完成的字符串根据PADDING值来组合成最终的形态
    jsonArray.forEach(function (item: any, index: number) {
        var i = 0;
        // 表示缩进的位数，以tab作为计数单位
        var indent = 0;
        // 表示缩进的位数，以空格作为计数单位
        var padding = '';
        if (item.match(/\{$/) || item.match(/\[$/)) {
            // 匹配到以{和[结尾的时候indent加1
            indent += 1;
        } else if (
            item.match(/\}$/) ||
            item.match(/\]$/) ||
            item.match(/\},$/) ||
            item.match(/\],$/)
        ) {
            // 匹配到以}和]结尾的时候indent减1
            if (pad !== 0) {
                pad -= 1;
            }
        } else {
            indent = 0;
        }
        for (i = 0; i < pad; i++) {
            padding += PADDING;
        }
        formatted += padding + item + '\r\n';
        pad += indent;
    });
    // 返回的数据需要去除两边的空格
    return formatted.trim();
}
/**
 * 获取字符串的实际宽度
 * @param {*} text
 * @param {*} font
 * @returns
 */
function getTextWidth(text: string, font: number) {
    // 创建一个虚拟画布
    const canvas = document.createElement('canvas');
    const ctx: any = canvas.getContext('2d');
    // 设置字体
    ctx.font = font;
    // 测量文本宽度
    const metrics = ctx.measureText(text);
    return metrics.width;
};
/**
 * 截取字符串的指定长度
 * @param {*} text
 * @param {*} font
 * @param {*} maxWidth
 * @returns
 */
function truncateText(text: string, font: number, maxWidth: number) {
    let result = '';
    let width = 0;
    for (let i = 0; i < text.length; i++) {
        // 添加下一个字符
        const char = text.charAt(i);
        result += char;
        // 计算新宽度
        width = getTextWidth(result, font);
        // 如果超过最大宽度，请返回结果
        if (width > maxWidth) {
            return result.slice(0, -1);
        }
    }
    // 如果循环结束时宽度仍小于最大宽度，请返回完整字符串
    return result;
};
/**
 *
 * @param {string} text
 * @param {object} options
 * @returns
 */
export function getActualWidthOfChars(text = '', options?: any) {
    const { size = 12, family = 'Microsoft YaHei', boxSize = 200 } = options || {};
    const length = getTextWidth(text, size);
    if (length <= boxSize) {
        return text;
    } else {
        return truncateText(text, size, boxSize - 15) + '...';
    }
}
/**
 * 数组排序
 * @param source 拖拽的节点下标
 * @param target 拖拽目标位置下标
 * @param list 排序的数组
 * @returns 
 */
export function sortList(source: number, target: number, list: any) {
    const reorderedItems = Array.from(list);
    const [removed] = reorderedItems.splice(source, 1);
    reorderedItems.splice(target, 0, removed);
    return reorderedItems || [];
}