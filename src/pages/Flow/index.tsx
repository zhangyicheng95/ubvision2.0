import React, { Fragment, memo, useEffect, useLayoutEffect, useState } from 'react';
import { message, Splitter } from 'antd';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import HeaderToolbar from './components/HeaderToolbar';
import PluginPanel from './components/PluginPanel';
import ConfigPanel from './components/ConfigPanel';
import CanvasFlow from './components/CanvasFlow';
import FooterToolbar from './components/FooterToolbar';
import { useDispatch, useSelector } from 'react-redux';
import {
  IRootActions, setCanvasDataAction, setCanvasDataActionBaseAction, setCanvasDirPluginsAction, setCanvasPluginsAction,
  setCanvasStartAction, setGetCanvasPluginsAction, setLoadingAction
} from '@/redux/actions';
import { GetQueryObj, getuid, guid, intersectionABList } from '@/utils/utils';
import { getDirPluginListService, getPluginListService } from '@/services/flowPlugin';
import { getFlowStatusService, getParamsService, processTestService, unitTestService } from '@/services/flowEditor';

interface Props { }

const FlowPage: React.FC<Props> = (props: any) => {
  const { graphData, canvasData, canvasPlugins } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const id = params?.['id'];
  const number = [undefined, 'undefined'].includes(params?.['number']) ? 1 : params?.['number'];
  // 同步节点
  const [syncNode, setSyncNode] = useState<any>({
    type: '',
    data: {},
    cover: false
  });
  // 流程测试
  const [runningNode, setRunningNode] = useState<any>([]);

  // 获取侧边栏配置算子列表
  const getPlugin = () => {
    return new Promise((resolve: any, reject: any) => {
      // pluginApi.list().then((res: any) => {
      getPluginListService().then((res: any) => {
        if (!!res && res.code === 'SUCCESS') {
          dispatch(setCanvasPluginsAction(res.data || []));
          resolve(res.data || []);
        } else {
          message.error(res?.message || '接口异常');
        }
      });
    });
  };
  // 获取云端的内置插件列表
  const getBuildInPlugin = () => {
    getDirPluginListService().then((res: any) => {
      if (!!res && res.code === 'SUCCESS') {
        dispatch(setCanvasDirPluginsAction(res.data || []));
      } else {
        message.error(res?.message || '接口异常');
      }
    });
  };
  useLayoutEffect(() => {
    getPlugin();
    getBuildInPlugin();
    dispatch(setGetCanvasPluginsAction(getPlugin));
  }, []);
  useLayoutEffect(() => {
    if (id) {
      dispatch(setLoadingAction(true));
      // 拉取数据
      getParamsService(id).then((res) => {
        if (!!res && res.code === 'SUCCESS') {
          // 获取任务状态
          getFlowStatusService(id).then((resStatus: any) => {
            if (!!resStatus && resStatus.code === 'SUCCESS') {
              dispatch(setCanvasDataAction(res?.data || {}));
              dispatch(setCanvasDataActionBaseAction(res?.data || {}));
              dispatch(setCanvasStartAction(!!resStatus?.data && !!Object.keys?.(resStatus?.data)?.length));
            } else {
              dispatch(setCanvasStartAction(false));
              message.error(
                resStatus?.msg || resStatus?.message || '接口异常'
              );
            };
          });
        } else {
          message.error(res?.message || '接口异常');
          dispatch(setLoadingAction(false));
        }
      });
    }
  }, [id]);
  // 同步节点 属性/连接桩
  useEffect(() => {
    if (!_.isEmpty(syncNode.data)) {
      const node = graphData.getCellById(syncNode.data?.id);
      const leftNode: any = canvasPlugins?.filter((i: any) => i.name === syncNode.data?.name)?.[0];
      const centerNode: any = canvasData.flowData?.nodes?.filter((i: any) => i.id === syncNode.data.id)?.[0] || {};
      if (!!node && !!centerNode) {
        let realNode: any = {};
        if (syncNode.type === 'params') {
          // 同步属性
          realNode = {
            ...centerNode || {},
            config: {
              ...centerNode?.config || {},
              initParams: (Object.entries(leftNode?.config?.initParams) || [])
                ?.reduce((pre: any, cen: any) => {
                  return {
                    ...pre,
                    [cen[0]]: {
                      ...centerNode?.config?.initParams?.[cen[0]] || {},
                      ...cen[1],
                      ...syncNode.cover ? {} : {
                        value: centerNode?.config?.initParams?.[cen[0]]?.value
                      }
                    }
                  }
                }, {}),
              generalConfig: (Object.entries(centerNode?.config?.generalConfig) || [])?.reduce((pre: any, cen: any) => {
                return {
                  ...pre,
                  [cen[0]]: {
                    ...cen[1],
                    ...leftNode?.config?.generalConfig?.[cen[0]] || {},
                    ...syncNode.cover ? {} : {
                      value: cen[1]?.value
                    }
                  }
                }
              }, {}),
            }
          };
          // 同步节点状态
          node.updateData({
            input_check: !!realNode?.config?.generalConfig?.input_check?.value,
          });
        } else if (syncNode.type === 'port') {
          // 同步连接桩
          const inputs = node?.getPorts?.()?.filter((i: any) => i.direction === 'input');
          const outputs = node?.getPorts?.()?.filter((i: any) => i.direction === 'output');
          const centerPorts = inputs.concat(outputs);
          const leftPorts = Object.entries(leftNode.config?.input).map((res: any) => {
            const label = {
              name: res[0],
              group: 'top',
              direction: 'input',
              ...res[1]
            };
            return {
              id: getuid(),
              customId: `port_${guid()}`,
              ...centerPorts?.filter((i: any) => i.name === res[0])?.[0] || {},
              ...label,
              label,
            };
          }).concat(Object.entries(leftNode.config?.output).map((res: any) => {
            const label = {
              name: res[0],
              group: 'bottom',
              direction: 'output',
              ...res[1]
            };
            return {
              id: getuid(),
              customId: `port_${guid()}`,
              ...centerPorts?.filter((i: any) => i.name === res[0])?.[0] || {},
              ...label,
              label,
            };
          }));
          realNode = {
            ...centerNode || {},
            config: {
              ...centerNode?.config || {},
              input: syncNode.cover ? leftNode.config?.input : inputs.reduce((pre: any, cen: any) => {
                return {
                  ...pre,
                  [cen.name]: {
                    ...cen.label || {},
                    ...leftNode.config?.input?.[cen.name] || {},
                  }
                }
              }, {}),
              output: syncNode.cover ? leftNode.config?.output : outputs.reduce((pre: any, cen: any) => {
                return {
                  ...pre,
                  [cen.name]: {
                    ...cen.label || {},
                    ...leftNode.config?.output?.[cen.name] || {},
                  }
                }
              }, {}),
            },
            ports: {
              ...centerNode?.ports || {},
              items: syncNode.cover ? leftPorts : (centerPorts || [])?.map((item: any) => {
                const label = {
                  ...item?.label || {},
                  ...leftNode.config?.[item.direction]?.[item.name] || {},
                };
                return {
                  ...item,
                  ...label,
                  label,
                }
              })
            }
          };
          if (syncNode.cover) {
            // 覆盖更新
            // 先删除并保留所有的连线
            const edges = graphData?.getConnectedEdges(node);
            edges?.forEach((edge: any) => {
              graphData.removeEdge(edge);
            });
            // 删除所有的连接桩
            node.removePorts(centerPorts);
            // 重新添加新的所有的连接桩
            node.addPorts(leftPorts);
            // 重新添加原来的连线
            setTimeout(() => {
              (edges || []).forEach((edge: any) => {
                if (!edges) return null;
                const source = graphData.getCellById(edge.source.cell);
                const target = graphData.getCellById(edge.target.cell);
                if (!!source && !!target) {
                  graphData.addEdge(edge?.store?.data);
                };
              });
            }, 200);
          } else {
            // 保留用户配置，只添加差异的
            const sameList = intersectionABList(leftPorts, centerPorts, 'name');
            (leftPorts || []).forEach((port: any) => {
              if (!sameList.includes(port.name)) {
                node.addPort(port);
              }
            });
          };
        };
        // 节点内容保存到方案中
        dispatch(setCanvasDataAction({
          ...canvasData,
          flowData: {
            ...canvasData?.flowData || {},
            nodes: (canvasData.flowData.nodes || [])?.map((node: any) => {
              if (node.id === realNode.id) {
                return realNode;
              }
              return node;
            })
          }
        }));
        message.success('同步成功');
      }
    }
  }, [syncNode, graphData]);
  // 流程测试
  useEffect(() => {
    if (runningNode?.length > 0) {
      // 选择了节点测试
      if (runningNode?.length > 1) {
        // 一条支路的流程测试
        // 拿到这条支路上所有的连线
        let edgeList: any = [];
        (runningNode || []).forEach((i: string, index: number) => {
          const node = graphData.getCellById(i);
          const edges = graphData.getConnectedEdges(node)?.map((edge: any) => edge?.store?.data?.id);
          edgeList.push(edges);
        });
        let sameList: any = [];
        for (let i = 0; i < edgeList.length; i++) {
          for (let j = i + 1; j < edgeList.length; j++) {
            sameList = sameList.concat(_.intersection(edgeList[i], edgeList[j]));
          }
        };
        const lineList = (sameList || [])?.map((i: any) => graphData.getCellById(i));
        console.log(lineList);
        if (!!lineList?.length) {
          lineList.forEach((line: any) => {
            if (!!line) {
              // if (ifLight) {
              if (!line.store.data.attrs.line.preStroke) {
                const preColor = '' + line.store.data.attrs.line.stroke;
                line.store.data.attrs.line.preStroke = preColor;
              }
              line.store.data.attrs.line.stroke = '#f00';
              // } else if (!!line.store.data.attrs.line.preStroke) {
              //   line.store.data.attrs.line.stroke = line.store.data.attrs.line.preStroke;
              // }
            }
          });
        };
        // 拿到这条支路上所有的节点
        const nodes = canvasData.flowData?.nodes?.filter((i: any) => runningNode.includes(i.id));
        processTestService({ data: nodes }).then((res) => {
          if (!!res && res.code === 'SUCCESS') {

          } else {
            message.error(res?.message || '接口异常');
          }
        });
      } else if (runningNode?.length === 1) {
        // 一个节点单元测试
        const node = canvasData.flowData?.nodes?.filter((i: any) => runningNode.includes(i.id))?.[0];
        if (!!node) {
          unitTestService({ data: node }).then((res) => {
            if (!!res && res.code === 'SUCCESS') {

            } else {
              message.error(res?.message || '接口异常');
            }
          });
        }
      };
    };
  }, [runningNode]);

  return (
    <div className={`flex-box-column ${styles.flowPage}`}>
      <Fragment>
        <HeaderToolbar />
        <div className="flex-box flow-page-body">
          <Splitter>
            <Splitter.Panel defaultSize="15%" min="5%" max="30%">
              <PluginPanel setSyncNode={setSyncNode} setRunningNode={setRunningNode} />
            </Splitter.Panel>
            <Splitter.Panel>
              <CanvasFlow setSyncNode={setSyncNode} setRunningNode={setRunningNode} />
            </Splitter.Panel>
            <Splitter.Panel defaultSize="45%" min="10%" max="80%">
              <ConfigPanel />
            </Splitter.Panel>
          </Splitter>
        </div>
        <FooterToolbar />
      </Fragment>
    </div>
  );
};

export default memo(FlowPage);
