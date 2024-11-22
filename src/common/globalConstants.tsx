import { outputTypeObj } from '@/pages/Flow/common/constants';
import * as _ from 'lodash-es';
// 用户权限类型
export const userType: any = {
    user: '普通用户',
    admin: '管理员',
    superAdmin: '超级管理员',
};
/**
 * 授权校验规则：
 * 1.累计运行计数>允许的计数
 * 2.当前时间>授权到期的日期
 * 3.当前时间<授权那一时刻(防止调电脑时间)
 * 4.当前时间<(授权那一刻+已经累计的计数)
 * 5.当前机器编码 ！== 机器编码
 * 
 * local：已经授权的信息
 * local.num：授权允许的总计数（计数1就是1个小时）
 * local.time：授权到期的日期（授权那一时刻+授权天数）
 * local.today：授权码生成那一时刻
 * local.empowerId：机器编码（硬盘编码.主板序列号.MAC地址）
 * 
 * center：当前信息
 * center.useNum：已经累计的计数（计数1就是1个小时）
 * center.time：授权那一时刻
 * center.today：当前时间
 * center.hostName：当前机器编码
 */
interface localProps {
    num: number;
    time: number;
    hostName: string;
};
interface centerProps {
    useNum: number;
    time: number;
    today: number;
    hostName: string;
};
export const permissionRule = (local: localProps, center: centerProps) => {
    return center?.useNum > local?.num
        ||
        center.today >= local?.time
        ||
        center.today <= center.time
        ||
        center.today <= (center.time + center.useNum * 3600 * 1000)
        ||
        center.hostName !== local.hostName;
};
// 判断字符串是不是图片链接
export const isImgFun = (item: string) => {
    return (
        item?.indexOf('http') > -1 &&
        (item?.indexOf('jpg') > -1 ||
            item?.indexOf('jpeg') > -1 ||
            item?.indexOf('png') > -1 ||
            item?.indexOf('bmp') > -1)
    );
};
// 判断字符串是不是3D链接
export const is3DFun = (item: string) => {
    return (
        item?.indexOf('http') > -1 &&
        (item?.indexOf('ply') > -1 || item?.indexOf('pcd') > -1 || item?.indexOf('stl') > -1)
    );
};
// notification配置项
export const notificationSetting: any = {
    placement: 'topRight',
    stack: false,
    rtl: false, // RTL 模式,开启的话，文字会向右对齐
    top: 80,  // 消息从顶部弹出时，距离顶部的位置，单位像素
    maxCount: 3, // 最大显示数，超过限制时，最早的消息会被自动关闭
};

// 上传插件，格式化
export const formatPlugin = (item: any) => {
    const {
        initParams = {},
        input = {},
        output = {},
        group = [],
    } = item?.config || {};
    const resultData = {
        buildIn: false,
        ...item,
        ...(item?.alias ? {} : { alias: `${item.name}_别名` }),
        config: {
            ...(item?.config || {}),
            input: (Object.entries(input) || []).reduce(
                (pre, cen: [any, any]) => {
                    return {
                        ...pre,
                        [cen[0]]: {
                            ...cen[1],
                            ...(cen[1].alias
                                ? {}
                                : {
                                    alias: cen[0] || undefined,
                                }),
                            ...(cen[1].type
                                ? {}
                                : {
                                    type: 'any',
                                }),
                            direction: 'input'
                        },
                    };
                },
                {}
            ),
            output: (Object.entries(output) || []).reduce(
                (pre, cen: [any, any]) => {
                    return {
                        ...pre,
                        [cen[0]]: {
                            ...cen[1],
                            ...(cen[1].alias
                                ? {}
                                : {
                                    alias: cen[0] || undefined,
                                }),
                            ...(cen[1].type
                                ? {}
                                : {
                                    type: 'any',
                                }),
                            direction: 'output'
                        },
                    };
                },
                {}
            ),
            initParams: (Object.entries(initParams) || []).reduce(
                (pre, cen: [any, any]) => {
                    return {
                        ...pre,
                        [cen[0]]: Object.assign(
                            {},
                            cen[1],
                            !_.isUndefined(cen[1].value) && !_.isNull(cen[1].value)
                                ? {}
                                : {
                                    value: cen[1].default || '',
                                },
                            !!(
                                outputTypeObj[cen[1].type] &&
                                outputTypeObj[cen[1].type].filter(
                                    (i: any) => i.widget === cen[1]?.widget?.type
                                )
                            )
                                ? {}
                                : {
                                    type: 'string',
                                    widget: Object.assign({}, cen[1].widget, {
                                        type: 'Input',
                                    }),
                                }
                        ),
                    };
                },
                {}
            ),
        },
        updatedAt: new Date(),
    };
    return resultData;
};