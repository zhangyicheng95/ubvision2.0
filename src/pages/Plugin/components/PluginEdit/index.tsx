import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete, Dropdown, Menu, Popconfirm, Badge, Splitter, Select, Divider, Col, Row, InputNumber, Radio, Checkbox, Switch } from 'antd';
import {
  EditOutlined, MinusCircleOutlined, QuestionCircleOutlined, FolderAddOutlined, FolderOpenOutlined, FolderOutlined, LaptopOutlined, PlusOutlined, ProjectOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { login } from '@/services/auth';
import { cryptoEncryption, downFileFun, formatJson, getUserAuthList, sortList } from '@/utils/utils';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import PrimaryTitle from '@/components/PrimaryTitle';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setLoading } from '@/redux/actions';
import { deletePlugin, getPlugin, getPluginList, updatePlugin } from '@/services/flowPlugin';
import BasicTable from '@/components/BasicTable';
import moment from 'moment';
import TooltipDiv from '@/components/TooltipDiv';
import { outputTypeObj, pluginsNameIcon, portTypeObj } from '@/pages/Flow/common/constants';
import { openFolder } from '@/api/native-path';
import Measurement from '@/components/Measurement';
import IpInput from '@/components/IpInputGroup';
import SliderGroup from '@/components/SliderGroup';

interface Props { }

