import * as _ from 'lodash-es';
/**
 * 授权校验规则：
 * 1.累计运行计数>允许的计数
 * 2.当前时间>授权到期的日期
 * 3.当前时间<授权那一时刻(防止调电脑时间)
 * 4.当前机器编码 ！== 机器编码
 * 
 * local：已经授权的信息
 * local.num：授权允许的总计数（计数1就是1个小时）
 * local.time：授权到期的日期（授权那一时刻+授权天数）
 * local.today：授权码生成那一时刻
 * local.empowerId：机器编码
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
        center.hostName !== local.hostName;
};