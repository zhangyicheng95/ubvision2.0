import React, { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApartmentOutlined, ApiOutlined, ClusterOutlined, FileZipOutlined, PlusOutlined } from '@ant-design/icons';
import * as _ from 'lodash-es';
import * as X6 from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import customRegister from '../../config';
import styles from './index.module.less';
import { Button, Dropdown, Input, Menu, message, Modal, Popover, Upload } from 'antd';
import pluginIcon from '@/assets/imgs/icon-plugin.svg';
import TooltipDiv from '@/components/TooltipDiv';
import { guid, intersectionABList } from '@/utils/utils';
import { archSize, generalConfigList, outputTypeObj } from '../../common/constants';
import { register } from '@antv/x6-react-shape';
import AlgoNode from '@/components/AlgoNode';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setLoading } from '@/redux/actions';
import BasicTable from '@/components/BasicTable';
import BasicConfirm from '@/components/BasicConfirm';
import { addPlugin, deletePlugin } from '@/services/flowPlugin';

interface Props { }

const { confirm } = Modal;
customRegister(X6);
const { Graph, Markup, Path, Shape, Cell, NodeView, Vector } = X6;

const PluginPanel: React.FC<Props> = (props: any) => {
  const {
    graphData, canvasPlugins, canvasStart, loading, canvasDirPlugins,
    getCanvasPlugins,
  } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const dndRef = useRef<any>(null);
  const uploadPluginRef = useRef<any>([]);
  const ifAllcover = useRef<any>(null);
  const [pluginType, setPluginType] = useState('plugin');
  const [ifBuildIn, setIfBuildIn] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [nodes, setNodes] = useState<any>([]);
  // 导入内置插件
  const [pluginsVisible, setPluginsVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);

  // 初始化侧边栏
  useEffect(() => {
    dndRef.current = new Dnd({
      target: graphData,
      scaled: false,
      // 实际添加到画布里的节点样式
      getDropNode(node: any, options) {
        const { store = {}, id } = node;
        const { previous = {} } = store;
        const { attrs = {} } = previous;
        const { data = {} } = attrs;
        const { config = {} } = data || {};
        const customId = `node_${guid()}`;
        const realInitParams = {
          ...config.initParams,
        };
        const tagRadioParams = (Object.entries(config?.initParams || {}) || [])
          ?.map?.((i: any) => {
            if (i?.[1]?.widget?.type === 'TagRadio') {
              return i[1];
            }
          })
          .filter(Boolean);
        if (tagRadioParams?.length) {
          tagRadioParams.forEach((tag: any) => {
            const { value, widget = {} } = tag;
            const { options } = widget;
            const selectedOptions =
              (!!value
                ? options.filter((i: any) => i.name === value)?.[0]?.children
                : options?.[0]?.children) || [];
            selectedOptions?.forEach((option: any) => {
              realInitParams[option?.name] = option;
            });
          });
        }
        const realData: any = {
          ...data,
          config: {
            ...config,
            initParams: realInitParams,
          },
          customId,
          id,
        };
        const portLength = Math.max(
          Object.keys(config?.input || {})?.length,
          Object.keys(config?.output || {})?.length
        );
        const nodeWidth =
          portLength * (archSize.width + 8) > archSize.nodeWidth
            ? portLength * (archSize.width + 8)
            : archSize.nodeWidth;
        const nodeHeight = archSize.nodeHeight;

        register({
          shape: `dag-node-${customId}`,
          // @ts-ignore
          component: <AlgoNode key={id} data={realData} />,
          ports: {
            groups: {
              top: {
                position: 'top',
                attrs: {
                  fo: {
                    r: 6,
                    magnet: true,
                    strokeWidth: 1,
                    fill: '#fff',
                  },
                },
              },
              bottom: {
                position: 'bottom',
                attrs: {
                  fo: {
                    r: 6,
                    magnet: true,
                    strokeWidth: 1,
                    fill: '#fff',
                  },
                },
              },
            },
          },
        });

        return graphData?.createNode({
          shape: `dag-node-${customId}`,
          id,
          ports: data.ports,
          portMarkup: [Markup.getForeignObjectMarkup()],
          data: { status: 'STOPPED' },
          config: realData,
          customId,
          size: {
            width: nodeWidth,
            height: nodeHeight,
          },
        });
      },
      // 拖拽结束时，验证节点是否可以放置到目标画布中。
      validateNode(droppingNode, options) {
        return true;
      },
    });
  }, [graphData]);
  // 开始拖拽
  const onDragStart = (e: any, item: any) => {
    if (!e) {
      return;
    }
    const node = graphData.createNode({
      width: 100,
      height: 40,
      label: item,
      attrs: {
        data: item,
        label: {
          text: 'Rect',
          fill: '#6a6c8a',
        },
        body: {
          stroke: '#31d0c6',
          strokeWidth: 2,
        },
      },
    });
    dndRef.current.start(node, e.nativeEvent);
  };
  // 插件列表
  const items: any = useMemo(() => {
    const result = (canvasPlugins || []).reduce((prev: any, cent: any) => {
      const { config = {} } = cent;
      if (!cent.category) {
        cent['category'] = '未命名';
      }
      const topPorts = Object.entries(config?.input || {})?.map?.(
        (top: any, index) => {
          const cen = {
            direction: 'input',
            name: top[0],
            ...top[1],
            sort: index,
          };
          return {
            customId: `port_${guid()}`,
            group: 'top',
            ...cen,
            label: cen
          };
        }
      );
      const bottomPorts = Object.entries(config?.output || {})?.map?.(
        (bottom: any, index) => {
          const cen = {
            direction: 'output',
            name: bottom[0],
            ...bottom[1],
            sort: Object.keys(config?.input)?.length + index,
          };
          return {
            customId: `port_${guid()}`,
            group: 'bottom',
            ...cen,
            label: cen
          };
        }
      );
      const id = `node_${guid()}`;
      const item: any = {
        // id: id,
        data: {
          ...cent,
          config: {
            ...cent.config,
            generalConfig: {
              ...(!!cent.config?.generalConfig
                ? Object.entries(generalConfigList)?.reduce(
                  (pre: any, cen: any) => {
                    return Object.assign({}, pre, {
                      [cen[0]]: {
                        ...cen[1],
                        ...(!!cent.config?.generalConfig[cen[0]]
                          ? {
                            value:
                              cent.config?.generalConfig[cen[0]]
                                ?.value,
                          }
                          : {}),
                      },
                    });
                  },
                  {}
                )
                : generalConfigList),
            },
          },
          ports: {
            groups: {
              "top": {
                "position": "top",
                "attrs": {
                  "fo": {
                    "r": 6,
                    "magnet": true,
                    "strokeWidth": 1,
                    "fill": "#fff"
                  }
                }
              },
              "bottom": {
                "position": "bottom",
                "attrs": {
                  "fo": {
                    "r": 6,
                    "magnet": true,
                    "strokeWidth": 1,
                    "fill": "#fff"
                  }
                }
              }
            },
            items: topPorts.concat(bottomPorts),
          }
        },
        ports: {
          groups: {
            "top": { "position": "top", "attrs": { "fo": { "r": 6, "magnet": true, "strokeWidth": 1, "fill": "#fff" } } }, "bottom": { "position": "bottom", "attrs": { "fo": { "r": 6, "magnet": true, "strokeWidth": 1, "fill": "#fff" } } }
          },
          items: topPorts.concat(bottomPorts),
        }
      };

      return {
        ...prev,
        ...(cent.category
          ? {
            [cent.category]: _.has(prev, cent.category)
              ? prev[cent.category].concat(item)
              : [].concat(item),
          }
          : {}),
      };
    }, {});
    return (Object.entries(result) || [])
      ?.reduce((pre: any, res: any, index: number) => {
        const title = res[0];
        const showList = res[1]?.filter((i: any) => i?.data?.buildIn === ifBuildIn);

        if (!showList?.length) {
          return pre;
        };
        return pre.concat({
          key: '' + pre?.length,
          label: title,
          children: (showList || [])
            ?.reduce((pre: any, panel: any) => {
              const { data = {} } = panel;
              const {
                alias = '',
                name = '',
                category = '',
                description,
                buildIn
              } = data;
              if (alias?.indexOf(searchVal) > -1 || name?.indexOf(searchVal) > -1) {
                return pre.concat({
                  key: `${pre?.length}-${name}`,
                  label: <Popover
                    placement={description?.length > 50 ? 'bottomLeft' : 'right'}
                    title={`${alias}（${name}）`}
                    content={description || '-'}
                    key={`${category}_${index}`}
                  >
                    <div
                      className="item flex-box"
                      style={(index + 1) === showList.length ? { marginBottom: 0 } : {}}
                      onDragStart={(event) => !canvasStart && onDragStart(event, data)}
                      draggable
                    >
                      <div className="img-box flex-box-center">
                        <img
                          src={pluginIcon}
                          alt="icon"
                          className="img"
                        />
                      </div>
                      <TooltipDiv className="text-content">
                        {alias || name}
                      </TooltipDiv>
                    </div>
                  </Popover>
                });
              } else {
                return pre;
              }
            }, []),
        });
      }, [])
      ?.filter(Boolean);
  }, [canvasPlugins, ifBuildIn, searchVal, canvasStart]);
  // 画布中所有的节点
  const countNodes = useCallback(() => {
    const result = (graphData.getNodes() || [])
      ?.reduce((pre: any, cen: any, index: number) => {
        const item = cen?.store?.data || {};
        if (!item?.config?.alias && !item?.config?.name) {
          return pre;
        }
        return pre.concat([
          {
            key: '' + index,
            label: `${item?.config?.alias} (${item?.config?.name})`,
            onClick: () => {
              graphData.centerPoint(
                item?.position.x + item?.size?.width / 2,
                item?.position.y + item?.size?.height / 2
              );
              graphData.zoomTo(1);
            }
          },
          { type: 'divider' }
        ])
      }, []);
    setNodes(result);
  }, [graphData, searchVal]);
  // 上传插件，格式化
  const formatPlugin = (item: any) => {
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
  // 上传完插件
  const addPluginCancel = () => {
    // 处理完后，把该数组清空，用于下一次的上传对比
    uploadPluginRef.current = [];
    ifAllcover.current = false;
    message.success('插件导入成功');
    getCanvasPlugins?.();
  };
  // 选择插件
  const pluginUploadProps = {
    accept: '.json',
    showUploadList: false,
    multiple: true,
    beforeUpload(file: any, fileList: object[]) {
      const reader = new FileReader(); // 创建文件对象
      reader.readAsText(file); // 读取文件的内容/URL
      reader.onload = (res: any) => {
        const {
          target: { result },
        } = res;
        try {
          const item = JSON.parse(result);
          const { name, version, alias, config = {} } = item;
          uploadPluginRef.current.push(item);
        } catch (err) {
          message.error(`${file.name}文件格式错误，请修改后上传。`);
          uploadPluginRef.current.push(null);
        };
        if (uploadPluginRef.current?.length === fileList?.length) {
          // 集齐所有用户上传的文件
          const sameList = intersectionABList(canvasPlugins, uploadPluginRef.current, 'name');
          if (uploadPluginRef.current?.length !== sameList?.length) {
            // 上传的文件列表中，既有需要覆盖的，也有需要单独添加的，在这里处理单独添加的
            function addPluginFun(index: number) {
              const item1 = uploadPluginRef.current?.filter((i: any) => i.name === sameList[index])?.[0];
              if (!!item1) {
                addPluginFun(index + 1);
                return;
              }
              const item = uploadPluginRef.current[index];
              if (!item) {
                if (!sameList?.length) {
                  addPluginCancel();
                }
                return;
              };
              const param = formatPlugin(item);
              addPlugin(param).then(() => {
                addPluginFun(index + 1);
              });
            };
            addPluginFun(0);
          };
          if (!!sameList?.length) {
            // 有需要覆盖更新的
            function uploadPluginFun(index: number) {
              if (!sameList[index]) {
                addPluginCancel();
                return;
              };
              const item = uploadPluginRef.current?.filter((i: any) => i.name === sameList[index])?.[0];
              if (!item) {
                return;
              }
              const { alias, name } = item;
              const { id } = canvasPlugins?.filter((i: any) => i.name === sameList[index])?.[0] || {};
              if (ifAllcover.current) {
                deletePlugin(id).then((res) => {
                  if (!!res && res.code === 'SUCCESS') {
                    const param = formatPlugin(item);
                    addPlugin(param).then(() => {
                      uploadPluginFun(index + 1);
                    });
                  } else {
                    message.error(res?.message || '接口异常');
                  };
                });
              } else {
                confirm({
                  title: `${alias || name} 已存在`,
                  content: (
                    <BasicConfirm
                      ifAllOk
                      ifAllOkClick={(e: boolean) => {
                        ifAllcover.current = e;
                      }}
                    >
                      确认覆盖？
                    </BasicConfirm>
                  ),
                  okText: '覆盖',
                  cancelText: '跳过',
                  onOk() {
                    deletePlugin(id).then((res) => {
                      if (!!res && res.code === 'SUCCESS') {
                        const param = formatPlugin(item);
                        addPlugin(param).then(() => {
                          uploadPluginFun(index + 1);
                        });
                      } else {
                        message.error(res?.message || '接口异常');
                      };
                    });
                  },
                  onCancel() {
                    if (ifAllcover.current) {
                      Modal.destroyAll();
                    }
                  },
                });
              };
            };
            uploadPluginFun(0);
          }
        };
      };
      return false;
    },
  };
  // 注册插件
  const startList: any = [
    {
      key: `insert-buildIn`,
      label: <Button
        size='small'
        style={{ width: '100%' }}
        onClick={() => {
          setPluginsVisible(true);
        }}
      >
        导入内置插件
      </Button>
    },
    {
      type: 'divider',
    },
    {
      key: `insert-custom`,
      label: <Upload {...pluginUploadProps}>
        <Button
          size='small'
          style={{ width: '100%' }}
        >
          导入自定义插件
        </Button>
      </Upload>
    }
  ];
  // 列表多选
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: []) => {
      setSelectedRows(selectedRowKeys);
    },
  };
  const columns = [
    {
      title: '插件别名',
      dataIndex: 'alias',
      key: 'alias',
      width: '15%',
      render: (text: any, record: any) => {
        const name = `${record.buildIn ? '* ' : ''} ${text || ''}`;
        return <TooltipDiv title={name}>{name}</TooltipDiv>;
      },
    },
    {
      title: '插件名称',
      dataIndex: 'name',
      key: 'name',
      width: '10%',
      render: (text: any) => {
        return <TooltipDiv title={text}>{text}</TooltipDiv>;
      },
    },
    {
      title: '所属分组',
      dataIndex: 'category',
      key: 'category',
      width: '10%',
      render: (text: any) => {
        return <TooltipDiv title={text}>{text}</TooltipDiv>;
      },
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: '10%',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: any) => {
        return <TooltipDiv title={text}>{text}</TooltipDiv>;
      },
    },
    // {
    //   title: '处理人',
    //   dataIndex: 'auth',
    //   key: 'auth',
    //   width: '10%',
    // },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: '80px',
      render: (text: any, record: any) => {
        const { name } = record;
        const { id } = canvasPlugins?.filter((i: any) => i.name === name)?.[0] || {};
        return (
          <div>
            <a onClick={() => {
              dispatch(setLoading(true));
              if (id) {
                // 更新插件
                deletePlugin(id).then((res) => {
                  if (!!res && res.code === 'SUCCESS') {
                    const param = formatPlugin(record);
                    addPlugin(param).then(() => {
                      message.success('插件更新成功');
                      dispatch(setLoading(false));
                      getCanvasPlugins?.();
                    });
                  } else {
                    message.error(res?.message || '接口异常');
                  };
                });
              } else {
                // 添加插件
                const param = formatPlugin(record);
                addPlugin(param).then(() => {
                  message.success('插件导入成功');
                  dispatch(setLoading(false));
                  getCanvasPlugins?.();
                });
              }
            }}>
              {id ? '更新' : '导入'}
            </a>
          </div>
        );
      },
    },
  ];
  // 关闭内置插件窗口
  const onPluginsVisibleCancel = () => {
    setPluginsVisible(false);
    setSearchVal('');
    getCanvasPlugins?.();
  };
  // 导入内置插件
  const onPluginsVisibleOk = () => {
    dispatch(setLoading(true));
    function addPluginFun(index: number) {
      const itemKey = selectedRows[index];
      if (!itemKey) {
        message.success('插件导入成功');
        dispatch(setLoading(false));
        onPluginsVisibleCancel();
        return;
      };
      const item: any = canvasPlugins?.filter((i: any) => i.name === itemKey)?.[0];
      if (!item) {
        const item = canvasDirPlugins?.filter((i: any) => i.name === itemKey)?.[0];
        if (!item) return;
        // 添加
        const param = formatPlugin(item);
        addPlugin(param).then(() => {
          addPluginFun(index + 1);
        });
      } else {
        // 更新
        deletePlugin(item.id).then((res) => {
          if (!!res && res.code === 'SUCCESS') {
            const param = formatPlugin(item);
            addPlugin(param).then(() => {
              addPluginFun(index + 1);
            });
          } else {
            message.error(res?.message || '接口异常');
          };
        });
      }
    };
    addPluginFun(0);
  };

  return (
    <div className={`flex-box ${styles.pluginPanel}`}>
      <div className="plugin-panel-left">
        {
          [
            { label: '插件', key: 'plugin', icon: <ApiOutlined className='plugin-panel-left-item-icon' /> },
            { label: '通信', key: 'communication', icon: <ClusterOutlined className='plugin-panel-left-item-icon' /> },
            { label: '节点', key: 'node', icon: <ApartmentOutlined className='plugin-panel-left-item-icon' /> },
            { label: '资源', key: 'resources', icon: <FileZipOutlined className='plugin-panel-left-item-icon' /> },
            // { label: '案例', key: 'case' }
          ]?.map((item: any, index: number) => {
            const { key, label, icon } = item;
            return <div
              className={`plugin-panel-left-item ${pluginType === key ? 'primaryBackgroundColor' : ''}`}
              key={`plugin-panel-left-item-${key}`}
              onClick={() => {
                setPluginType(key);
                if (key === 'node') {
                  countNodes();
                };
                // reactFlow?.fitView?.({ duration: 500 });
              }}
            >
              {icon}
              {label}
            </div>
          })
        }
      </div>
      <div className="flex-box-column plugin-panel-right">
        <div className="flex-box plugin-panel-right-type">
          <div className="flex-box" style={{ gap: 16, flex: 1 }}>
            <div className={`plugin-panel-right-type-item ${ifBuildIn ? 'nameStyle' : ''}`} onClick={() => { setIfBuildIn(true) }}>内置</div>
            <div className={`plugin-panel-right-type-item ${ifBuildIn ? '' : 'nameStyle'}`} onClick={() => { setIfBuildIn(false) }}>自定义</div>
          </div>
          <Dropdown menu={{ items: startList }}>
            <Button
              size='small'
              icon={<PlusOutlined />}
              name="注册插件"
              disabled={!!canvasStart}
            />
          </Dropdown>
        </div>
        <div className="plugin-panel-right-search">
          <Input.Search onSearch={(val) => {
            setSearchVal(val);
          }} />
        </div>
        <div className="plugin-panel-right-body">
          {
            pluginType === 'plugin' ?
              <Menu
                defaultOpenKeys={Array.from({ length: 30 })?.map?.(
                  (i, index) => '' + index
                )}
                mode="inline"
                items={items}
                selectable={false}
                disabled={canvasStart}
              />
              :
              pluginType === 'node' ?
                <Fragment>
                  <Menu
                    mode="inline"
                    items={nodes?.filter((i: any) => _.toUpper(i?.label).indexOf(_.toUpper(searchVal)) > -1)}
                    selectable={false}
                  />
                </Fragment>
                :
                pluginType === 'communication' ?
                  <Fragment>

                  </Fragment>
                  :
                  pluginType === 'resources' ?
                    <Fragment>

                    </Fragment>
                    :
                    null
          }
        </div>
      </div>

      {pluginsVisible ? (
        <Modal
          title={
            <div className="flex-box" style={{ gap: 16 }}>
              载入内置插件
              <div style={{ width: 250 }}>
                <Input.Search
                  placeholder="搜索组件"
                  allowClear
                  onSearch={(val: any) => {
                    setSearchVal(val);
                  }}
                />
              </div>
            </div>
          }
          width="calc(100vw - 48px)"
          wrapClassName={'modal-table-btn'}
          centered
          open={pluginsVisible}
          onCancel={() => {
            onPluginsVisibleCancel();
          }}
          footer={
            <div className="flex-box-justify-end" style={{ gap: 8 }}>
              <Button onClick={() => onPluginsVisibleCancel()}>关闭</Button>
              <Button
                type="primary"
                disabled={loading || !selectedRows?.length}
                onClick={() => onPluginsVisibleOk()}
              >
                导入
              </Button>
            </div>
          }
        >
          <BasicTable
            className="plugin-list-table"
            rowSelection={{
              ...rowSelection,
            }}
            columns={columns}
            loading={loading}
            pagination={null}
            dataSource={canvasDirPlugins?.filter((plu: any) => {
              return (
                _.toUpper(plu?.name).indexOf(_.toUpper(searchVal)) > -1 ||
                _.toUpper(plu?.alias).indexOf(_.toUpper(searchVal)) > -1
              );
            })}
            rowKey={(record: any) => {
              return record?.name;
            }}
          />
        </Modal>
      ) : null}
    </div>
  );
};

export default memo(PluginPanel);