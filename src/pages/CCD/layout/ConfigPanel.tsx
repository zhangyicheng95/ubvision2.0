import React, { Fragment } from 'react';
import * as _ from 'lodash-es';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';
import { Button, Divider, Form, Input, InputNumber, Select, Switch, Tabs } from 'antd';
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

interface Props {
    editItem: any;
    setEditItem: any;
    form: any;
    onSave: any;
}

const ConfigPanel: React.FC<Props> = (props: any) => {
    const { editItem, setEditItem, form, onSave = null } = props;
    const { canvasData, selectedNode } = useSelector((state: IRootActions) => state);
    const dispatch = useDispatch();
    console.log(editItem);
    const items: any = [
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
            </Fragment>
        },
        {
            key: '2',
            label: '通用配置',
            children: <Fragment>
                <Form.Item
                    name={`alias`}
                    label="窗口标题"
                    rules={[{ required: true, message: '窗口名称' }]}
                >
                    <Input placeholder="请输入窗口名称" />
                </Form.Item>
                <Form.Item
                    name={'titlePaddingSize'}
                    label="标题内边距"
                    initialValue={0}
                    rules={[{ required: false, message: '标题内边距' }]}
                >
                    <InputNumber min={0} />
                </Form.Item>
                <Form.Item
                    name="titleFontSize"
                    label="标题字号"
                    initialValue={24}
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
                                label: 'header背景图',
                            },
                            {
                                value: dataHeaderImage2,
                                label: 'header背景图2',
                            },
                            {
                                value: 'border',
                                label: '圆角边框',
                            }
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    name={'bodyPaddingSize'}
                    label="内容内边距"
                    initialValue={0}
                    rules={[{ required: false, message: '内容内边距' }]}
                >
                    <InputNumber min={0} />
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
            children: <Fragment>
                {/* <Form.Item
  name={`pushData`}
  label="数据推送"
  valuePropName="checked"
  rules={[{ required: false, message: '数据推送' }]}
>
  <Switch />
</Form.Item> */}
            </Fragment>
        },
    ];


    return (
        <div className="flex-box-column ccd-main-box-config-panel">
            <div className="ccd-main-box-config-panel-title">
                窗口属性编辑 - {editItem?.alias || editItem?.name}
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
