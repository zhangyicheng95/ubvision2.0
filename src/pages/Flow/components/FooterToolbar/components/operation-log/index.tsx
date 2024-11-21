import React, { useContext, useEffect, useState } from 'react';

import { StoreEnum } from '@renderer/pages/FlowEditor/store/typing';
import BasicScrollBar from '@renderer/components/BasicScrollBar';
import AlgoNode from '@renderer/components/AlgoNode';
import { Group } from '@renderer/pages/FlowEditor/components/canvas-panel/config/shape';

import styles from './index.module.less';
import moment from 'moment';
import { message, Modal } from 'antd';
import _ from 'lodash';
import {
  archSize,
  nodeStatusColor,
  portTypeObj,
} from '@renderer/common/constants/globalConstants';
import flowContext from '@renderer/pages/FlowEditor/context';
import { register } from '@antv/x6-react-shape';

const { confirm } = Modal;
interface Props {
  graphData: any;
}

const operationTypeList = (type: string) => {
  switch (type) {
    case 'add':
      return '添加了';
    case 'delete':
      return '删除了';
    case 'modify':
      return '修改了';
    default:
      return '';
  }
};
const OperationLog: React.FC<Props> = (props) => {
  const { graphData, ...rest } = props;
  const { stateData, dispatch, } = useContext<any>(flowContext);
  const { operationLog } = stateData;
  const [mirrorImg, setMirrorImg] = useState([]);
  const initData = (flowData: any) => {
    const { groups, nodes, edges } = flowData;
    let portTypeList: any = {};
    const createGroup = (
      id: string,
      x: number,
      y: number,
      width: number,
      height: number,
      attrs: {},
      childrenList: []
    ) => {
      const group: any = new Group({
        id,
        x,
        y,
        width,
        height,
        shape: 'dag-group',
        customId: id,
        attrs,
        childrenList,
        zIndex: 0,
      });
      graphData.addNode(group);
      return group;
    };
    nodes.forEach((node: any) => {
      register({
        shape: `dag-node-${node.id}`,
        // @ts-ignore
        component: (
          <AlgoNode
            data={node}
          />
        ),
      });
      graphData.addNode({
        shape: `dag-node-${node.id}`,
        id: node.id,
        ports: Object.assign({}, node?.ports, {
          items: node?.ports?.items?.map?.((item: any) => {
            const color = portTypeObj[item?.label?.type]?.color || portTypeObj.default;
            portTypeList = Object.assign({}, portTypeList, {
              [item.id]: color
            });
            return Object.assign({}, item, { color });
          })
        }),
        data: graphData.getCellById(node.id)?.getData() || { status: 'STOPPED', graphLock: false },
        position: node.position,
        size: node.size,
        config: node,
        customId: node.customId,
      });
    });
    groups.forEach((group: any) => {
      const {
        id,
        position: { x, y },
        size: { width, height },
        attrs,
        children = [],
        childrenList = [],
      } = group;
      const child = children.length ? children : childrenList;
      const parent = createGroup(id, x, y, width, height, attrs, child);
      child.forEach((child: any) => parent.addChild(graphData.getCellById(child)))
    });
    edges.forEach((edge: any) => {
      const { attrs, source } = edge;
      const stroke = portTypeList[source?.port];
      graphData.addEdge(Object.assign({}, edge, {
        attrs: {
          line: Object.assign({}, attrs?.line, { strokeWidth: 6, strokeDasharray: '' }, stroke ? { stroke } : {})
        }
      }));
    });
    dispatch({
      type: StoreEnum.flowStarted,
      value: {
        loading: false,
      },
    });
  };
  // 点击某个操作日志，回跳到当时节点
  const itemClicked = (data: any, index: number) => {
    try {
      confirm({
        title: '确认恢复到当前状态？',
        // content: <span style={{ color: 'red' }}>恢复后无法复原</span>,
        okText: '是',
        cancelText: '否',
        onOk() {
          const { mirrorImg } = data;
          dispatch({
            type: StoreEnum.flowStarted,
            value: {
              loading: true,
            },
          });
          graphData && graphData.clearCells();
          dispatch({
            type: StoreEnum.clearOperationLog,
          });
          setMirrorImg(mirrorImg);
          const firstList = operationLog.slice(0, index + 1)?.map?.((item: any) => _.omit(item, 'deleted'));
          const lastList = operationLog.slice(index + 1)?.map?.((item: any) => Object.assign({}, item, { deleted: true }));
          setTimeout(() => {
            dispatch({
              type: StoreEnum.setOperationLog,
              value: firstList.concat(lastList),
            });
          }, 1000)
        },
        onCancel() { },
      });
    } catch (err) {

    }
  };
  // 渲染当时画布节点
  useEffect(() => {
    if (!operationLog.length && mirrorImg.length) {
      setTimeout(() => {
        const flowData = mirrorImg.reduce(
          (pre: any, cen: any) => {
            const { groups, nodes, edges } = pre;
            return {
              ...pre,
              ...(cen?.shape === 'dag-group'
                ? {
                  groups: groups.concat(cen),
                }
                : cen?.shape.includes('dag-node')
                  ? {
                    nodes: nodes.concat(cen?.config),
                  }
                  : cen?.shape === 'dag-edge'
                    ? {
                      edges: edges.concat(cen),
                    }
                    : {}),
            };
          },
          {
            groups: [],
            nodes: [],
            edges: [],
          }
        );
        initData(flowData);
      }, 500);
    }
  }, [operationLog, mirrorImg]);

  return (
    <div className={styles.operationLog}>
      <BasicScrollBar data={operationLog}>
        {(operationLog || [])?.map?.((log: any, index: number) => {
          const { shape, config = {}, operationType, customId, id, time, deleted } = log;
          return (
            <div
              className="operation-log-item"
              style={deleted ? { color: 'gray' } : {}}
              key={`opreation_${index}`}
              onClick={() => {
                if (stateData.flowStarted?.normal || stateData.flowStarted?.debugger) {
                  message.warning('方案运行中，不允许编辑');
                  return;
                }
                if (index + 1 !== operationLog.length || deleted) {
                  itemClicked(log, index);
                }
              }}
            >
              <span>{moment(time).format('YYYY-MM-DD HH:mm:ss')}&nbsp;</span>
              &nbsp;{operationTypeList(operationType)}
              {shape === 'dag-edge' ? (
                '边'
              ) : shape.includes('dag-node') ? (
                <span>
                  节点 <span style={{ fontWeight: 'bold' }}>{config.name}</span>
                </span>
              ) : shape === 'dag-group' ? (
                <span>
                  组 <span style={{ fontWeight: 'bold' }}>{id}</span>
                </span>
              ) : (
                ''
              )}
            </div>
          );
        })}
      </BasicScrollBar>
    </div>
  );
};

export default OperationLog;