const PluginEditPage: React.FC<Props> = (props: any) => {
  const { projectList, pluginList } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue } = form;
  const [pluginInfo, setPluginInfo] = useState<any>({});

  const initPlugin = (data: any) => {
    try {
      const { config = {} } = data;
      const { initParams = {}, input = {}, output = {}, group = [] } = config;
      const resultData = {
        ...data,
        config: {
          ...config,
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
                },
              };
            },
            {}
          ),
          initParams: (Object.entries(initParams) || []).reduce(
            (pre, cen: [any, any]) => {
              return {
                ...pre,
                [cen[0]]: {
                  ...cen[1],
                  ...(!_.isUndefined(cen[1].value) && !_.isNull(cen[1].value)
                    ? {}
                    : {
                      value: cen[1].default || undefined,
                    }),
                },
              };
            },
            {}
          ),
        },
      };
      console.log(resultData);
      setPluginInfo(resultData);
      setFieldsValue(
        resultData.alias
          ? resultData
          : { ...resultData, alias: `${resultData.name}_别名` }
      );
    } catch (err) {
      message.error('json文件解析异常，请检查文件格式', 5);
    }
  };
  // 根据id获取插件内容
  useEffect(() => {
    if (id) {
      // pluginApi.get(id).then((res: any) => {
      getPlugin(id).then((res: any) => {
        if (!!res && res.code === 'SUCCESS') {
          initPlugin(res.data);
        } else {
          message.error(res?.message || '接口异常');
        }
      });
    } else {
      navigate(-1);
    }
  }, [id]);
  // 添加属性
  const onAddInitParams = (item: any) => {
    if (!item) {
      return;
    }
    console.log(item);

  };
  // 插件列表
  const items: any = useMemo(() => {
    return (Object.entries(outputTypeObj) || [])?.map?.((res: any, index: number) => {
      return {
        key: '' + index,
        label: res[0],
        children: (res[1] || [])?.map((child: any) => {
          return {
            key: `${res[0]}_${child.widget}`,
            label: <div className='only-show-one-line' onClick={() => onAddInitParams([res[0], child.widget])}>{child.title}</div>
          }
        })
      }
    })
  }, [outputTypeObj]);
  // 连接桩排序
  const onDragEnd = (dragItem: any) => {
    if (!dragItem.destination || (dragItem.source.index === dragItem.destination.index)) return;
    const list = Object.entries(pluginInfo.config?.input)
      ?.map((res: any) => {
        return {
          ...res[1],
          direction: 'input',
          name: res[0]
        }
      })
      .concat(
        Object.entries(pluginInfo.config?.output)
          ?.map((res: any) => {
            return {
              ...res[1],
              direction: 'output',
              name: res[0]
            }
          })
      );
    const result = sortList(dragItem.source.index, dragItem.destination.index, list)
      ?.map((item: any, index) => ({
        ...item,
        sort: index
      }));
    setPluginInfo((prev: any) => ({
      ...prev,
      config: {
        ...prev?.config || {},
        input: result?.filter((i) => i.direction === 'input')?.reduce((pre: any, cen: any) => {
          return {
            ...pre,
            [cen.name]: cen
          }
        }, {}),
        output: result?.filter((i) => i.direction === 'output')?.reduce((pre: any, cen: any) => {
          return {
            ...pre,
            [cen.name]: cen
          }
        }, {}),
      }
    }));
  };
  // 保存
  const onSave = useCallback(() => {
    validateFields()
      .then((values) => {
        const params = {
          ...pluginInfo,
          ...values
        };
        updatePlugin(id, params).then((res) => {
          if (!!res && res.code === 'SUCCESS') {
            message.success('修改成功');
            navigate(-1);
          } else {
            message.error(res?.message || '接口异常');
          }
        });
      })
      .catch((err) => {
        const { errorFields } = err;
        errorFields?.length && message.error(`${errorFields[0]?.errors[0]} 是必填项`);
      });
  }, [pluginInfo]);

  return (
    <div className={styles.PluginEditPage}>
      <PrimaryTitle title={`插件编辑 ${pluginInfo.name}`} style={{ marginBottom: 8 }}>
        <Button onClick={() => navigate(-1)}>返回</Button>
        <Button type="primary" onClick={() => onSave()}>保存</Button>
      </PrimaryTitle>
      <div className="flex-box plugin-edit-body">
        <Splitter>
          <Splitter.Panel defaultSize="20%" min="10%" max="30%">
            <div className="plugin-edit-body-left">
              {
                useMemo(() => {
                  return <Menu
                    defaultOpenKeys={Array.from({ length: 30 })?.map?.(
                      (i, index) => '' + index
                    )}
                    mode="inline"
                    items={items}
                    selectable={false}
                  />
                }, [])
              }
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            <div className="plugin-edit-body-center">
              <Divider>基本信息</Divider>
              <Form
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                // layout={'vertical'}
                scrollToFirstError
              >
                <Form.Item
                  name="name"
                  label="插件名称"
                  tooltip="插件名称信息，不可更改"
                  rules={[{ required: true, message: '插件名称' }]}
                >
                  <Input placeholder="请输入插件名称" disabled />
                </Form.Item>
                <Form.Item
                  name="alias"
                  label="插件别名"
                  tooltip="插件别名信息"
                  rules={[{ required: true, message: '插件别名' }]}
                >
                  <Input placeholder="请输入插件名称" />
                </Form.Item>
                <Form.Item
                  name="version"
                  label="插件版本"
                  tooltip="插件版本信息"
                  initialValue="0.0.1"
                  rules={[{ required: true, message: '插件版本' }]}
                >
                  <Input placeholder="请输入插件版本" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="描述"
                  tooltip="插件描述信息"
                  rules={[{ required: false, message: '描述' }]}
                >
                  <Input.TextArea
                    autoSize={{ minRows: 5, maxRows: 10 }}
                    placeholder="请输入描述"
                    className="scrollbar-style"
                  />
                </Form.Item>
                <Form.Item
                  name="category"
                  label="所属分组"
                  tooltip="插件所属分组"
                  initialValue={false}
                  rules={[{ required: true, message: '所属分组' }]}
                >
                  <Select
                    options={(Object.entries(pluginsNameIcon) || [])?.map?.((res: any) => {
                      return {
                        label: <TooltipDiv>{`${res[0]}（${res[1].description}）`}</TooltipDiv>,
                        value: res[0],
                        key: res[0]
                      }
                    }).filter(Boolean)}
                  />
                </Form.Item>
              </Form>
              <Divider>连接桩</Divider>
              {
                useMemo(() => {
                  return ['input', 'output'].map((type: string) => {
                    return <div
                      className='plugin-edit-body-center-port'
                      key={`plugin-edit-body-center-port-${type}`}
                    >
                      <div className='plugin-edit-body-center-port-title'>{type === 'input' ? '入度' : '出度'}</div>
                      <div className="plugin-edit-body-center-port-body">
                        <DragDropContext onDragEnd={onDragEnd}>
                          <Droppable droppableId={`droppable-${type}`}>
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef}>
                                {
                                  (Object.entries(pluginInfo?.config?.[type] || {}))
                                    ?.sort((a: any, b: any) => a[1].sort - b[1].sort)
                                    ?.map((res: any, index: number) => {
                                      return <Draggable
                                        key={res[0]}
                                        draggableId={`${type}$%$${res[0]}`}
                                        index={res[1].sort || (index + (type === 'output' ? Object.keys(pluginInfo?.config?.input)?.length : 0))}
                                      >
                                        {(provided) => {
                                          return <div
                                            className="flex-box plugin-edit-body-center-port-body-item"
                                            key={`plugin-edit-body-center-port-body-item-${res[0]}`}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                              ...provided.draggableProps.style,
                                            }}
                                          >
                                            <div className="flex-box plugin-edit-body-center-port-body-item-content">
                                              <TooltipDiv style={{ color: portTypeObj[res[1]?.type]?.color || portTypeObj.default || '#165b5c' }}>
                                                {`${res[0]} - ${res[1].alias}`}
                                              </TooltipDiv>
                                            </div>
                                            <div className="flex-box plugin-edit-body-center-port-body-item-operation">
                                              <EditOutlined
                                                onClick={() => {

                                                }}
                                              />
                                              <Popconfirm
                                                title="确定删除当前链接桩?"
                                                onConfirm={() => {

                                                }}
                                              >
                                                <MinusCircleOutlined />
                                              </Popconfirm>
                                            </div>
                                          </div>
                                        }}
                                      </Draggable>
                                    })
                                }
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>
                    </div>
                  })
                }, [pluginInfo?.config?.input, pluginInfo?.config?.output])
              }
              <Divider>插件属性</Divider>
              <div className="plugin-edit-body-center-param">
                {
                  useMemo(() => {
                    if (!pluginInfo?.config?.initParams) return null;
                    return Object.entries(pluginInfo?.config?.initParams)?.map((res: any) => {
                      return <div
                        className="plugin-edit-body-center-param-item"
                        key={`plugin-edit-body-center-param-item-${res[0]}`}
                      >
                        <InitParamsObject
                          className="plugin-item-content"
                          item={res[1]}
                          ifCanModify
                          onEdit={() => { }}
                          onRemove={() => { }}
                        />
                      </div>
                    });
                  }, [pluginInfo?.config?.initParams])
                }
              </div>
            </div>
          </Splitter.Panel>
          <Splitter.Panel defaultSize="30%" min="20%" max="50%">
            <div className="plugin-edit-body-right">

            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
};

