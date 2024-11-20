import { notification } from 'antd';
import { Group } from './config/shape';

// 创建分组
export const createGroup = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    attrs: { label: any },
) => {
    const group: any = new Group({
        id,
        x,
        y,
        width,
        height,
        shape: 'dag-group',
        customId: id,
        attrs: Object.assign({}, attrs, {
            body: {
                fill:
                    localStorage.getItem('theme-mode') === 'dark'
                        ? '#2E394D'
                        : '#fefefe',
            },
            label: {
                ...attrs.label,
                fill:
                    localStorage.getItem('theme-mode') === 'dark'
                        ? '#fefefe'
                        : '#2E394D',
            },
        }),
        zIndex: 0,
    });
    return group;
};
// 格式化节点的连接桩
export const formatPorts = (list: any) => {
    const prePorts = [].concat(list || []);
    const topPorts = (prePorts || [])
        ?.filter((i: any) => i.group === 'top')
        ?.map?.((item: any, index: number) => {
            return {
                ...item,
                sort: index,
                type: item?.label?.type,
                label: {
                    ...item?.label,
                    sort: index,
                }
            }
        })?.sort((a: any, b: any) => a?.sort - b?.sort);
    const bottomPorts = (prePorts || [])
        ?.filter((i: any) => i.group === 'bottom')
        ?.map?.((item: any, index: number) => {
            return {
                ...item,
                sort: (prePorts || [])?.filter((i: any) => i.group === 'top')?.length + index,
                type: item?.label?.type,
                label: {
                    ...item?.label,
                    sort: (prePorts || [])?.filter((i: any) => i.group === 'top')?.length + index,
                }
            }
        })?.sort((a: any, b: any) => a?.sort - b?.sort);
    return { topPorts, bottomPorts };
};
// 告警提示框
notification.config({
    placement: 'topRight',
    // @ts-ignore
    stack: false,
    rtl: true, // 是否开启 RTL 模式
    top: 60,  // 消息从顶部弹出时，距离顶部的位置，单位像素
    maxCount: 3, // 最大显示数，超过限制时，最早的消息会被自动关闭
});
export const openNotificationWithIcon = (item: any, onClose?: any) => {
    const { key, type = '', title = '', content = '' } = item;
    return notification[type === 'WARNING' ? 'warning' : 'error']({
        key,
        message: title,
        description: content,
        duration: type === 'CRITICAL' ? null : type === 'WARNING' ? 5 : 10, // 自动关闭时间，null表示不关闭
    });
};