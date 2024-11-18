import React, { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApartmentOutlined, ApiOutlined, ClusterOutlined, FileZipOutlined } from '@ant-design/icons';
import * as _ from 'lodash-es';
import * as X6 from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import customRegister from '../../config';
import styles from './index.module.less';
import { Input, Menu, Modal, Popover } from 'antd';
import pluginIcon from '@/assets/imgs/icon-plugin.svg';
import TooltipDiv from '@/components/TooltipDiv';
import { getuid, guid } from '@/utils/utils';
import { archSize } from '../../common/constants';
import { register } from '@antv/x6-react-shape';
import AlgoNode from '@/components/AlgoNode';
import { useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';

interface Props { }

const { confirm } = Modal;
customRegister(X6);
const { Graph, Markup, Path, Shape, Cell, NodeView, Vector } = X6;

const PluginPanel: React.FC<Props> = (props: any) => {
  const { graphData, canvasPlugins, canvasStart } = useSelector((state: IRootActions) => state);
  const dndRef = useRef<any>(null);
  const [pluginType, setPluginType] = useState('plugin');
  const [ifBuildIn, setIfBuildIn] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [nodes, setNodes] = useState<any>([]);

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
        const { config = {} } = data?.data || {};
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
          ...data?.data,
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
          shape: `dag-node`,
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
          shape: `dag-node`,
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
  // 是否启动
  const ifStartFlow = useMemo(() => {
    return !!canvasStart;
  }, [canvasStart]);
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
    return (Object.entries(canvasPlugins) || [])
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
                      onDragStart={(event) => onDragStart(event, data)}
                      draggable
                      onMouseDown={(e: any) => {
                        !ifStartFlow &&
                          onDragStart(
                            e,
                            Object.assign({}, panel, {
                              data: {
                                ...data,
                                id: getuid(),
                              }
                            })
                          )
                      }}
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
  }, [canvasPlugins, ifBuildIn, searchVal]);
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
          <div className={`plugin-panel-right-type-item ${ifBuildIn ? 'nameStyle' : ''}`} onClick={() => { setIfBuildIn(true) }}>内置</div>
          <div className={`plugin-panel-right-type-item ${ifBuildIn ? '' : 'nameStyle'}`} onClick={() => { setIfBuildIn(false) }}>自定义</div>
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
    </div>
  );
};

export default memo(PluginPanel);