export default PluginEditPage;

const InitParamsObject = (props: any) => {
  const {
    item = {},
    ifCanModify = false,
    onlyShowPanel = false,
    className = '',
    onEdit,
    onRemove,
    span = 16,
  } = props;
  const {
    name,
    alias,
    type: inputType,
    widget = {},
    default: defaultValue,
    description = '',
    value,
    language,
    localPath,
    require,
  } = item;
  let {
    max,
    min,
    options = [],
    precision,
    step,
    suffix,
    type,
    length,
  } = widget;
  if (_.isArray(options) && _.isString(options[0])) {
    options = (options || [])?.map?.((option: string) => ({
      label: option,
      value: option,
    }));
  }
  const required = require ? '是' : '否';
  switch (type) {
    case 'Input':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <Input
                  disabled
                  value={value || defaultValue}
                  className="plugin-style"
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'IpInput':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <IpInput
                  disabled
                  value={value || defaultValue}
                  className="plugin-style"
                  length={length}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'InputNumber':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <InputNumber
                  disabled
                  className="plugin-style"
                  precision={precision}
                  step={step}
                  max={max}
                  min={min}
                  value={value || value == 0 ? value : defaultValue}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      步长：{step}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      精度：{precision}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      最大值：{max}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      最小值：{min}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Slider':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <SliderGroup
                  disabled
                  className="plugin-style"
                  step={step}
                  max={max}
                  min={min}
                  precision={precision}
                  value={value || value == 0 ? value : defaultValue}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      步长：{step}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      最大值：{max}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      最小值：{min}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      初始值：{defaultValue}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      默认值：{value}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      是否必填项：{required}
                    </Col>
                    <Col span={11} offset={1} className="text-style"></Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Radio':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <div className="plugin-style">
                  <Radio.Group
                    value={
                      _.isArray(value)
                        ? value[0]
                        : _.isArray(defaultValue)
                          ? defaultValue[0]
                          : defaultValue
                    }
                  >
                    {(options || [])?.map?.((option: any) => {
                      const { id, label, value } = option;
                      return (
                        <Radio key={id || value} value={value}>
                          {label}
                        </Radio>
                      );
                    })}
                  </Radio.Group>
                </div>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：
                      {_.isArray(defaultValue) ? defaultValue[0] : defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{_.isArray(value) ? value[0] : value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'TagRadio':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <div className="plugin-style">
                  <Select
                    value={value || defaultValue}
                    className="plugin-style"
                    options={options?.map((item: any) => item.name)}
                  />
                </div>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：
                      {_.isArray(defaultValue) ? defaultValue[0] : defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{_.isArray(value) ? value[0] : value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'AlgoList':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <Select
                  value={value || defaultValue}
                  className="plugin-style"
                  options={(options || [])?.map?.((option: any) => {
                    const { id, label, value } = option;
                    return {
                      key: id,
                      value,
                      label
                    }
                  })}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：
                      {_.isArray(defaultValue) ? defaultValue[0] : defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{_.isArray(value) ? value[0] : value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Select':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <Select
                  value={value || defaultValue}
                  className="plugin-style"
                  options={(options || [])?.map?.((option: any) => {
                    const { id, label, value } = option;
                    return {
                      key: id,
                      value,
                      label
                    }
                  })}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：
                      {_.isArray(defaultValue) ? defaultValue[0] : defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{_.isArray(value) ? value[0] : value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'MultiSelect':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <Select
                  mode="multiple"
                  value={value || defaultValue}
                  className="plugin-style"
                  options={(options || [])?.map?.((option: any) => {
                    const { id, label, value } = option;
                    return {
                      key: id,
                      value,
                      label
                    }
                  })}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：
                      {_.isArray(defaultValue)
                        ? defaultValue.join('，')
                        : defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{_.isArray(value) ? value.join('，') : value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Checkbox':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <div className="plugin-style">
                  <Checkbox.Group
                    options={options}
                    value={value || defaultValue}
                  />
                </div>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：
                      {_.isArray(defaultValue)
                        ? defaultValue.join('，')
                        : defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{_.isArray(value) ? value.join('，') : value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Switch':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <div className="plugin-style">
                  <Switch
                    checked={_.isBoolean(value) ? value : !!defaultValue}
                  />
                </div>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{defaultValue ? 'true' : 'false'}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{value ? 'true' : 'false'}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'File':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <a
                  className="plugin-style"
                  onClick={() =>
                    value || defaultValue
                      ? openFolder(value || defaultValue, true)
                      : null
                  }
                >
                  {value || defaultValue || '暂无默认值'}
                </a>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      可选后缀类型：{_.isArray(suffix) && suffix.join('，')}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      是否必填项：{required}
                    </Col>
                    <Col span={11} offset={1} className="text-style"></Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Dir':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <a
                  className="plugin-style"
                  onClick={() =>
                    value || defaultValue
                      ? openFolder(value || defaultValue)
                      : null
                  }
                >
                  {value || defaultValue || '暂无默认值'}
                </a>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'codeEditor':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <Input.TextArea
                  rows={5}
                  value={
                    language === 'json' && _.isObject(value)
                      ? formatJson(value)
                      : value
                  }
                  style={{ marginBottom: 8 }}
                  disabled
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => onEdit()}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => onRemove()}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：
                      {_.isString(defaultValue)
                        ? defaultValue
                        : JSON.stringify(defaultValue)}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：
                      {_.isString(value) ? value : JSON.stringify(value)}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'ImageLabelField':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <a
                  className="plugin-style"
                  onClick={() =>
                    localPath || value || defaultValue
                      ? openFolder(value || defaultValue, true)
                      : null
                  }
                >
                  {localPath || value || defaultValue || '暂无默认值'}
                </a>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{localPath || defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{localPath || value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Measurement':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <Measurement
                  className="plugin-style"
                  disabled
                  value={value || defaultValue}
                  precision={precision}
                  step={step}
                  max={max}
                  min={min}
                  type={inputType}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{JSON.stringify(defaultValue)}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{JSON.stringify(value)}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'DataMap':
      const valueDataMap = value || defaultValue || options?.reduce((pre: any, cen: any) => {
        const { label, value } = cen;
        return { ...pre, [label]: value };
      }, {});
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <Input.TextArea
                  rows={5}
                  value={_.isObject(valueDataMap) ? formatJson(valueDataMap) : valueDataMap}
                  style={{ marginBottom: 8 }}
                  disabled
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{JSON.stringify(defaultValue)}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{JSON.stringify(value)}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'NestMap':
      const valueNestMap = value || defaultValue || options?.reduce((pre: any, cen: any) => {
        const { label, value } = cen;
        return { ...pre, [label]: value };
      }, {});
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <Input.TextArea
                  rows={5}
                  value={_.isObject(valueNestMap) ? formatJson(valueNestMap) : valueNestMap}
                  style={{ marginBottom: 8 }}
                  disabled
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{JSON.stringify(defaultValue)}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{JSON.stringify(value)}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    default:
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              <TooltipDiv title={alias || name}>{alias || name}</TooltipDiv>:
              {description ? (
                <TooltipDiv title={description} style={{ marginLeft: 8 }}>
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 16} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box">
                <a className="plugin-style">暂无面板类型，请配置</a>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      类型：{type}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      初始值：{defaultValue}
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      默认值：{value}
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      是否必填项：{required}
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
  }
};