import React, { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasDataAction, setSelectedNodeAction } from '@/redux/actions';
import {
  Button, Checkbox, DatePicker, Divider, Form, Input, InputNumber, message, Modal, Radio, Select,
  Splitter, Switch, Tabs, TabsProps,
} from 'antd';
import {
  CloudUploadOutlined, PlusOutlined, MinusOutlined, FolderOpenOutlined, FolderOutlined
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TooltipDiv from '@/components/TooltipDiv';
import { chooseFile, chooseFolder, openFolder } from '@/api/native-path';
import moment from 'moment';
import IpInput from '@/components/IpInputGroup';
import SliderGroup from '@/components/SliderGroup';
import { formatJson, getuid, guid, sortList } from '@/utils/utils';
import Measurement from '@/components/Measurement';
import { portTypeObj } from '../../common/constants';
import ShowDataPanel from '../ShowDataPanel';
import dayjs from 'dayjs';
import MonacoEditor from '@/components/MonacoEditor';

const { confirm } = Modal;
interface Props { }

const ConfigPanel: React.FC<Props> = (props: any) => {
  const { graphData, selectedNode, canvasData, canvasStart } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { validateFields } = form;
  const [saveBtnDisabled, setSaveBtnDisabled] = useState(true);
  const [selectedTab, setSelectedTab] = useState('params');
  const [portList, setPortList] = useState<any>([]);

  // 选中的节点实例
  const node = useMemo(() => {
    if (!graphData) return null;
    const nodeId = selectedNode?.split('$%$')?.[1];
    return graphData.getCellById(nodeId)
  }, [graphData, selectedNode]);
  // 根据选中的节点ID，拿到节点config
  const nodeConfig = useMemo<any>(() => {
    const { groups, nodes } = canvasData?.flowData || {};
    const selected = selectedNode?.indexOf('node_') > -1 ?
      nodes?.filter((i: any) => selectedNode?.indexOf(i?.customId) > -1)
      :
      selectedNode?.indexOf('group_') > -1 ?
        groups?.filter((i: any) => selectedNode?.indexOf(i?.customId) > -1)
        : null
      ;
    return selected?.[0] || null;
  }, [selectedNode, canvasData]);
  // 初始化配置
  useEffect(() => {
    form?.resetFields?.();
    if (selectedNode?.indexOf('node_') > -1) {
      const ports = (node?.getPorts() || []);
      setPortList(ports);
      form.setFieldsValue({
        alias: nodeConfig?.alias,
        description: nodeConfig?.description
      });
    } else {
      form.setFieldsValue({ ...canvasData });
      setSelectedTab('params');
    }
  }, [canvasData.id, nodeConfig, selectedNode]);
  // 节点不同的配置信息
  const items: TabsProps['items'] = [
    {
      key: 'params',
      label: '参数',
    },
    {
      key: 'input',
      label: '输入',
    },
    {
      key: 'output',
      label: '输出',
    },
    {
      key: 'info',
      label: '基本信息'
    },
  ];
  // 节点排序
  const onDragEnd = (dragItem: any) => {
    if (!dragItem.destination || (dragItem.source.index === dragItem.destination.index)) return;
    const reorderedItems = sortList(dragItem.source.index, dragItem.destination.index, portList);
    portSort(dragItem.source.index, dragItem.destination.index);
    const result = reorderedItems?.map((i: any, index: number) => {
      return {
        ...i,
        sort: index,
        label: {
          ...i.label,
          sort: index
        }
      }
    });
    setPortList(result);
  };
  // 排序方法函数
  const portSort = useCallback((sourceInx: number, targetInx: number) => {
    const target = {
      ...portList[sourceInx] || {},
      label: {
        ...portList[sourceInx]?.label,
        sort: portList[targetInx]?.sort,
      },
      sort: portList[targetInx]?.sort
    };
    const center = {
      ...portList[targetInx] || {},
      label: {
        ...portList[targetInx]?.label,
        sort: portList[sourceInx]?.sort,
      },
      sort: portList[sourceInx]?.sort,
    };
    const edges = graphData?.getConnectedEdges(node);
    edges?.forEach((edge: any) => {
      graphData.removeEdge(edge);
    });
    node.removePort(target.id);
    node.removePort(center.id);
    node.insertPort(center.sort, center);
    node.insertPort(target.sort, target);
    setTimeout(() => {
      edges?.forEach((edge: any) => {
        const { data } = edge?.store || {};
        if (!!data) {
          graphData.addEdge(data);
        }
      });
    }, 200);
  }, [portList]);
  // 配置保存
  const onSave = useCallback(() => {
    return new Promise((resolve, reject) => {
      validateFields()
        .then((values) => {
          try {
            if (selectedNode?.indexOf('node_') > -1 && !!nodeConfig) {
              // 节点编辑-保存
              (Object.keys(values) || []).forEach((key: string) => {
                if (key?.indexOf('port$%$') > -1 && key?.indexOf('$%$newname$%$') > -1) {
                  message.destroy();
                  message.error('新增的连接桩，请在name输入框回车确认');
                  throw new Error();
                }
              });
              let ports: any = {};
              Object.entries(values)?.forEach((res: any) => {
                if (res[0]?.indexOf('port$%$') > -1) {
                  // 代表是编辑连接桩
                  const item = res[0]?.split('$%$');
                  const id = item?.[1];
                  const name = item?.[2];
                  const direction = item?.[3];
                  if (!!ports[id]) {
                    ports[id] = {
                      ...ports[id],
                      [name]: res[1],
                    };
                  } else {
                    ports[id] = {
                      [name]: res[1],
                      direction
                    };
                  };
                }
              });
              // 连接桩
              const inputPort = (portList || [])
                ?.filter((i: any) => i.direction === 'input')
                ?.map((item: any) => {
                  const result = {
                    ...item,
                    ...ports[item.id],
                    label: {
                      ...item?.label || {},
                      ...ports[item.id],
                    }
                  };
                  node.setPortProp(item.id, result);
                  return result;
                });
              const outputPort = (portList || [])
                ?.filter((i: any) => i.direction === 'output')
                ?.map((item: any) => {
                  const result = {
                    ...item,
                    ...ports[item.id],
                    label: {
                      ...item?.label || {},
                      ...ports[item.id],
                    }
                  };
                  node.setPortProp(item.id, result);
                  return result;
                });
              // 把别名和描述传给node
              node.updateData({
                alias: values['info$%$alias'],
                description: values['info$%$description'],
                input_check: values['params$%$input_check'],
                initParams_check: true,
                status: 'STOPPED'
              });
              const result = {
                ...nodeConfig,
                alias: values['info$%$alias'],
                description: values['info$%$description'],
                config: {
                  ...nodeConfig?.config || {},
                  generalConfig: Object.entries(nodeConfig?.config?.generalConfig || {})?.reduce((pre: any, cen: any) => {
                    return {
                      ...pre,
                      [cen[0]]: {
                        ...cen[1],
                        value: values[`params$%$${cen[0]}`]
                      }
                    }
                  }, {}),
                  initParams: Object.entries(nodeConfig?.config?.initParams || {})?.reduce((pre: any, cen: any) => {
                    return {
                      ...pre,
                      [cen[0]]: {
                        ...cen[1],
                        ...cen[1]?.widget?.type === 'ImageLabelField' ?
                          {
                            value: cen[1]?.value || undefined,
                            localPath: values[`params$%$${cen[0]}`],
                            widget: {
                              ..._.omit(cen[1]?.widget || {}, 'localPath'),
                            }
                          } :
                          cen[1]?.widget?.type === 'DatePicker' ?
                            {
                              value: !!values[`params$%$${cen[0]}`].$d ? moment(values[`params$%$${cen[0]}`].$d).format("YYYY-MM-DD HH:mm:ss") : undefined
                            }
                            :
                            cen[1]?.widget?.type === "codeEditor" ?
                              {
                                value: values[`params$%$${cen[0]}`],
                                language: values[`params$%$${cen[0]}-language`]
                              }
                              :
                              { value: values[`params$%$${cen[0]}`] }
                      }
                    }
                  }, {}),
                  input: inputPort?.reduce((pre: any, cen: any) => {
                    return {
                      ...pre,
                      [cen.name]: cen.label
                    }
                  }, {}),
                  output: outputPort?.reduce((pre: any, cen: any) => {
                    return {
                      ...pre,
                      [cen.name]: cen.label
                    }
                  }, {}),
                },
                ports: {
                  ...nodeConfig?.ports || {},
                  items: inputPort.concat(outputPort)
                }
              };
              const params = {
                ...canvasData || {},
                flowData: {
                  ...canvasData?.flowData || {},
                  nodes: (canvasData?.flowData?.nodes || [])
                    ?.map((item: any) => {
                      if (selectedNode?.indexOf(item.customId) > -1) {
                        return {
                          ...result
                        };
                      } else {
                        return item;
                      }
                    })
                }
              };
              dispatch(setCanvasDataAction(params));
              setPortList(inputPort.concat(outputPort));
              resolve(true);
              return;
            } if (selectedNode?.indexOf('group_') > -1 && !!nodeConfig) {
              // 组编辑-保存
              const result = {
                ...nodeConfig,
                config: {
                  ...nodeConfig?.config || {},
                  initParams: {
                    interpreter: {
                      name: 'interpreter',
                      alias: '解释器',
                      require: true,
                      description: '',
                      type: 'File',
                      widget: {
                        type: 'File',
                        suffix: ['exe'],
                      },
                      value: values.interpreter,
                    },
                  },
                }
              };
              const params = {
                ...canvasData || {},
                flowData: {
                  ...canvasData?.flowData || {},
                  groups: (canvasData?.flowData?.groups || [])
                    ?.map((item: any) => {
                      if (selectedNode?.indexOf(item.customId) > -1) {
                        return {
                          ...result
                        };
                      } else {
                        return item;
                      }
                    })
                }
              };
              dispatch(setCanvasDataAction(params));
              resolve(true);
              return;
            } else {
              // 方案编辑-保存
              const result = {
                ...canvasData,
                ...values,
              };
              dispatch(setCanvasDataAction(result));
              resolve(true);
              return;
            };
          } catch (err) {
            console.log(err);
          }
        })
        .catch((err) => {
          console.log(err);
          const { errorFields } = err;
          errorFields?.length && message.error(`${errorFields[0]?.errors[0]} 是必填项`);
          reject()
        });
    });
  }, [graphData, canvasData, selectedNode, portList]);

  return (
    <div className={`flex-box-column ${styles.configPanel}`}>
      <Splitter>
        <Splitter.Panel defaultSize="50%" min="20%" max="80%">
          <div className="config-panel-left">
            {
              useMemo(() => {
                console.log(nodeConfig);
                return <Fragment>
                  <TooltipDiv className="config-panel-left-title boxShadow">
                    {nodeConfig?.name || '方案通用配置'}
                  </TooltipDiv>
                  <div className="config-panel-left-body">
                    {
                      (selectedNode?.indexOf('node_') > -1 && !!nodeConfig) ?
                        // 选中节点
                        <Form form={form} layout="vertical" scrollToFirstError>
                          <Tabs className='boxShadow' items={items} activeKey={selectedTab} onChange={(e) => {
                            if (canvasStart) {
                              setSelectedTab(e);
                            } else {
                              onSave().then((res) => {
                                setSelectedTab(e);
                              })
                            };
                          }} />
                          <div className="config-panel-left-body-panel">
                            <div style={selectedTab === 'params' ? {} : { display: 'none' }}>
                              {
                                Object.entries(nodeConfig?.config?.initParams || {})
                                  ?.sort((a: any, b: any) => a[1].sort - b[1].sort)
                                  ?.map((res: any, index: number) => {
                                    if (!!nodeConfig?.config?.group?.filter((i: any) => i.children?.includes(res[0]))?.length) return null;
                                    return <FormatWidgetToDom
                                      key={res[0]}
                                      config={[`params$%$${res[0]}`, res[1]]}
                                      form={form}
                                      disabled={canvasStart || res[1]?.disabled}
                                    />
                                  })
                              }
                              {
                                (nodeConfig?.config?.group || [])
                                  ?.sort((a: any, b: any) => a.sort - b.sort)
                                  ?.map((item: any, index: number) => {
                                    const { id, name, children, open } = item;
                                    return <div
                                      className="config-panel-left-body-panel-group"
                                      key={id}
                                    >
                                      <div className="config-panel-left-body-panel-group-title">
                                        {open ? <FolderOpenOutlined /> : <FolderOutlined />} {name}
                                      </div>
                                      <div className="config-panel-left-body-panel-group-body">
                                        {
                                          (children || [])
                                            ?.map((i: string) => nodeConfig?.config?.initParams[i])?.filter(Boolean)
                                            ?.sort((a: any, b: any) => a.sort - b.sort)
                                            ?.map((itemData: any) => {
                                              if (itemData) {
                                                return <FormatWidgetToDom
                                                  key={itemData.name}
                                                  config={[`params$%$${itemData.name}`, itemData]}
                                                  form={form}
                                                  disabled={canvasStart || itemData?.disabled}
                                                />
                                              };
                                              return null;
                                            })
                                        }
                                      </div>
                                    </div>
                                  })
                              }
                              <Divider>高级设置</Divider>
                              {
                                Object.entries(nodeConfig?.config?.generalConfig || {})?.map((res: any, index: number) => {
                                  return <FormatWidgetToDom
                                    key={res[0]}
                                    config={[`params$%$${res[0]}`, res[1]]}
                                    form={form}
                                    disabled={canvasStart || res[1]?.disabled}
                                  />
                                })
                              }
                            </div>
                            <div style={['input', , 'output'].includes(selectedTab) ? {} : { display: 'none' }}>
                              <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="droppable">
                                  {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                      {(portList || [])
                                        ?.sort((a: any, b: any) => a.sort - b.sort)
                                        ?.filter((i: any) => i.direction === selectedTab)
                                        ?.map((port: any, index: number) => {
                                          const { id, label, direction, sort } = port;
                                          const { alias, name, type, description, pushData, require } = label;
                                          return <Draggable key={port.id} draggableId={port.id} index={sort}>
                                            {(provided) => (<div
                                              key={`port-item-${id}`}
                                              className="port-item"
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              style={{
                                                ...provided.draggableProps.style,
                                              }}
                                            >
                                              <div className="flex-box-justify-between port-item-title">
                                                {
                                                  !!name ?
                                                    <Form.Item
                                                      name={`port$%$${id}$%$name$%$${direction}`}
                                                      style={{
                                                        backgroundColor: portTypeObj[label?.type]?.color,
                                                        color: '#eee',
                                                        lineHeight: '32px',
                                                        paddingLeft: 8,
                                                        marginLeft: 1
                                                      }}
                                                      initialValue={name}
                                                      rules={[{ required: true, message: `${alias}` }]}
                                                    >
                                                      <TooltipDiv>{name}</TooltipDiv>
                                                    </Form.Item>
                                                    :
                                                    <Form.Item
                                                      name={`port$%$${id}$%$newname$%$${direction}`}
                                                      rules={[{ required: true, message: `${alias}` }]}
                                                    >
                                                      <Input
                                                        placeholder="name，输入后回车确认"
                                                        disabled={canvasStart}
                                                        onPressEnter={(e: any) => {
                                                          const { value } = e?.target;
                                                          const center = {
                                                            ...port,
                                                            name: value,
                                                            label: {
                                                              ...port?.label || {},
                                                              name: value
                                                            }
                                                          };
                                                          node.setPortProp(id, center);
                                                          setPortList((pre: any) => (pre || [])?.map((item: any) => {
                                                            if (item.id === id) {
                                                              return center;
                                                            }
                                                            return item;
                                                          }));
                                                        }} />
                                                    </Form.Item>
                                                }
                                                <Button
                                                  icon={<TooltipDiv content={"删除"} placement="right"><MinusOutlined /> </TooltipDiv>}
                                                  style={{ width: 24, minWidth: 24 }}
                                                  disabled={canvasStart}
                                                  onClick={() => {
                                                    node.removePort(id);
                                                    setPortList((pre: any) => pre?.filter((i: any) => i.id !== id));
                                                  }}
                                                />
                                              </div>
                                              <div className="port-item-body">
                                                <div className="flex-box">
                                                  <Form.Item
                                                    name={`port$%$${id}$%$alias$%$${direction}`}
                                                    initialValue={alias}
                                                    rules={[{ required: false, message: `${alias}` }]}
                                                  >
                                                    <Input disabled={canvasStart} placeholder="别名" />
                                                  </Form.Item>
                                                  <Form.Item
                                                    name={`port$%$${id}$%$type$%$${direction}`}
                                                    initialValue={type}
                                                    style={{ width: 'calc(50% - 12px)', minWidth: 'calc(50% - 12px)' }}
                                                    rules={[{ required: false, message: `${alias}` }]}
                                                  >
                                                    <Select
                                                      placeholder="链接桩类型"
                                                      disabled={canvasStart}
                                                      options={Object.keys(portTypeObj)?.map?.((type) => ({ key: type, label: type, value: type }))}
                                                    />
                                                  </Form.Item>
                                                </div>
                                                <Form.Item
                                                  name={`port$%$${id}$%$description$%$${direction}`}
                                                  initialValue={description}
                                                  rules={[{ required: false, message: `${alias}` }]}
                                                >
                                                  <Input.TextArea
                                                    autoSize={{ minRows: 1, maxRows: 3 }}
                                                    placeholder="描述"
                                                    disabled={canvasStart}
                                                  />
                                                </Form.Item>
                                                {
                                                  selectedTab === 'output'
                                                    ?
                                                    <TooltipDiv content={"数据推送"} placement="right">
                                                      <Form.Item
                                                        name={`port$%$${id}$%$pushData$%$${direction}`}
                                                        initialValue={pushData}
                                                        valuePropName="checked"
                                                        rules={[{ required: false, message: `${alias}` }]}
                                                      >
                                                        <Switch
                                                          disabled={canvasStart}
                                                          className='port-item-body-switch'
                                                        />
                                                      </Form.Item>
                                                    </TooltipDiv>
                                                    :
                                                    <TooltipDiv content={"是否必要"} placement="right">
                                                      <Form.Item
                                                        name={`port$%$${id}$%$require$%$${direction}`}
                                                        initialValue={require}
                                                        valuePropName="checked"
                                                        rules={[{ required: false, message: `${alias}` }]}
                                                      >
                                                        <Switch
                                                          disabled={canvasStart}
                                                          className='port-item-body-switch'
                                                          defaultChecked={require}
                                                        />
                                                      </Form.Item>
                                                    </TooltipDiv>
                                                }
                                              </div>
                                            </div>
                                            )}
                                          </Draggable>
                                        })}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </DragDropContext>
                            </div>
                            <div style={selectedTab === 'info' ? {} : { display: 'none' }}>
                              <div className='config-panel-left-body-info-box'>
                                <p><span>节点ID:</span> {nodeConfig?.customId}</p>
                                <p><span>版本号:</span> {nodeConfig?.version}</p>
                                <p><span>模块:</span> {nodeConfig?.config?.module}</p>
                              </div>
                              <Form.Item
                                name={`info$%$alias`}
                                label="节点别名:"
                                initialValue={nodeConfig?.alias}
                                rules={[{ required: false, message: '节点别名' }]}
                              >
                                <Input disabled={canvasStart} />
                              </Form.Item>
                              <Form.Item
                                name={`info$%$description`}
                                label="描述:"
                                initialValue={nodeConfig?.description}
                                rules={[{ required: false, message: '插件描述' }]}
                              >
                                <Input.TextArea
                                  autoSize={{ minRows: 3, maxRows: 6 }}
                                  maxLength={200}
                                  placeholder="请输入插件描述"
                                  disabled={canvasStart}
                                />
                              </Form.Item>
                            </div>
                          </div>
                        </Form>
                        :
                        (selectedNode?.indexOf('group_') > -1 && nodeConfig) ?
                          // 选中分组
                          <Form form={form} layout="vertical" scrollToFirstError>
                            <div className="config-panel-left-body-panel">
                              {
                                Object.entries(nodeConfig?.config?.initParams || {
                                  interpreter: {
                                    name: 'interpreter',
                                    alias: '解释器',
                                    require: true,
                                    description: '',
                                    type: 'File',
                                    widget: {
                                      type: 'File',
                                      suffix: ['exe'],
                                    },
                                    value: undefined,
                                  }
                                })?.map((res: any) => {
                                  return <FormatWidgetToDom
                                    key={res[0]}
                                    config={res}
                                    form={form}
                                    disabled={canvasStart || res[1]?.disabled}
                                  />
                                })
                              }
                            </div>
                          </Form>
                          :
                          // 通用设置
                          <Form form={form} layout="vertical" scrollToFirstError>
                            <div className="config-panel-left-body-panel">
                              <Form.Item
                                name={`name`}
                                label="方案名称:"
                                initialValue={canvasData?.name}
                                rules={[{ required: true, message: 'name' }]}
                              >
                                <Input
                                  placeholder="请输入方案名称"
                                  disabled={canvasStart}
                                  onFocus={() => setSaveBtnDisabled(false)}
                                />
                              </Form.Item>
                              <Form.Item
                                name={`description`}
                                label="方案描述:"
                                initialValue={canvasData?.description}
                                rules={[{ required: false, message: '方案描述' }]}
                              >
                                <Input.TextArea
                                  autoSize={{ minRows: 1, maxRows: 6 }}
                                  maxLength={200}
                                  placeholder="请输入方案描述"
                                  disabled={canvasStart}
                                  onFocus={() => setSaveBtnDisabled(false)}
                                />
                              </Form.Item>
                              <Form.Item
                                name={`plugin_dir`}
                                label="方案路径:"
                                tooltip="插件本地路径，不填无法获取插件"
                                initialValue={canvasData?.plugin_dir}
                                rules={[{ required: false, message: '方案路径' }]}
                              >
                                <code className="flex-box-justify-between">
                                  {
                                    !!canvasData?.plugin_dir ?
                                      <Fragment>
                                        <TooltipDiv title={canvasData?.plugin_dir} onClick={() =>
                                          openFolder(`${canvasData?.plugin_dir}\\plugins`)
                                        }>
                                          {canvasData?.plugin_dir}
                                        </TooltipDiv>
                                        <a
                                          style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                                          onClick={() => {
                                            if (canvasStart) return;
                                            setSaveBtnDisabled(false);
                                            form.setFieldsValue({ plugin_dir: '' })
                                            dispatch(setCanvasDataAction({
                                              ...canvasData,
                                              plugin_dir: ''
                                            }));
                                          }}
                                        >
                                          移除
                                        </a>
                                      </Fragment>
                                      : null
                                  }
                                  <Button
                                    size="small"
                                    icon={<CloudUploadOutlined />}
                                    disabled={canvasStart}
                                    onClick={() => {
                                      setSaveBtnDisabled(false);
                                      chooseFolder((res: any) => {
                                        const path = _.isArray(res) ? res[0] : res;
                                        form.setFieldsValue({ plugin_dir: path })
                                        dispatch(setCanvasDataAction({
                                          ...canvasData,
                                          plugin_dir: path
                                        }));
                                      });
                                    }}
                                  >
                                    选择文件
                                  </Button>
                                </code>
                              </Form.Item>
                              <Divider>高级设置</Divider>
                              <Form.Item
                                name={`pushData`}
                                label="数据推送:"
                                tooltip="流程中所有节点，数据推送的总开关"
                                initialValue={canvasData?.pushData}
                                valuePropName="checked"
                                rules={[{ required: false, message: '数据推送' }]}
                              >
                                <Switch disabled={canvasStart} onChange={(checked) => {
                                  const result = {
                                    ...canvasData,
                                    pushData: checked,
                                    flowData: {
                                      ...canvasData.flowData,
                                      nodes: (canvasData.flowData?.nodes || [])?.map((node: any) => {
                                        const nodeCanvas = graphData.getCellById(node.id);
                                        return {
                                          ...node,
                                          ports: {
                                            ...node.ports,
                                            items: (node.ports.items || [])?.map((port: any) => {
                                              if (port.direction === "output") {
                                                const result = {
                                                  ...port,
                                                  pushData: checked,
                                                  label: {
                                                    ...port.label,
                                                    pushData: checked,
                                                  }
                                                };
                                                // 把更新的状态更新到节点的连接桩上
                                                nodeCanvas.setPortProp(port.id, result);
                                                return result;
                                              } else {
                                                return port;
                                              }
                                            })
                                          }
                                        }
                                      })
                                    }
                                  };
                                  dispatch(setCanvasDataAction(result));
                                  message.destroy();
                                  message.success(`所有节点的数据推送已全部 ${checked ? '开启' : '关闭'}`, 5);
                                }} />
                              </Form.Item>
                            </div>
                          </Form>
                    }
                  </div>
                  <div className="flex-box-center config-panel-left-footer">
                    {
                      ['input', 'output']?.includes(selectedTab) ?
                        <Button
                          disabled={canvasStart}
                          onClick={() => {
                            let port = {
                              "alias": "",
                              "customId": `port_${guid()}`,
                              "description": "",
                              "direction": selectedTab,
                              "group": selectedTab === "input" ? "top" : "bottom",
                              "id": getuid(),
                              "label": {
                                "alias": "",
                                "description": "",
                                "direction": selectedTab,
                                "name": "",
                                "require": true,
                                "sort": portList?.length,
                                "type": "numpy.ndarray",
                              },
                              "name": "",
                              "require": true,
                              "sort": portList?.length,
                              "type": "numpy.ndarray",
                            };
                            node.addPort(port);
                            setPortList((pre: any) => pre.concat(port));
                          }}
                          block
                          icon={<PlusOutlined />}
                        >
                          添加连接桩
                        </Button>
                        : null
                    }
                    <Button
                      type="primary" block
                      disabled={canvasStart || (!selectedNode && saveBtnDisabled)}
                      onClick={() => {
                        onSave().then(() => {
                          setSaveBtnDisabled(true);
                          dispatch(setSelectedNodeAction(''));
                          message.success('保存成功');
                        })
                      }}
                    >保存</Button>
                  </div>
                </Fragment>
              }, [canvasData, nodeConfig, canvasStart, selectedTab, portList, saveBtnDisabled])
            }
          </div>
        </Splitter.Panel>
        <Splitter.Panel>
          <ShowDataPanel />
        </Splitter.Panel>
      </Splitter>
    </div >
  );
};

export default memo(ConfigPanel);

const FormatWidgetToDom = (props: any) => {
  const {
    config = [],
    form,
    disabled,
  } = props;
  const {
    name: aliasDefault,
    alias = '默认输入框',
    require,
    type,
    value,
    optionPath,
    language = 'json',
    localPath,
    description,
    widget = {},
    default: defaultValue,
    parentName,
  } = config[1];
  let {
    max = 9999,
    min,
    options,
    precision,
    step,
    length,
    suffix,
    type: type1,
  } = widget;
  const name = config[0];
  const [uploadValues, setUploadValues] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [optionsList, setOptionsList] = useState<any>([]);

  useEffect(() => {
    if (type1 === 'codeEditor') {
      try {
        setUploadValues({
          value: formatJson(value),
          language
        });
      } catch (err) {
        setUploadValues({
          value: value,
          language
        });
      };
    } else if (['File', 'Dir', 'ImageLabelField'].includes(type1)) {
      setUploadValues({
        [name]: value
      })
    } else if (type1 === 'DataMap') {
      setOptionsList(Object.entries(_.isString(value) ? JSON.parse(value || "{}") : value)
        ?.map((i: any, index: number) => {
          return {
            id: guid(),
            label: i[0],
            value: i[1]
          }
        }));
    };
  }, [value]);

  switch (type1) {
    case 'Input':
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Input
            placeholder={`请输入${alias}`}
            disabled={disabled}
          />
        </Form.Item>
      );
    case 'DatePicker':
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={dayjs(value, 'YYYY-MM-DD HH:mm:ss')}
          rules={[{ required: require, message: `${alias}` }]}
        >
          {
            <DatePicker
              placeholder={`请输入${alias}`}
              disabled={disabled}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          }
        </Form.Item>
      );
    case 'IpInput':
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <IpInput
            length={length}
            disabled={disabled}
          />
        </Form.Item>
      );
    case 'Radio':
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={(_.isArray(value) ? value[0] : value) || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Radio.Group
            disabled={disabled}
          >
            {options?.map?.((option: any, index: any) => {
              if (_.isString(option)) {
                return (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                );
              } else {
                const { id, label, value } = option;
                return (
                  <Radio key={id || value} value={value}>
                    {label}
                  </Radio>
                );
              }
            })}
          </Radio.Group>
        </Form.Item>
      );
    case 'TagRadio':
      return (
        <>
          <Form.Item
            name={name}
            label={alias || name}
            tooltip={description || aliasDefault}
            initialValue={(_.isArray(value) ? value[0] : value) || undefined}
            rules={[{ required: require, message: `${alias}` }]}
          >
            <Select
              disabled={disabled}
              options={(options || [])?.map?.((option: any) => {
                const { id, name } = option;
                return { key: id || name, value: name, label: name, propsKey: JSON.stringify(option) };
              })}
              onChange={(e: any, option: any) => {
                const { value, propsKey } = option;
                const { children = [] } = JSON.parse(propsKey);

              }}
            />
          </Form.Item>
        </>
      );
    case 'Select':
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={(_.isArray(value) ? value[0] : value) || false}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Select
            placeholder={`${alias}`}
            disabled={disabled}
            options={(options || [])?.map?.((option: any) => {
              if (_.isString(option)) {
                return { key: option, label: option, value: option };
              } else {
                const { key, label, value } = option;
                return { key, label, value };
              }
            })}
          />
        </Form.Item>
      );
    case 'MultiSelect':
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Select
            placeholder={`请选择${alias}`}
            mode="tags"
            allowClear={false}
            showSearch={false}
            disabled={disabled}
            options={(options || [])?.map?.((option: any) => {
              if (_.isString(option)) {
                return { key: option, label: option, value: option };
              } else {
                const { key, label, value } = option;
                return { key, label, value };
              }
            })}
          />
        </Form.Item>
      );
    case 'Checkbox':
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Checkbox.Group
            options={(options || [])?.map?.((option: any) => {
              if (_.isString(option)) {
                return { key: option, label: option, value: option };
              } else {
                const { key, label, value } = option;
                return { key, label, value };
              }
            })}
            disabled={disabled}
          />
        </Form.Item>
      );
    case 'InputNumber':
      return (
        <Fragment>
          <Form.Item
            name={name}
            label={alias || name}
            tooltip={description || aliasDefault}
            initialValue={
              !_.isNull(value) && !_.isNaN(value) ? value : defaultValue
            }
            rules={[{ required: require, message: `${alias}` }]}
            style={{ marginBottom: 8 }}
          >
            <InputNumber
              placeholder={`请输入${alias}`}
              precision={precision}
              step={step}
              max={max}
              min={min}
              disabled={disabled}
            />
          </Form.Item>
          <div className="flex-box" style={{ marginBottom: 24 }}>
            <div style={{ marginRight: 16 }}>最大值:{max}</div>
            <div>最小值:{min}</div>
          </div>
        </Fragment>
      );
    case 'Slider':
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={
            !_.isUndefined(value) || !_.isNull(value)
              ? value
              : defaultValue || 0
          }
          rules={[{ required: require, message: `${alias}` }]}
        >
          <SliderGroup
            step={step}
            max={max}
            min={min}
            precision={precision}
            disabled={disabled}
          />
        </Form.Item>
      );
    case 'Switch':
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={value || false}
          valuePropName="checked"
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Switch
            disabled={disabled}
          />
        </Form.Item>
      );
    case 'File':
      const title1 = uploadValues[name];
      return (
        <Form.Item
          shouldUpdate
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          valuePropName="file"
          rules={[{ required: require, message: `${alias}` }]}
        >
          <code className="flex-box-justify-between">
            {title1 ? (
              <div className="flex-box" style={{ width: `calc(100% - 74px)` }}>
                <TooltipDiv title={title1} style={{ flex: 1 }}>
                  <a onClick={() => openFolder(`${title1}\\`)}>{title1}</a>
                </TooltipDiv>
                <a
                  style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                  onClick={() => {
                    if (disabled) return;
                    setUploadValues((prev: {}) => {
                      return { ...prev, [name]: undefined };
                    });
                    form.setFieldsValue({ [name]: undefined });
                  }}
                >
                  移除
                </a>
              </div>
            ) : null}
            <Button
              size='small'
              onClick={() => {
                chooseFile(
                  (res: any) => {
                    const result =
                      _.isArray(res) && res.length === 1 ? res[0] : res;
                    setUploadValues((prev: {}) => {
                      return { ...prev, [name]: result };
                    });
                    form.setFieldsValue({ [name]: result });
                  },
                  false,
                  suffix?.includes('all')
                    ? { name: 'All Files', extensions: ['*'] }
                    : { name: 'File', extensions: suffix }
                );
              }}
              disabled={disabled}
            >
              选择文件
            </Button>
          </code>
        </Form.Item>
      );
    case 'Dir':
      const title = uploadValues[name];
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          valuePropName="file"
          getValueFromEvent={(e: any) => {
            if (Array.isArray(e)) {
              return e;
            }
            const { file, fileList } = e;
            return [{ ...file, percent: 40 }];
          }}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <code className="flex-box-justify-between">
            {title ? (
              <div className="flex-box" style={{ width: `calc(100% - 88px)` }}>
                <TooltipDiv title={title} style={{ flex: 1 }}>
                  <a onClick={() => openFolder(`${title}\\`)}>{title}</a>
                </TooltipDiv>
                <a
                  style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                  onClick={() => {
                    if (disabled) return;
                    setUploadValues((prev: {}) => {
                      return { ...prev, [name]: undefined };
                    });
                    form.setFieldsValue({ [name]: undefined });
                  }}
                >
                  移除
                </a>
              </div>
            ) : null}
            <Button
              size='small'
              onClick={() => {
                chooseFolder((res, err) => {
                  const result =
                    _.isArray(res) && res.length === 1 ? res[0] : res;
                  setUploadValues((prev: {}) => {
                    return { ...prev, [name]: result };
                  });
                  form.setFieldsValue({ [name]: result });
                });
              }}
              disabled={disabled}
            >
              选择文件夹
            </Button>
          </code>
        </Form.Item>
      );
    case 'codeEditor':
      return (
        <Fragment>
          <Form.Item
            name={`${name}-language`}
            label="编码语言"
            initialValue={language || undefined}
            style={{ display: 'none' }}
            rules={[{ required: require, message: '编码语言' }]}
          >
            <Select
              options={[
                { value: 'javascript', label: 'javascript' },
                { value: 'python', label: 'python' },
                { value: 'json', label: 'json' },
                { value: 'sql', label: 'sql' },
              ]}
              onChange={(val) => {
                setUploadValues((prev: any) => ({ ...prev, language: val }));
              }}
            />
          </Form.Item>
          <Form.Item
            name={name}
            label={alias || name}
            tooltip={description || aliasDefault}
            initialValue={value || defaultValue || undefined}
            style={{ marginBottom: 8 }}
            rules={[{ required: require, message: `${alias}` }]}
          >
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              value={
                language === 'json' && _.isObject(value)
                  ? formatJson(value)
                  : value
              }
              style={{ marginBottom: 8 }}
              disabled
            />
          </Form.Item>
          <Button
            style={{ marginBottom: 24 }}
            onClick={() => {
              setModalVisible(true);
            }}
            disabled={disabled}
          >
            编辑
          </Button>
          {modalVisible ?
            <MonacoEditor
              defaultValue={uploadValues.value}
              language={uploadValues.language}
              visible={modalVisible}
              onOk={(val: any) => {
                setUploadValues(val);
                form.setFieldsValue({ [name]: val?.value || '', [`${name}-language`]: val?.language });
                setModalVisible(false);
              }}
              onCancel={() => {
                setModalVisible(false);
              }}
            />
            : null}
        </Fragment>
      );
    case 'ImageLabelField':
      const title2 = uploadValues[name] || localPath;
      return (
        <Form.Item
          shouldUpdate
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={localPath || undefined}
          valuePropName="file"
          rules={[{ required: require, message: `${alias}` }]}
        >
          <code className="flex-box-justify-between">
            {title2 ? (
              <div className="flex-box" style={{ width: `calc(100% - 74px)` }}>
                <TooltipDiv title={title2}>
                  <a onClick={() => openFolder(title2, true)}>{title2}</a>
                </TooltipDiv>
                <a
                  style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                  onClick={() => {
                    if (disabled) return;
                    setUploadValues((prev: {}) => {
                      return { ...prev, [name]: undefined };
                    });
                    form.setFieldsValue({ [name]: undefined });
                  }}
                >
                  移除
                </a>
              </div>
            ) : null}
            <Button
              size='small'
              onClick={() => {
                chooseFile(
                  (res: any) => {
                    const result = _.isArray(res) && res.length === 1 ? res[0] : res;
                    setUploadValues((prev: {}) => {
                      return { ...prev, [name]: result };
                    });
                    form.setFieldsValue({ [name]: result });
                  },
                  false,
                  {
                    name: 'File',
                    extensions: ['jpg', 'jpeg', 'png', 'svg'],
                  }
                );
              }}
              disabled={disabled}
            >
              选择图片
            </Button>
          </code>
        </Form.Item>
      );
    case 'Measurement':
      return (
        <Form.Item
          name={name}
          label={alias || name}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Measurement
            disabled={disabled}
            titleColor
            precision={precision}
            step={step}
            max={max}
            min={min}
            type={type}
          />
        </Form.Item>
      );
    case 'DataMap':
      return (
        <Fragment>
          <Form.Item
            name={name}
            label={alias || name}
            tooltip={description || aliasDefault}
            initialValue={_.isString(value) ? value : formatJson(value) || ""}
            style={{ marginBottom: 8 }}
            rules={[{ required: require, message: `${alias}` }]}
          >
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              disabled
            />
          </Form.Item>
          {(optionsList || [])
            ?.map?.((item: any, index: number) => {
              const { id, label, value } = item;
              return <div className="flex-box" style={{
                gap: 8,
                marginBottom: index + 1 === optionsList.length ? 8 : 8
              }} key={id}>
                <Form.Item
                  name={`options$%$${id}$%$label`}
                  label="原始值"
                  initialValue={label}
                  style={{ marginBottom: 0 }}
                  rules={[{ required: false, message: '原始值' }]}
                >
                  <Input placeholder='原始值' onChange={(e) => {
                    const { value } = e.target;
                    const result = optionsList?.map((pre: any) => {
                      if (pre.id === id) {
                        return {
                          ...pre,
                          label: value
                        };
                      } else {
                        return pre;
                      };
                    });
                    const formValue = result.reduce((pre: any, cen: any) => {
                      return {
                        ...pre,
                        [cen.label]: cen.value
                      };
                    }, {});
                    form.setFieldsValue({
                      [name]: formatJson(formValue)
                    });
                    setOptionsList(result);
                  }} />
                </Form.Item>
                <Form.Item
                  name={`options$%$${id}$%$value`}
                  label="映射值"
                  initialValue={value}
                  style={{ marginBottom: 0 }}
                  rules={[{ required: false, message: '映射值' }]}
                >
                  <Input placeholder='映射值' onChange={(e) => {
                    const { value } = e.target;
                    const result = optionsList?.map((pre: any) => {
                      if (pre.id === id) {
                        return {
                          ...pre,
                          value
                        };
                      } else {
                        return pre;
                      };
                    });
                    const formValue = result.reduce((pre: any, cen: any) => {
                      return {
                        ...pre,
                        [cen.label]: cen.value
                      };
                    }, {});
                    form.setFieldsValue({
                      [name]: formatJson(formValue)
                    });
                    setOptionsList(result);
                  }} />
                </Form.Item>
                <Button
                  icon={<MinusOutlined />}
                  style={{ marginTop: 30 }}
                  onClick={() => {
                    const result = optionsList?.filter((pre: any) => pre.id !== id);
                    const formValue = result.reduce((pre: any, cen: any) => {
                      return {
                        ...pre,
                        [cen.label]: cen.value
                      };
                    }, {});
                    form.setFieldsValue({
                      [name]: formatJson(formValue)
                    });
                    setOptionsList(result);
                  }}
                />
              </div>
            })}
          <Button
            type="dashed"
            style={{ marginBottom: 24 }}
            onClick={() => {
              setOptionsList((prev: any) => prev.concat({
                id: guid(),
                sort: prev?.length,
                label: '',
                value: '',
              }));
            }}
            block
            icon={<PlusOutlined />}
          >
            添加可选项
          </Button>
        </Fragment>
      );
    default:
      return null;
  }
};
