import React, { useEffect, useCallback, useRef, memo } from 'react';
import { Modal } from 'antd';
import * as _ from 'lodash-es';
import { Graph, Markup } from '@antv/x6';
import { Snapline } from '@antv/x6-plugin-snapline';
import { History } from '@antv/x6-plugin-history';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { Selection } from '@antv/x6-plugin-selection';
import styles from './index.module.less';
import BasicPort from '@/components/BasicPort';
import { createRoot } from 'react-dom/client';
import SimpleNodeView from '../../config/miniMapNodeView';
import MiniMapPanel from '../MinimapPanel';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasData, setGraphData, setLoading, setSelectedNode } from '@/redux/actions';
import { Transform } from '@antv/x6-plugin-transform';
import { archSize, generalConfigList, portTypeObj } from '../../common/constants';
import { Group } from '../../config/shape';
import { register } from '@antv/x6-react-shape';
import AlgoNode from '@/components/AlgoNode';
import { getActualWidthOfChars } from '@/utils/utils';

const { confirm } = Modal;
interface Props { }

const CanvasFlow: React.FC<Props> = (props: any) => {
  const { canvasData, canvasStart, selectedNode } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const dom = useRef<any>(null);
  const graphRef = useRef<any>(null);
  const updateTimerRef = useRef<any>(null);
  // 节点和线的删除按钮
  const removeBtnOption = {
    name: 'button',
    args: {
      markup: [
        {
          tagName: 'circle',
          selector: 'button',
          attrs: {
            r: 8,
            stroke: '#fe854f',
            'stroke-width': 2,
            fill: 'white',
            cursor: 'pointer',
          },
        },
        {
          tagName: 'text',
          textContent: 'X',
          selector: 'icon',
          attrs: {
            fill: '#fe854f',
            'font-size': 10,
            'text-anchor': 'middle',
            'pointer-events': 'none',
            y: '0.3em',
          },
        },
      ],
      offset: {
        y: 0,
        x: 0,
      },
      distance: '50%',
      onClick(flow: any) {
        const { view } = flow;
        const { cell } = view;
        let title = '';
        if (cell.id?.indexOf('group') > -1) {
          title = `确定删除分组 ${cell.id} ?`;
        } else if (cell.isNode()) {
          const { alias, name } = cell?.store?.data?.config || {};
          title = `确定删除 ${alias || name} ?`;
        } else {
          const { sourceView, targetView } = view || {};
          title = `删除从 ${sourceView?.cell?.store?.data?.config?.alias} 到 ${targetView?.cell?.store?.data?.config?.alias} 的边？`;
        }
        confirm({
          title: title,
          content: '删除后无法恢复',
          onOk() {
            // 如果删除的是组，那么先删除里面的节点，最后删除组
            if (cell.id?.indexOf('group') > -1) {
              const { childrenList } = cell?.store?.data;
              if (childrenList?.length) {
                childrenList.forEach((id: any) => {
                  const nodeCell = graphRef.current?.getCellById(id);
                  nodeCell?.remove();
                });
              }
            }
            cell.remove();
          },
          onCancel() { },
        });
      },
    },
  };

  // 初始化画布
  useEffect(() => {
    const container = dom.current;
    if (!!container && !graphRef.current) {
      graphRef.current = new Graph({
        container,
        async: true, // 是否是异步渲染的画布。异步渲染不会阻塞 UI，对需要添加大量节点和边时的性能提升非常明显。但需要注意的是，一些同步操作可能会出现意外结果，比如获取某个节点的视图、获取节点/边的包围盒等，因为这些同步操作触发时异步渲染可能并没有完成。
        autoResize: true,
        grid: {
          visible: true,
          type: 'dot',
          args: {
            color: 'rgba(144,144,144,.5)', // 主网格线颜色
            thickness: 1, // 主网格线宽度
          },
        },
        // 画布的缩放
        mousewheel: {
          enabled: true,
          modifiers: ['ctrl', 'meta'],
          minScale: 0.2,
          maxScale: 2,
        },
        // 画布是否可拖动
        panning: {
          enabled: true,
          eventTypes: ['leftMouseDown'], // mouseWheel 触控板随意滑动
        },
        // 节点是否可被拖动
        interacting(args: any) {
          const { cell } = args;
          const data = cell.getData();
          if (
            !_.isEmpty(data) &&
            _.isBoolean(data?.graphLock) &&
            data.graphLock
          ) {
            return { nodeMovable: false };
          }
          return true;
        },
        // 将一个节点拖动到另一个节点中，使其成为另一节点的子节点
        embedding: {
          enabled: true,
          // findParent: 'center',
          frontOnly: false,
          validate: function (this: any, args: any) {
            const graph = this;
            const { child, childView, parent, parentView } = args;
            const {
              shape: source,
              position: sourcePosition,
              size: sourceSize,
            } = child?.store?.data;
            const {
              shape: target,
              position: targetPosition,
              size: targetSize,
            } = parent?.store?.data;
            if (updateTimerRef.current) {
              clearTimeout(updateTimerRef.current);
              Modal.destroyAll();
            }
            if (
              source === 'dag-group' &&
              target.includes('dag-node') &&
              !parent?._parent
            ) {
              updateTimerRef.current = setTimeout(() => {
                confirm({
                  title: (
                    <div>
                      是否将节点{' '}
                      <span style={{ color: '#1acccf' }}>
                        {parent?.store?.data?.config?.alias}
                      </span>{' '}
                      加入分组？
                    </div>
                  ),
                  content: '',
                  closable: true,
                  okText: '加入',
                  cancelText: '不加入',
                  onOk() {
                    Modal.destroyAll();
                    child.addChild(graphRef.current?.getCellById?.(parent.id));
                  },
                  onCancel() {
                    Modal.destroyAll();
                  },
                });
              }, 200);
              return false;
            } else if (
              source.includes('dag-node') &&
              target === 'dag-group' &&
              _.isBoolean(parent?.collapsed) &&
              !parent?.collapsed &&
              !parent?._children?.filter((i: any) => i.id === child.id)?.length
            ) {
              updateTimerRef.current = setTimeout(() => {
                confirm({
                  title: (
                    <div>
                      是否将节点{' '}
                      <span style={{ color: '#1acccf' }}>
                        {child?.store?.data?.config?.alias}
                      </span>{' '}
                      加入分组？
                    </div>
                  ),
                  content: '',
                  okText: '加入',
                  cancelText: '不加入',
                  onOk() {
                    parent.addChild(graphRef.current?.getCellById?.(child.id));
                    Modal.destroyAll();
                  },
                  onCancel() {
                    //  graphRef.current.undo?.();
                    Modal.destroyAll();
                  },
                });
              }, 200);
              return false;
            }
            return (
              source.includes('dag-node') &&
              target === 'dag-group' &&
              _.isBoolean(parent?.collapsed) &&
              !parent?.collapsed
            );
          },
        },
        // 这里是所有桩子的回调,自定义样式都要走这里
        onPortRendered(args: any) {
          const { node, port } = args;
          const { id, label, group, color } = port || {};
          const selectors = args.contentSelectors;
          const container = selectors && selectors.foContent;
          if (container) {
            const root = createRoot(container);
            root.render(<BasicPort
              id={id}
              label={label}
              group={group}
              color={color}
              node={node}
            />);
          }
        },
        // 连接线的配置
        connecting: {
          snap: {
            // 连线的过程中距离节点或者连接桩 50px 时会触发自动吸附
            radius: 50,
          },
          allowBlank: false,
          allowLoop: false,
          allowNode: false,
          allowPort: true,
          highlight: true,
          allowMulti: 'withPort',
          connector: 'algo-connector',
          connectionPoint: 'anchor',
          anchor: 'center',
          // 设置只有下部的链接桩可以拖出来线
          validateMagnet(args: any) {
            const { cell, magnet } = args;
            const data = cell.getData();
            if (
              !_.isEmpty(data) &&
              _.isBoolean(data?.graphLock) &&
              data.graphLock
            ) {
              return false;
            }
            return magnet.getAttribute('port-group') !== 'top';
          },
          // 在移动边的时候判断连接是否有效
          validateConnection(args: any) {
            const {
              sourceCell,
              targetCell,
              sourcePort,
              targetPort,
              sourceMagnet,
              targetMagnet,
            } = args;
            if (targetMagnet.getAttribute('port-group') === 'top') {
              // 只能往上面的桩子上拖线，并且只有相同类型的能连线
              const source = sourceMagnet
                .getElementsByTagName('div')[1]
                ?.getAttribute('type');
              const target = targetMagnet
                .getElementsByTagName('div')[1]
                ?.getAttribute('type');
              if (source === target || target === 'any' || source === 'any') {
                return true;
              } else {
                return false;
              }
            }
            return false;
          },
          createEdge(args: any) {
            const { sourceCell, sourceMagnet = {} } = args;
            const id = sourceMagnet.getAttribute('port');
            const color =
              sourceMagnet.getElementsByClassName(`port_${id}`)[0]?.style
                ?.background || '#1c5050';
            return graphRef.current?.createEdge({
              shape: `dag-edge`,
              attrs: {
                line: {
                  strokeWidth: 4,
                  stroke: color,
                },
              },
            });
          },
        },
      });
      // 辅助线
      graphRef.current.use(
        new Snapline({
          enabled: true,
          tolerance: 20, // 对齐精度，即移动节点时与目标位置的距离小于 tolerance 时触发显示对齐线
          sharp: false, // 是否显示截断的对齐线
          resizing: true, // 改变节点大小时是否触发对齐线
          clean: true,
        }),
      );
      // 撤销/重做
      graphRef.current.use(
        new History({
          // 撤销/重做
          enabled: true,
          // 插入队列之前触发
          beforeAddCommand: (event: any, args: any) => {
            if (!!args.key && ['tools'].includes(args.key)) {
              return false;
            }
            return true;
          },
        })
      );
      // 小地图
      graphRef.current.use(
        new MiniMap({
          scalable: true, // 是否可缩放
          container: document.getElementById('mini-map') || undefined, // 挂载小地图的容器
          graphOptions: {
            createCellView(cell: any) {
              // 可以返回三种类型数据
              // 1. null: 不渲染
              // 2. undefined: 使用 X6 默认渲染方式
              // 3. CellView: 自定义渲染
              if (cell.isEdge()) {
                return null
              };
              if (cell.isNode()) {
                return SimpleNodeView;
              };
              return null;
            },
          },
        })
      );
      // Transform
      // graphRef.current.use(
      //   new Transform({
      //     //  调整节点大小的功能
      //     resizing: {
      //       enabled: true, // 节点大小可调
      //       orthogonal: false, // 是否显示中间调整点
      //       restrict: false, // 调整大小边界是否可以超出画布边缘
      //       autoScroll: true, // 是否自动滚动画布
      //       preserveAspectRatio: false, // 缩放过程中是否保持节点的宽高比例
      //       allowReverse: false, // 到达最小宽度或者高度时是否允许控制点反向拖动
      //       minWidth: archSize.nodeWidth,
      //       minHeight: archSize.nodeHeight,
      //     },
      //   })
      // );
      // 框选功能
      graphRef.current.use(
        new Selection({
          enabled: false,
          multiple: true, // 是否启用点击多选，按住 ctrl 或 command 键点击节点实现多选。
          rubberband: true, // 启用框选
          movable: true,
          showNodeSelectionBox: true,
          // modifiers: 'shift|alt|meta'
        })
      );
      dispatch(setGraphData(graphRef.current));
    };

    return () => {
      // graphRef.current?.dispose?.();
      // unbindEvent();
    }
  }, []);
  // 绑定事件
  useEffect(() => {
    if (canvasData?.id) {
      bindEvent();
    }

    return () => {
      if (canvasData?.id) {
        unbindEvent();
      }
    }
  }, [graphRef.current, canvasData]);
  // 绑定事件
  const bindEvent = useCallback(() => {
    if (graphRef.current) {
      graphRef?.current?.on('edge:mouseenter', edgeMoveIn);
      graphRef?.current?.on('edge:mouseleave', edgeMoveOut);
      graphRef?.current?.on('edge:contextmenu', edgeRightClick);
      graphRef?.current?.on('node:added', nodeAdd);
      graphRef?.current?.on('node:click', nodeClick);
      graphRef?.current?.on('node:dblclick', nodeDoubleClick);
      graphRef?.current?.on('node:contextmenu', nodeRightClick);
      graphRef?.current?.on('node:mouseenter', nodeMoveIn);
      graphRef?.current?.on('node:mouseleave', nodeMoveOut);

      // graphRef?.current?.on('edge:added', edgeAdd);
      // graphRef?.current?.on('cell:added', cellAdd);
      // graphRef?.current?.on('cell:removed', cellRemove);
      // graphRef?.current?.on('node:change:data', nodeChange);
      // graphRef?.current?.on('blank:click', reset);
      graphRef?.current?.on('blank:dblclick', reset);
    }
  }, [graphRef.current, canvasData]);
  const unbindEvent = useCallback(() => {
    if (graphRef.current) {
      // 删除所有事件监听
      graphRef?.current?.off('edge:mouseenter', edgeMoveIn);
      graphRef?.current?.off('edge:mouseleave', edgeMoveOut);
      graphRef?.current?.off('edge:contextmenu', edgeRightClick);
      graphRef?.current?.off('node:added', nodeAdd);
      graphRef?.current?.off('node:click', nodeClick);
      graphRef?.current?.off('node:dblclick', nodeDoubleClick);
      graphRef?.current?.off('node:contextmenu', nodeRightClick);
      graphRef?.current?.off('node:mouseenter', nodeMoveIn);
      graphRef?.current?.off('node:mouseleave', nodeMoveOut);
    }
  }, [graphRef.current, canvasData]);
  // 初始化渲染节点
  const initGraph = useCallback(() => {
    return new Promise((resolve: any, reject: any) => {
      console.log('画布数据', canvasData);
      const { groups, nodes, edges } = canvasData?.flowData || {};
      const formatPorts = (list: any) => {
        const prePorts = [].concat(list || []);
        const topPorts = (prePorts || [])?.filter((i: any) => i.group === 'top')?.map?.((item: any, index: number) => {
          const color =
            portTypeObj[item?.label?.type]?.color || portTypeObj.default;
          return Object.assign(
            {},
            item,
            !!item?.label?.sort ? {} : { label: { ...item?.label, ...item?.label?.sort ? {} : { sort: index } } },
            {
              type: item?.label?.type,
              color,
            }
          );
        })?.sort((a: any, b: any) => a?.label?.sort - b?.label?.sort);
        const bottomPorts = (prePorts || [])?.filter((i: any) => i.group === 'bottom')?.map?.((item: any, index: number) => {
          const color =
            portTypeObj[item?.label?.type]?.color || portTypeObj.default;
          return Object.assign(
            {},
            item,
            !!item?.label?.sort ? {} : { label: { ...item?.label, ...item?.label?.sort ? {} : { sort: index } } },
            {
              type: item?.label?.type,
              color,
            }
          );
        })?.sort((a: any, b: any) => a?.label?.sort - b?.label?.sort);
        return { topPorts, bottomPorts };
      };
      let portTypeList: any = {};
      const groupList = (groups || []).reduce((prev: any, cent: any) => {
        return { ...prev, [cent.customId]: cent };
      }, {});
      const nodeList = (nodes || []).reduce((prev: any, cent: any) => {
        if (!cent) {
          return prev;
        }
        const { topPorts, bottomPorts } = formatPorts(cent?.ports?.items || []);
        return {
          ...prev,
          [cent?.customId]: {
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
                                cent.config?.generalConfig[cen[0]]?.value,
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
              ...cent?.ports,
              items: topPorts.concat(bottomPorts)
            }
          },
        };
      }, {});
      const edgeList = (edges || []).reduce((prev: any, cent: any) => {
        return { ...prev, [cent.id]: cent };
      }, {});
      const createGroup = (
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        attrs: { label: any },
        childrenList: [],
        label: any
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
            labelSec: {
              text: label,
              fill:
                localStorage.getItem('theme-mode') === 'dark'
                  ? '#fefefe'
                  : '#2E394D',
            },
          }),
          childrenList,
          zIndex: 0,
        });
        graphRef.current.addNode(group);
        return group;
      };
      setTimeout(() => {
        Object.entries(nodeList || {}).forEach((node: any) => {
          const { width = 0, height = 0 } = node[1]?.size || {};
          register({
            shape: `dag-node-${node[1].id}`,
            // @ts-ignore
            component: (
              <AlgoNode
                data={node[1]}
              />
            ),
          });
          const { topPorts, bottomPorts } = formatPorts(node[1]?.ports?.items || []);
          const nodeCanvas = graphRef?.current.addNode({
            shape: `dag-node-${node[1].id}`,
            id: node[1].id,
            portMarkup: [Markup.getForeignObjectMarkup()],
            ports: Object.assign({}, node[1]?.ports, {
              items: topPorts.concat(bottomPorts)
            }),
            data: { status: 'STOPPED', graphLock: false },
            position: node[1].position,
            size: {
              width: width < archSize.nodeWidth ? archSize.nodeWidth : width,
              height:
                height < archSize.nodeHeight ? archSize.nodeHeight : height,
            },
            config: node[1],
            customId: node[1].customId,
          });
          const data = nodeCanvas?.getData() || {};
          nodeCanvas.setData({ ...data });
        });
        Object.entries(groupList || {}).forEach((group: any) => {
          const {
            id,
            position: { x, y },
            size,
            attrs,
            children = [],
            childrenList = [],
            collapsed = false,
          } = group[1];
          let { width, height } = size;
          const childs = childrenList?.length ? childrenList : children;
          let label = '';
          childs.forEach((child: any, index: number) => {
            const node = graphRef?.current.getCellById(child);
            if (!!node) {
              const { store = {} } = node;
              const { data = {} } = store;
              const { config = {} } = data;
              const { alias, name } = config;
              const text = getActualWidthOfChars(alias || name);
              if (childs?.length <= 3) {
                label += `${text} 
          
`;
              } else {
                if (index < 2) {
                  label += `${text}
          
`;
                }
                if (index === 2) {
                  label += `${getActualWidthOfChars(alias || name, {
                    boxSize: 130,
                  })} 
              
等${childs?.length}个节点`;
                }
              }
            }
          });

          const parent = createGroup(
            id,
            x,
            y,
            width,
            height,
            attrs,
            childs,
            label
          );
          childs.forEach((child: any) => {
            const node = graphRef?.current.getCellById(child);
            if (collapsed) {
              node?.hide?.();
            }
            parent.addChild(node);
          });
          if (collapsed) {
            parent.toggleCollapse();
          }
          if (!!parent?.store?.data?.attrs?.labelSec?.fill) {
            if (collapsed) {
              parent.store.data.attrs.labelSec.fill =
                localStorage.getItem('theme-mode') === 'dark'
                  ? '#f3f4f5'
                  : '#2E394D';
            } else {
              parent.store.data.attrs.labelSec.fill = 'transparent';
            }
          }
        });
        Object.entries(edgeList || {}).forEach((edge: any) => {
          const { attrs, source } = edge[1];
          const stroke = portTypeList[source?.port];
          graphRef?.current.addEdge(
            Object.assign({}, _.omit(edge[1], 'connector'), {
              attrs: {
                line: Object.assign(
                  {},
                  attrs?.line,
                  { strokeWidth: 6, strokeDasharray: '' },
                  stroke ? { stroke } : {}
                ),
              },
            })
          );
        });
        graphRef?.current.zoomToFit({ absolute: true, maxScale: 1 });
        dispatch(setCanvasData({
          ...canvasData,
          zoom: graphRef?.current?.zoom(),
        }));
        setTimeout(() => {
          resolve(true);
        }, 3000);
      }, 500);
    });
  }, [graphRef.current, canvasData?.id]);
  const syncNodeStatus = useCallback(() => {
    (canvasData?.flowData?.nodes || [])?.forEach((item: any) => {
      const { config } = item;
      const { generalConfig, initParams } = config || {};
      let ifHasRequireNotWrite = false;
      const node = graphRef.current?.getCellById(item.id);
      try {
        Object.entries(initParams || {})?.forEach((item: any) => {
          if (item?.[1]?.require && (_.isUndefined(item[1]?.value) || _.isNull(item[1]?.value))) {
            ifHasRequireNotWrite = true;
            throw new Error();
          }
        })
      } catch (err) {

      }
      node.setData({
        ...node?.getData() || {},
        input_check: !!generalConfig?.input_check?.value,
        initParams_check: !ifHasRequireNotWrite,
        canvasStart,
      })
    })
  }, [canvasData?.flowData?.nodes, canvasStart]);
  useEffect(() => {
    if (!!graphRef.current) {
      if (!!canvasData?.id) {
        dispatch(setLoading(true));
        initGraph().then(() => {
          dispatch(setLoading(false));
          syncNodeStatus();
        });
      }
    }
  }, [graphRef.current, canvasData?.id]);
  // 节点添加
  const nodeAdd = useCallback((flow: any) => {
    const { node } = flow;
    const newNode = node?.store?.data?.config;
    if (!newNode || canvasData?.flowData?.nodes?.filter((i: any) => i?.id === newNode?.id)?.length > 0) return;
    const result = {
      ...canvasData || {},
      flowData: {
        ...canvasData?.flowData || {},
        nodes: (canvasData?.flowData?.nodes || [])?.concat(newNode)
      }
    };
    dispatch(setCanvasData(result));
  }, [canvasData]);
  // 节点点击
  const nodeClick = useCallback((flow: any,) => {
    const { e, view, node } = flow;
    const { config, customId } = node?.store?.data;

  }, []);
  // 节点双击
  const nodeDoubleClick = useCallback((flow: any) => {
    const { e, view, node } = flow;
    const { config, customId, id } = node?.store?.data;
    if (selectedNode === customId) return;
    reset(e);
    setTimeout(() => {
      // 组点击，可进行"解散组"操作
      if (node?.id?.indexOf('group_') > -1) {

      } else if (node?.store?.data?.customId?.indexOf('node_') > -1) {
        dispatch(setSelectedNode(`${customId}$%$${id}`));
      } else {

      }
    }, 200);
  }, []);
  // 节点右键
  const nodeRightClick = useCallback(() => {

  }, []);
  const edgeHighLightFun = useCallback((node: any, ifLight: boolean, graph: any) => {
    try {
      const inputs = graph?.getIncomingEdges(node);
      const outputs = graph?.getOutgoingEdges(node);
      const lineList = [].concat(inputs)?.concat(outputs)?.filter(Boolean);
      if (!!lineList?.length) {
        lineList.forEach((line: any) => {
          if (!!line) {
            if (ifLight) {
              if (!line.store.data.attrs.line.preStroke) {
                const preColor = '' + line.store.data.attrs.line.stroke;
                line.store.data.attrs.line.preStroke = preColor;
              }
              line.store.data.attrs.line.stroke = '#f00';
            } else if (!!line.store.data.attrs.line.preStroke) {
              line.store.data.attrs.line.stroke = line.store.data.attrs.line.preStroke;
            }
          }
        });
      };
    } catch (err) { }
  }, []);
  // 节点鼠标移入/删除
  const nodeMoveIn = useCallback((flow: any, graph: any) => {
    const { node } = flow;
    const nodeSize = node.getSize();
    edgeHighLightFun(node, true, graph);
    if (canvasStart) {
      return;
    }
    node.addTools({
      ...removeBtnOption,
      args: {
        ...removeBtnOption.args,
        offset: {
          y: 0,
          x: nodeSize.width,
        },
      },
    });
  }, []);
  // 节点鼠标移出/删除
  const nodeMoveOut = useCallback((flow: any, graph: any) => {
    const { node } = flow;
    edgeHighLightFun(node, false, graph);
    node.removeTools();
  }, []);
  // 边鼠标移入/删除
  const edgeMoveIn = (flow: any) => {
    const { edge } = flow;
    if (canvasStart) {
      return;
    }
    edge.addTools({
      ...removeBtnOption,
      args: {
        ...removeBtnOption.args,
        offset: {
          y: 0,
          x: 0,
        },
      },
    });
  };
  // 边鼠标移出/删除
  const edgeMoveOut = (flow: any) => {
    const { edge } = flow;
    edge.removeTools();
  };
  // 边右键点击
  const edgeRightClick = (edge: any) => {
    if (canvasStart) {
      return;
    }
    const { view = {} } = edge;
    const { sourceView, targetView } = view;
    Modal.destroyAll();
    confirm({
      title: `删除从 ${sourceView?.cell?.store?.data?.config?.alias} 到 ${targetView?.cell?.store?.data?.config?.alias} 的边？`,
      content: '删除后无法恢复',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { cell } = edge;
        cell.remove();
      },
    });
  };
  // 空白处单击
  const reset = useCallback((event: any) => {
    dispatch(setSelectedNode(''));
  }, []);

  return (
    <div className={`flex-box-column ${styles.canvasPage}`}>
      <div ref={dom} />
      <MiniMapPanel />
    </div>
  );
};

export default memo(CanvasFlow);