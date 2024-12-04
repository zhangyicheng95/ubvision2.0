import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, message, Input, Menu, Popconfirm, Splitter, Select, Divider, Switch } from 'antd';
import {
  EditOutlined, MinusCircleOutlined, FolderOpenOutlined, FolderOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { formatJson, guid, sortList } from '@/utils/utils';
import PrimaryTitle from '@/components/PrimaryTitle';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';
import { getPlugin, updatePlugin } from '@/services/flowPlugin';
import moment from 'moment';
import TooltipDiv from '@/components/TooltipDiv';
import { outputTypeObj, pluginsNameIcon, portTypeObj } from '@/pages/Flow/common/constants';
import { InitParamsEdit, initParamsKeys, InitParamsShow } from '../config/initParamsConfig';
import dayjs from 'dayjs';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DropSortableItem from '@/components/DragComponents/DropSortableItem';
import DragSortableItem from '@/components/DragComponents/DragSortableItem';

interface Props { }

const PluginEditPage: React.FC<Props> = (props: any) => {
  const { projectList, pluginList } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const { validateFields, setFieldsValue } = form;
  const [pluginInfo, setPluginInfo] = useState<any>({});
  const [pluginEditItem, setPluginEditItem] = useState<any>(null);
  const [portEditItem, setPortEditItem] = useState<any>(null);
  const [groupEditItem, setGroupEditItem] = useState<any>(null);
  const [pluginUpdate, setPluginUpdate] = useState<any>(false);

  const initPlugin = (data: any) => {
    try {
      const { config = {} } = data;
      const { initParams = {}, input = {}, output = {}, group = [] } = config;
      const resultData = {
        ...data,
        config: {
          ...config,
          input: (Object.entries(input) || []).reduce(
            (pre, cen: [any, any], index: number) => {
              return {
                ...pre,
                [cen[0]]: {
                  direction: 'input',
                  sort: index,
                  require: false,
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
            (pre, cen: [any, any], index: number) => {
              return {
                ...pre,
                [cen[0]]: {
                  direction: 'output',
                  sort: index + (Object.keys(input)?.length || 0),
                  pushData: false,
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
            (pre, cen: [any, any], index: number) => {
              return {
                ...pre,
                [cen[0]]: {
                  sort: index,
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
          group: (group || [])?.map((item: any, index: number) => {
            return {
              sort: index,
              id: guid(),
              ...item,
            }
          })
        },
      };
      console.log(resultData);
      setPluginInfo(resultData);
      setFieldsValue({ alias: `${resultData.name}_别名`, ...resultData });
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
    const name = `new-${guid()}`
    setPluginInfo((prev: any) => {
      return {
        ...prev,
        config: {
          ...prev?.config || {},
          initParams: {
            ...prev?.config?.initParams || {},
            [name]: {
              ...initParamsKeys[item[1]],
              name,
              type: item[0],
              sort: Object.keys(prev?.config?.initParams)?.length + 1
            }
          }
        }
      }
    });
    setTimeout(() => {
      const bottom: any = document.getElementById('params-bottom');
      bottom.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
    console.log(dragItem);

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
  // 属性值排序-分组外
  const onInitParamsDragEnd = (source: any, target: any) => {
    if (
      !source
      || !target
      || (source.name === target.name)
    ) return;
    const list = Object.values(pluginInfo?.config?.initParams);
    const listRes = sortList(source.sort, target.sort, list);
    const result = {
      ...pluginInfo,
      config: {
        ...pluginInfo?.config || {},
        initParams: (listRes || [])
          ?.map((i: any, index: number) => ({ ...i, sort: index }))
          ?.reduce((pre: any, cen: any) => {
            return {
              ...pre,
              [cen.name]: cen
            }
          }, {})

      }
    };
    setPluginInfo(result);
  };
  // 属性分组排序
  const onParamsGroupDragEnd = (source: any, target: any) => {
    if (
      !source
      || !target
      || (source.name === target.name)
    ) return;
    setPluginInfo((prev: any) => {
      return {
        ...prev,
        config: {
          ...prev?.config || {},
          group: (prev?.config?.group || [])?.map((i: any) => {
            if (i.id === target.id) {
              return {
                ...i,
                children: (i.children || []).concat(source.name)
              }
            } else {
              return i;
            }
          })
        }
      }
    });
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
      <PrimaryTitle title={`插件编辑 ${pluginInfo.name}`} style={{ marginBottom: 8, paddingRight: 32 }}>
        <Button disabled={!!pluginEditItem || !!portEditItem || !!groupEditItem} onClick={() => navigate(-1)}>返回</Button>
        <Button type="primary" disabled={!!pluginEditItem || !!portEditItem || !!groupEditItem} onClick={() => onSave()}>保存</Button>
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
                                                  const file = { description: '', name: res[0], ...res[1] };
                                                  setPluginEditItem(null);
                                                  setGroupEditItem(null);
                                                  setPortEditItem(file);
                                                  setTimeout(() => {
                                                    form1.setFieldsValue(file);
                                                  }, 200);
                                                }}
                                              />
                                              <Popconfirm
                                                title="确定删除当前链接桩?"
                                                onConfirm={() => {
                                                  setPluginInfo((prev: any) => {
                                                    return {
                                                      ...prev,
                                                      config: {
                                                        ...prev.config || {},
                                                        [type]: _.omit(pluginInfo?.config?.[type], res[0])
                                                      }
                                                    }
                                                  });
                                                  setPortEditItem(null);
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
                        <Button
                          type="default"
                          block
                          onClick={() => {
                            const name = guid();
                            setPluginInfo((prev: any) => {
                              return {
                                ...prev,
                                config: {
                                  ...prev?.config || {},
                                  [type]: {
                                    ...prev?.config[type],
                                    [name]: {
                                      direction: type,
                                      alias: '',
                                      name,
                                      type: 'string',
                                      sort: Object.keys(prev?.config?.input)?.length + Object.keys(prev?.config?.output)?.length,
                                      ...type === 'input' ? { require: false } : { pushData: false }
                                    }
                                  }
                                }
                              };
                            });
                          }}>添加{type === 'input' ? '入度' : '出度'}</Button>
                      </div>
                    </div>
                  })
                }, [pluginInfo?.config?.input, pluginInfo?.config?.output])
              }
              <Divider>插件属性</Divider>
              <div className="flex-box-column plugin-edit-body-center-param">
                <DndProvider backend={HTML5Backend}>
                  {
                    useMemo(() => {
                      if (!pluginInfo?.config?.initParams) return null;
                      return <Fragment>
                        {
                          Object.entries(pluginInfo?.config?.initParams)
                            ?.sort((a: any, b: any) => a[1].sort - b[1].sort)
                            ?.map((res: any, index: number) => {
                              if (!!pluginInfo?.config?.group?.filter((i: any) => i.children?.includes(res[0]))?.length) return null;
                              return <div
                                className="plugin-edit-body-center-param-item"
                                key={`plugin-edit-body-center-param-item-${res[0]}`}
                              >
                                <DragComponents
                                  item={res[1]}
                                  target={res[1]}
                                  onDragEnd={(source: any, target: any) => {
                                    if (source._type === 'group' && !target._type) {
                                      // 从分组中拖拽出来
                                      setPluginInfo((prev: any) => {
                                        return {
                                          ...prev,
                                          config: {
                                            ...prev?.config || {},
                                            group: (prev?.config?.group || [])?.map((i: any) => {
                                              if (i.id === source._group) {
                                                return {
                                                  ...i,
                                                  children: (i.children || [])?.filter((j: any) => j !== source.name)
                                                };
                                              } else {
                                                return i;
                                              }
                                            })
                                          }
                                        }
                                      });
                                    } else {
                                      onInitParamsDragEnd(source, target);
                                    }
                                  }}
                                >
                                  <InitParamsShow
                                    className="plugin-item-content"
                                    item={res[1]}
                                    ifCanModify
                                    onEdit={() => {
                                      form1.resetFields();
                                      setPortEditItem(null);
                                      setGroupEditItem(null);
                                      setPluginEditItem(res[1]);
                                      setTimeout(() => {
                                        const result = {
                                          description: '',
                                          ...res[1],
                                          value: res[1]?.widget?.type === "DatePicker" ?
                                            (!!res[1].value ? dayjs(res[1].value, 'YYYY-MM-DD HH:mm:ss') : undefined) :
                                            res[1]?.widget?.type === "DataMap" ?
                                              (!!res[1].value ? formatJson(res[1].value) : undefined) :
                                              res[1].value,
                                          ..._.omit(_.omit(res[1]?.widget, 'language'), 'type'),
                                        };
                                        form1.setFieldsValue(result);
                                      }, 200);
                                    }}
                                    onRemove={() => {
                                      setPluginInfo((prev: any) => {
                                        return {
                                          ...prev,
                                          config: {
                                            ...prev?.config || {},
                                            initParams: _.omit(prev?.config?.initParams, res[0]),
                                          }
                                        };
                                      });
                                      setPluginEditItem(null);
                                    }}
                                  />
                                </DragComponents>
                              </div>
                            })
                        }
                        <Divider>插件属性分组</Divider>
                        {
                          (pluginInfo?.config?.group || [])
                            ?.sort((a: any, b: any) => a.sort - b.sort)
                            ?.map((item: any, index: number) => {
                              const { id, name, children, open } = item;
                              return <ParentDiv
                                className="plugin-edit-body-center-param-group-item"
                                key={`plugin-edit-body-center-param-group-item-${id}`}
                                onDragEnd={(source: any, target: any) => {
                                  // 外面拖拽到分组里
                                  onParamsGroupDragEnd(source, target);
                                }}
                                target={{ ...item, _type: 'group', _group: id }}
                              >
                                <div className="flex-box plugin-edit-body-center-param-group-item-title-box">
                                  <div
                                    className="plugin-edit-body-center-param-group-item-title-box-title"
                                    onClick={() => {
                                      setPluginInfo((prev: any) => {
                                        return {
                                          ...prev,
                                          config: {
                                            ...prev.config || {},
                                            group: (prev.config?.group || [])?.map((i: any) => {
                                              if (i.id === id) {
                                                return {
                                                  ...i,
                                                  open: !open
                                                };
                                              } else {
                                                return i;
                                              };
                                            }),
                                          },
                                        };
                                      });
                                    }}
                                  >
                                    {open ? <FolderOpenOutlined /> : <FolderOutlined />} {name}
                                  </div>
                                  <div className="flex-box">
                                    <EditOutlined
                                      style={{ marginRight: 8 }}
                                      onClick={() => {
                                        form1.resetFields();
                                        setPortEditItem(null);
                                        setPluginEditItem(null);
                                        setGroupEditItem(item);
                                        setTimeout(() => {
                                          const result = {
                                            ...item,
                                          };
                                          form1.setFieldsValue(result);
                                        }, 200);
                                      }}
                                    />
                                    <Popconfirm
                                      title="确定删除当前属性?"
                                      onConfirm={() => {
                                        setPluginInfo((prev: any) => {
                                          return {
                                            ...prev,
                                            config: {
                                              ...prev?.config || {},
                                              group: (prev?.config?.group || [])?.filter((i: any) => i.id !== id)
                                            }
                                          };
                                        });
                                      }}
                                    >
                                      <MinusCircleOutlined className="plugin-icon" />
                                    </Popconfirm>
                                  </div>
                                </div>
                                <div
                                  className="plugin-edit-body-center-param-group-item-body"
                                  style={open ? {} : { display: 'none' }}
                                >
                                  {
                                    (children || [])
                                      ?.map((i: string) => pluginInfo?.config?.initParams[i])?.filter(Boolean)
                                      ?.sort((a: any, b: any) => a.sort - b.sort)
                                      ?.map((itemData: any) => {
                                        if (itemData) {
                                          return <DragComponents
                                            item={{ ...itemData, _type: 'group', _group: id }}
                                            target={{ ...itemData, _type: 'group', _group: id }}
                                            key={`plugin-edit-body-center-param-group-item-body-item-${itemData.name}`}
                                            style={{ marginBottom: 16 }}
                                            onDragEnd={(source: any, target: any) => {
                                              if (source._type === 'group' && target._type === 'group') {
                                                if (source._group === target._group) {
                                                  // 同一分组内排序
                                                  onInitParamsDragEnd(source, target);
                                                } else {
                                                  // A分组拖拽到B分组
                                                  setPluginInfo((prev: any) => {
                                                    return {
                                                      ...prev,
                                                      config: {
                                                        ...prev?.config || {},
                                                        group: (prev?.config?.group || [])?.map((i: any) => {
                                                          if (i.id === source._group) {
                                                            return {
                                                              ...i,
                                                              children: (i.children || [])?.filter((j: any) => j !== source.name)
                                                            };
                                                          } else if (i.id === target._group) {
                                                            return {
                                                              ...i,
                                                              children: (i.children || []).concat(source.name)
                                                            };
                                                          } else {
                                                            return i;
                                                          }
                                                        })
                                                      }
                                                    }
                                                  });
                                                };
                                              } else {
                                                onParamsGroupDragEnd(source, { ...item, _type: 'group', _group: id });
                                              }
                                            }}
                                          >
                                            <InitParamsShow
                                              item={itemData}
                                              ifCanModify
                                              onEdit={() => {
                                                form1.resetFields();
                                                setPortEditItem(null);
                                                setGroupEditItem(null);
                                                setPluginEditItem(itemData);
                                                setTimeout(() => {
                                                  const result = {
                                                    description: '',
                                                    ...itemData,
                                                    value: itemData?.widget?.type === "DatePicker" ?
                                                      (!!itemData.value ? dayjs(itemData.value, 'YYYY-MM-DD HH:mm:ss') : undefined) :
                                                      itemData?.widget?.type === "DataMap" ?
                                                        (!!itemData.value ? formatJson(itemData.value) : undefined) :
                                                        itemData.value,
                                                    ..._.omit(_.omit(itemData?.widget, 'language'), 'type'),
                                                  };
                                                  form1.setFieldsValue(result);
                                                }, 200);
                                              }}
                                              onRemove={() => {
                                                setPluginInfo((prev: any) => {
                                                  return {
                                                    ...prev,
                                                    config: {
                                                      ...prev?.config || {},
                                                      initParams: _.omit(prev?.config?.initParams, itemData.name),
                                                    }
                                                  };
                                                });
                                                setPluginEditItem(null);
                                              }}
                                            />
                                          </DragComponents>
                                        };
                                        return null;
                                      })
                                  }
                                </div>
                              </ParentDiv>
                            })
                        }
                      </Fragment>
                    }, [pluginInfo?.config?.initParams, pluginInfo?.config?.group])
                  }
                </DndProvider>
                <Button
                  type="default"
                  style={{}}
                  block
                  onClick={() => {
                    setPluginInfo((prev: any) => {
                      return {
                        ...prev,
                        config: {
                          ...prev?.config || {},
                          group: (prev?.config?.group || [])?.concat({
                            id: guid(),
                            name: '',
                            children: [],
                            open: true,
                            sort: prev?.config?.group?.length || 0
                          })
                        }
                      };
                    });
                  }}>添加分组</Button>
              </div>
              <div id="params-bottom" />
            </div>
          </Splitter.Panel>
          <Splitter.Panel defaultSize="30%" min="20%" max="50%">
            <div className="plugin-edit-body-right">
              <div className="plugin-edit-body-right-box">
                <div className="plugin-edit-body-right-box-title">
                  插件属性配置
                </div>
                {
                  useMemo(() => {
                    if (!pluginEditItem && !portEditItem && !groupEditItem) return null;
                    return <Fragment>
                      <div className="plugin-edit-body-right-box-body">
                        {
                          !!pluginEditItem ?
                            <Form
                              form={form1}
                              layout={'vertical'}
                              scrollToFirstError
                            >
                              <Divider>基本属性</Divider>
                              <Form.Item
                                name="type"
                                label="属性类型"
                                rules={[{ required: true, message: '属性类型' }]}
                              >
                                <Select
                                  options={(Object.keys(outputTypeObj) || [])?.map?.((option: any) => {
                                    if (_.isString(option)) {
                                      return { key: option, label: option, value: option };
                                    } else {
                                      const { key, label, value } = option;
                                      return { key, label, value };
                                    }
                                  })}
                                  onChange={() => setPluginUpdate((pre: boolean) => !pre)}
                                />
                              </Form.Item>
                              <Form.Item
                                name="name"
                                label="属性name"
                                rules={[{ required: true, message: '属性name' }]}
                              >
                                <Input placeholder="请输入属性name" />
                              </Form.Item>
                              <Form.Item
                                name="alias"
                                label="属性别名"
                                rules={[{ required: true, message: '属性别名' }]}
                              >
                                <Input placeholder="请输入属性别名" />
                              </Form.Item>
                              <Form.Item
                                name="description"
                                label="属性描述"
                                rules={[{ required: false, message: '属性描述' }]}
                              >
                                <Input.TextArea placeholder="请输入属性描述" />
                              </Form.Item>
                              <Form.Item
                                name="require"
                                label="是否必填项"
                                valuePropName="checked"
                                rules={[{ required: true, message: '是否必填项' }]}
                              >
                                <Switch />
                              </Form.Item>
                              <Divider>私有属性</Divider>
                              <InitParamsEdit data={pluginEditItem} form={form1} />
                            </Form>
                            :
                            !!portEditItem ?
                              <Form
                                form={form1}
                                layout={'vertical'}
                                scrollToFirstError
                              >
                                <Divider>{portEditItem.direction === 'input' ? '入度' : '出度'}</Divider>
                                <Form.Item
                                  name="type"
                                  label="连接桩类型"
                                  rules={[{ required: true, message: '连接桩类型' }]}
                                >
                                  <Select
                                    options={Object.keys(portTypeObj)?.map?.((type) => ({ key: type, label: type, value: type }))}
                                  />
                                </Form.Item>
                                <Form.Item
                                  name="name"
                                  label="连接桩name"
                                  rules={[{ required: true, message: '连接桩name' }]}
                                >
                                  <Input placeholder="请输入连接桩name" />
                                </Form.Item>
                                <Form.Item
                                  name="alias"
                                  label="连接桩别名"
                                  rules={[{ required: true, message: '连接桩别名' }]}
                                >
                                  <Input placeholder="请输入连接桩别名" />
                                </Form.Item>
                                <Form.Item
                                  name="description"
                                  label="连接桩描述"
                                  rules={[{ required: false, message: '连接桩描述' }]}
                                >
                                  <Input.TextArea placeholder="请输入连接桩描述" />
                                </Form.Item>
                                {
                                  portEditItem.direction === 'input' ?
                                    <Form.Item
                                      name="require"
                                      label="是否必要"
                                      valuePropName="checked"
                                      rules={[{ required: true, message: '是否必要' }]}
                                    >
                                      <Switch />
                                    </Form.Item>
                                    :
                                    <Form.Item
                                      name="pushData"
                                      label="是否开启数据推送"
                                      valuePropName="checked"
                                      rules={[{ required: true, message: '是否开启数据推送' }]}
                                    >
                                      <Switch />
                                    </Form.Item>
                                }
                              </Form>
                              :
                              !!groupEditItem ?
                                <Form
                                  form={form1}
                                  layout={'vertical'}
                                  style={{ marginTop: 24 }}
                                  scrollToFirstError
                                >
                                  <Form.Item
                                    name="name"
                                    label="分组名称"
                                    rules={[{ required: true, message: '分组名称' }]}
                                  >
                                    <Input placeholder="请输入分组名称" autoFocus />
                                  </Form.Item>
                                </Form>
                                : null
                        }
                      </div>
                      <div className="flex-box plugin-edit-body-right-box-footer">
                        <Button
                          type="default" block
                          onClick={() => {
                            setPluginEditItem(null);
                            setPortEditItem(null);
                            setGroupEditItem(null);
                          }}>取消</Button>
                        <Button
                          type="primary" block
                          onClick={() => {
                            form1.validateFields()
                              .then((values) => {
                                const {
                                  alias, name, description, require, pushData, type, value,
                                  language, localPath, suffix, ...rest
                                } = values;
                                if (!!portEditItem) {
                                  // 编辑连接桩
                                  setPluginInfo((prev: any) => {
                                    return {
                                      ...prev,
                                      config: {
                                        ...prev?.config || {},
                                        [portEditItem.direction]: {
                                          ..._.omit(prev?.config?.[portEditItem.direction] || {}, portEditItem.name) || {},
                                          [name]: {
                                            ...prev?.config?.[portEditItem.direction][portEditItem.name],
                                            alias, name, description, type,
                                            ...portEditItem.direction === 'input' ? { require, } : { pushData, }
                                          },
                                        }
                                      }
                                    }
                                  });
                                  setPortEditItem(null);
                                } else if (!!pluginEditItem) {
                                  // 编辑属性
                                  let optionsObj: any = {};
                                  Object.keys(rest || {}).forEach((key: string) => {
                                    const name = key.split('$%$');
                                    if (name.length === 3 && name[0] === 'options') {
                                      if (optionsObj[name[1]]) {
                                        optionsObj[name[1]] = {
                                          ...optionsObj[name[1]],
                                          [name[2]]: values[key]
                                        };
                                      } else {
                                        optionsObj[name[1]] = { [name[2]]: values[key] };
                                      }
                                    }
                                  });
                                  const options = Object.entries(optionsObj || {})?.map((i: any) => {
                                    return {
                                      id: i[0],
                                      ...i[1],
                                      value: type === 'int' ?
                                        parseInt(Number(i[1].value).toFixed(0)) :
                                        type === 'float' ?
                                          (!!rest.precision ? parseFloat(Number(i[1].value).toFixed(rest.precision)) : parseFloat(i[1].value)) :
                                          ('' + i[1].value)
                                    }
                                  });
                                  const realValue = pluginEditItem?.widget?.type === "DatePicker" ?
                                    (!!values.value.$d ? moment(values.value.$d).format("YYYY-MM-DD HH:mm:ss") : undefined) :
                                    pluginEditItem?.widget?.type === "DataMap" ?
                                      options?.reduce((pre: any, cen: any) => {
                                        const { label, value } = cen;
                                        return { ...pre, [label]: value };
                                      }, {}) :
                                      pluginEditItem?.widget?.type === "Measurement" ?
                                        options?.reduce((pre: any, cen: any) => {
                                          const { alias, value } = cen;
                                          return { ...pre, [alias]: cen };
                                        }, {}) :
                                        value;
                                  setPluginInfo((prev: any) => {
                                    return {
                                      ...prev,
                                      config: {
                                        ...prev?.config || {},
                                        initParams: {
                                          ..._.omit(prev?.config?.initParams || {}, pluginEditItem.name) || {},
                                          [name]: {
                                            ..._.omit(_.omit(prev?.config?.initParams[pluginEditItem.name], 'value'), 'default'),
                                            alias, name, description, require, type, language, localPath,
                                            value: realValue,
                                            default: realValue,
                                            widget: {
                                              ...prev?.config?.initParams[pluginEditItem.name]?.widget,
                                              ...(options?.length > 0) ?
                                                pluginEditItem?.widget?.type !== "DataMap" ? {
                                                  options,
                                                  ...(!!rest.precision && type === 'float') ? { precision: rest.precision } : {}
                                                } : {} :
                                                { ...rest },
                                              ...!!suffix ? { suffix } : {},
                                            }
                                          },
                                        }
                                      }
                                    }
                                  });
                                  setPluginEditItem(null);
                                } else if (!!groupEditItem) {
                                  // 属性分组编辑
                                  setPluginInfo((prev: any) => {
                                    return {
                                      ...prev,
                                      config: {
                                        ...prev.config || {},
                                        group: (prev.config?.group || [])?.map((i: any) => {
                                          if (i.id === groupEditItem.id) {
                                            return {
                                              ...i,
                                              ...values
                                            };
                                          } else {
                                            return i;
                                          };
                                        })
                                      },
                                    };
                                  });
                                  setGroupEditItem(null);
                                }
                              })
                              .catch((err) => {
                                const { errorFields } = err;
                                errorFields?.length && message.error(`${errorFields[0]?.errors[0]} 是必填项`);
                              });
                          }}>保存</Button>
                      </div>
                    </Fragment>;
                  }, [pluginEditItem, portEditItem, pluginUpdate, groupEditItem])
                }
              </div>
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div >
  );
};

export default PluginEditPage;

// 拖放节点的外层
const ParentDiv = (props: any) => {
  const { children, onDragEnd, target, ...rest } =
    props;
  return (
    <DropSortableItem
      onDragEnd={(source: any, target: any) => {
        !!onDragEnd && onDragEnd?.(source, target);
      }}
      target={target}
    >
      <div {...rest}>{children}</div>
    </DropSortableItem>
  );
};
// 拖拽节点的外层
const DragComponents = (props: any) => {
  const { item, children, target, onDragEnd, ...rest } = props;
  return (
    <div>
      <DropSortableItem
        onDragEnd={(source: any, target: any) => {
          !!onDragEnd && onDragEnd?.(source, target);
        }}
        target={target}
      >
        {
          <DragSortableItem item={item} onDragStart={() => { }}>
            <div {...rest}>{children}</div>
          </DragSortableItem>
        }
      </DropSortableItem>
    </div>
  );
};