import React, { Fragment, useEffect, useMemo, useState } from 'react';
import * as _ from 'lodash-es';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasDataAction } from '@/redux/actions';
import { Button, Cascader, Divider, Form, Input, InputNumber, Select, Switch, Tabs } from 'antd';
import dataHeaderImage from '@/assets/images/header-bg.png';
import dataHeaderImage2 from '@/assets/images/header-bg-2.png';
import dataItemImage1 from '@/assets/images/item-bg-1.png';
import dataItemImage2 from '@/assets/images/item-bg-2.png';
import dataItemImage3 from '@/assets/images/item-bg-3.png';
import dataItemImage4 from '@/assets/images/item-bg-4.png';
import dataItemImage5 from '@/assets/images/item-bg-5.png';
import dataItemImage6 from '@/assets/images/item-bg-6.png';
import dataItemImage7 from '@/assets/images/item-bg-7.png';
import dataItemImageNG from '@/assets/images/item-bg-ng.png';
import { getuid } from '@/utils/utils';

interface Props {
    data: any;
    setEditItem: any;
    form: any;
    onSave: any;
}

const ConfigPanel: React.FC<Props> = (props: any) => {
    const { data, setEditItem, form, onSave = null } = props;
    const { canvasData, selectedNode } = useSelector((state: IRootActions) => state);
    const dispatch = useDispatch();
    const [selectedNodeConfig, setSelectedNodeConfig] = useState<any>([]);
    const [sourceType, setSourceType] = useState<any>('');

    // 初始化
    useEffect(() => {
        console.log(data);
        setSourceType(data?.sourceType);
    }, [data]);
    // 数据源列表
    const dataSourceList = useMemo(() => {
        return (canvasData?.flowData?.nodes || [])?.map?.((node: any) => {
            const { name, alias, id, ports = {} } = node;
            const { items = [] } = ports;
            const result = {
                value: id,
                label: `${alias || name}`,
                children: items
                    ?.filter((i: any) => i.group === 'bottom' && i?.label?.type !== 'numpy.ndarray')
                    ?.map?.((port: any) => {
                        const { label } = port;
                        const { name, alias } = label;
                        const value = alias || name;
                        return {
                            value: name,
                            label: value,
                            // disabled: name === 'value'
                        };
                    }),
            };
            return result;
        });
    }, [canvasData?.flowData?.nodes]);
    // tab分类
    const items: any = useMemo(() => {
        return [
            {
                key: '1',
                label: '窗口属性',
                children: <Fragment>
                    <Form.Item
                        name={`x`}
                        label="横坐标"
                        rules={[{ required: true, message: '横坐标' }]}
                    >
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item
                        name={`y`}
                        label="纵坐标"
                        rules={[{ required: true, message: '纵坐标' }]}
                    >
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item
                        name={`width`}
                        label="窗口宽度"
                        rules={[{ required: true, message: '窗口宽度' }]}
                    >
                        <InputNumber min={10} />
                    </Form.Item>
                    <Form.Item
                        name={`height`}
                        label="窗口高度"
                        rules={[{ required: true, message: '窗口高度' }]}
                    >
                        <InputNumber min={10} />
                    </Form.Item>
                    <Form.Item
                        name={`rotate`}
                        label="旋转角度"
                        rules={[{ required: true, message: '旋转角度' }]}
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        name={`type`}
                        label="窗口类型"
                        rules={[{ required: false, message: '窗口类型' }]}
                    >
                        <Input disabled />
                    </Form.Item>
                </Fragment>
            },
            {
                key: '2',
                label: '通用配置',
                children: <Fragment>
                    <Form.Item
                        name={`backgroundColor`}
                        label={'窗口背景'}
                        initialValue={'default'}
                        rules={[{ required: false, message: '窗口背景' }]}
                    >
                        <Select
                            style={{ width: '100%' }}
                            options={[
                                {
                                    value: 'default',
                                    label: '默认',
                                },
                                {
                                    value: 'transparent',
                                    label: '透明色',
                                },
                                {
                                    value: 'black',
                                    label: '黑色背景',
                                },
                                {
                                    value: dataItemImage1,
                                    label: '背景图1',
                                },
                                {
                                    value: dataItemImage2,
                                    label: '背景图2',
                                },
                                {
                                    value: dataItemImageNG,
                                    label: '背景图2-NG',
                                },
                                {
                                    value: dataItemImage3,
                                    label: '背景图3',
                                },
                                {
                                    value: dataItemImage4,
                                    label: '背景图4',
                                },
                                {
                                    value: dataItemImage7,
                                    label: '数量展示',
                                },
                                {
                                    value: dataHeaderImage,
                                    label: 'header背景图1',
                                },
                                {
                                    value: dataHeaderImage2,
                                    label: 'header背景图2',
                                },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item
                        name={'paddingSize'}
                        label="窗口内边距"
                        tooltip={<div>
                            <div>单数字: 8</div>
                            <div>双数字: 8px 4px</div>
                            <div>百分比: 4% 5%</div>
                        </div>}
                        rules={[{ required: false, message: '窗口内边距' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Divider>窗口头部</Divider>
                    <Form.Item
                        name={`alias`}
                        label="窗口标题"
                        rules={[{ required: false, message: '窗口名称' }]}
                    >
                        <Input placeholder="请输入窗口名称" />
                    </Form.Item>
                    <Form.Item
                        name={'titlePaddingSize'}
                        label="标题内边距"
                        tooltip={<div>
                            <div>单数字: 8</div>
                            <div>双数字: 8px 4px</div>
                            <div>百分比: 4% 5%</div>
                        </div>}
                        rules={[{ required: false, message: '标题内边距' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="titleFontSize"
                        label="标题字号"
                        initialValue={16}
                        rules={[{ required: false, message: '窗口背景' }]}
                    >
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item
                        name={`ifShowHeader`}
                        label="展示窗口头部"
                        valuePropName="checked"
                        initialValue={false}
                        rules={[{ required: false, message: '展示窗口title' }]}
                    >
                        <Switch />
                    </Form.Item>
                    <Divider>窗口内容</Divider>
                    <Form.Item
                        name={'bodyPaddingSize'}
                        label="内容内边距"
                        tooltip={<div>
                            <div>单数字: 8</div>
                            <div>双数字: 8px 4px</div>
                            <div>百分比: 4% 5%</div>
                        </div>}
                        rules={[{ required: false, message: '内容内边距' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={'fontSize'}
                        label="内容字号"
                        initialValue={14}
                        rules={[{ required: false, message: '字号' }]}
                    >
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item
                        name="ifLocalStorage"
                        label="开启缓存"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Fragment>
            },
            {
                key: '3',
                label: '私有配置',
                children: data?.type === 'header' ?
                    <Fragment>
                        <Form.Item
                            name={`title`}
                            label={'标题'}
                            rules={[{ required: false, message: '标题' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name={`subTitle`}
                            label={'副标题'}
                            rules={[{ required: false, message: '副标题' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name={'des_layout'}
                            label="布局方向"
                            initialValue={'center'}
                            rules={[{ required: false, message: '布局方向' }]}
                        >
                            <Select
                                options={[
                                    { label: '居上', value: 'flex-start' },
                                    { label: '居中', value: 'center' },
                                    { label: '居下', value: 'flex-end' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="iconSize"
                            label="图标尺寸"
                            initialValue={24}
                            rules={[{ required: false, message: '图标尺寸' }]}
                        >
                            <InputNumber min={0} />
                        </Form.Item>
                    </Fragment>
                    :
                    <Fragment>

                    </Fragment>
            },
            {
                key: '4',
                label: '数据源',
                children: <Fragment>
                    <Form.Item
                        name={'sourceType'}
                        label="数据来源类型"
                        rules={[{ required: false, message: '数据来源类型' }]}
                    >
                        <Select
                            style={{ width: '100%' }}
                            options={[
                                {
                                    value: 'websocket',
                                    label: 'websocket 默认推送',
                                },
                                {
                                    value: 'http',
                                    label: 'http 接口拉取',
                                }
                            ]}
                            onChange={(val) => {
                                setSourceType(val);
                            }}
                        />
                    </Form.Item>
                    {
                        sourceType === 'http' ?
                            <Fragment>
                                <Form.Item
                                    name={`sourceType-fetchType`}
                                    label={'http类型'}
                                    rules={[{ required: false, message: 'http类型' }]}
                                >
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="http类型"
                                        options={['get', 'post', 'put', 'delete']
                                            ?.map?.((item: any) => ({
                                                value: item,
                                                label: _.toUpper(item),
                                            }))}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={`sourceType-url`}
                                    label={'接口地址'}
                                    rules={[{ required: false, message: '接口地址' }]}
                                >
                                    <Input placeholder="接口地址" />
                                </Form.Item>
                            </Fragment>
                            :
                            <Form.Item
                                name={'sourceType-socket'}
                                label="绑定节点"
                                rules={[{ required: false, message: '绑定节点' }]}
                            >
                                <Cascader
                                    style={{ width: '100%', zIndex: 10000 }}
                                    options={dataSourceList}
                                    showSearch
                                    onChange={(val) => {
                                        const res: any = canvasData?.flowData?.nodes.filter(
                                            (i: any) => i.id === val[0],
                                        )?.[0];
                                        if (!!res) {
                                            form.setFieldsValue({ operationList: [] });
                                            const { config = {}, ports = {} } = res;
                                            const params = ['operation', 'platForm', 'table5'].includes(data.type)
                                                ? config?.initParams
                                                : ['operation2'].includes(data.type)
                                                    ? !_.isEmpty(config?.execParams)
                                                        ? config?.execParams
                                                        : config?.initParams
                                                    : null;
                                            if (!!params && _.isObject(params)) {
                                                setSelectedNodeConfig(() =>
                                                    Object.entries(params)?.map?.((item: any) => {
                                                        return {
                                                            label: item[1]?.alias,
                                                            value: item[0],
                                                        };
                                                    }),
                                                );
                                            } else {
                                                setSelectedNodeConfig([]);
                                            }
                                            // 检测绑定的节点是否开启了数据推送，如果没开，直接打开
                                            if (val?.length === 2 && ports?.items?.length > 0) {
                                                const portList = ports?.items?.map?.((i: any) => {
                                                    if (i?.label?.name === val[1] && i?.group === 'bottom') {
                                                        return {
                                                            ...i,
                                                            label: {
                                                                ...i?.label,
                                                                pushData: true
                                                            }
                                                        }
                                                    } else {
                                                        return i;
                                                    }
                                                });
                                                const newParams = {
                                                    ...canvasData,
                                                    flowData: {
                                                        ...canvasData?.flowData,
                                                        nodes: (canvasData?.flowData?.nodes || [])?.map?.((node: any) => {
                                                            if (node.id === val[0]) {
                                                                return {
                                                                    ...node,
                                                                    ports: {
                                                                        ...node.ports,
                                                                        items: portList,
                                                                    }
                                                                }
                                                            } else {
                                                                return node;
                                                            }
                                                        })
                                                    }
                                                };
                                                dispatch(setCanvasDataAction(newParams));
                                            }
                                        }
                                    }}
                                />
                            </Form.Item>
                    }
                </Fragment>
            },
            {
                key: '5',
                label: '触发动作',
                children: <Fragment>
                </Fragment>
            },
        ];
    }, [data?.type, dataSourceList, sourceType]);

    return (
        <div className="flex-box-column ccd-main-box-config-panel">
            <div className="ccd-main-box-config-panel-title">
                窗口属性编辑 - {data?.alias || data?.name}
            </div>
            <div className="ccd-main-box-config-panel-body">
                <Form form={form} layout="vertical" scrollToFirstError>
                    <Tabs defaultActiveKey="1" items={items} />
                </Form>
            </div>
            <div className="flex-box ccd-main-box-config-panel-footer">
                <Button
                    block
                    onClick={() => {
                        setEditItem(null);
                    }}
                >
                    取消
                </Button>
                <Button
                    type="primary" block
                    onClick={() => {
                        onSave && onSave?.()
                    }}
                >保存</Button>
            </div>
        </div>
    );
};

export default ConfigPanel;
