import React, { memo, useCallback, useState } from 'react';
import { Button, message, Modal, Dropdown } from 'antd';
import {
  ScissorOutlined, GatewayOutlined, GroupOutlined, PauseOutlined, SaveOutlined,
} from '@ant-design/icons';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasStart, setLoading } from '@/redux/actions';
import { addParams, startFlowService, stopFlowService, updateParams } from '@/services/flowEditor';
import { defaultConfig } from 'antd/es/theme/context';
import { useNavigate } from 'react-router';
import { GetQueryObj, guid } from '@/utils/utils';
import { createGroup } from '@/pages/Flow/utils';

const { confirm } = Modal;
interface Props {
}

const Toolbar: React.FC<Props> = (props) => {
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const id = params?.['id'];
  const number = params?.['number'];
  const { graphData, canvasData, canvasStart } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [canvasBarOption, setCanvasBarOption] = useState({
    selection: false, // 框选
  });

  // 格式化方案数据
  const formatGraphData = useCallback(() => {
    const { cells } = graphData.toJSON({ deep: true });
    const { groups, nodes } = canvasData?.flowData;
    console.log(cells);

    const { groupList, nodeList, edgeList } = (cells || [])
      ?.reduce(
        (prev: any, cent: any) => {
          const { groupList, nodeList, edgeList } = prev;
          const { shape, } = cent;
          if (shape === "dag-group") {
            const groupConfig: object = groups?.filter((i: any) => i.id === cent.id)?.[0] || {};
            return {
              ...prev,
              groupList: groupList?.concat({
                ...cent,
                ..._.omit(groupConfig, 'childrenList'),
              }),
            }
          } else if (shape === "dag-node") {
            const { config, position } = cent;
            const nodeConfig: object = nodes?.filter((i: any) => i.id === config.id)?.[0] || {};
            return {
              ...prev,
              nodeList: nodeList?.concat({
                ...config,
                ...nodeConfig,
                position
              }),
            }
          } else if (shape === "dag-edge") {
            const source = graphData.getCellById(cent.source.cell);
            const target = graphData.getCellById(cent.target.cell);
            if (!!source && !!target) {
              return {
                ...prev,
                edgeList: edgeList?.concat(cent),
              }
            } else {
              return prev;
            };
          }
        }, {
        groupList: [],
        nodeList: [],
        edgeList: [],
      });
    return { groupList, nodeList, edgeList };
  }, [graphData, canvasData]);
  // 保存业务
  const saveGraph = useCallback(() => {
    dispatch(setLoading(true));
    return new Promise((resolve, reject) => {
      const { groupList, nodeList, edgeList } = formatGraphData();
      const params = {
        ...canvasData,
        flowData: { groups: groupList, nodes: nodeList, edges: edgeList }
      };
      if (canvasData?.id) {
        // 有id，代表修改
        updateParams(canvasData?.id, params).then((res) => {
          if (!!res && res.code === 'SUCCESS') {
            message.success('保存成功');
          } else {
            message.error(res?.message || '接口异常');

          }
          dispatch(setLoading(false));
        });
      } else {
        // 没id，代表添加
        addParams(_.omit(params, 'id')).then((res) => {
          if (!!res && res.code === 'SUCCESS' && !!res?.data?.id) {
            message.success('保存成功');
            dispatch(setLoading(false));
            navigate(`/flow?id=${res.data?.id}&number=${number}`, {
              state: res.data,
            });
          } else {
            message.error(res?.message || '接口异常');
          }
          dispatch(setLoading(false));
        });
      }
      resolve(true);
    });
  }, [graphData, canvasData]);
  // 开启框选
  const selectionNode = () => {
    if (graphData.isSelectionEnabled()) {
      graphData.disableSelection();
      graphData.enablePanning();
      setCanvasBarOption((prev: any) => {
        return { ...prev, selection: false };
      });
    } else {
      graphData.enableSelection();
      graphData.disablePanning();
      setCanvasBarOption((prev: any) => {
        return { ...prev, selection: true };
      });
    }
  };
  // 新建群组
  const buildGroup = () => {
    try {
      const selectedCells = graphData.getSelectedCells();
      const seletedGroups = selectedCells.filter((i: any) => i.id.indexOf('group_') > -1);
      const seletedNodes = selectedCells.filter((i: any) => i?.store?.data?.customId.indexOf('node_') > -1);
      if (selectedCells.length === 0) {
        // 取消框选
        message.warning('请先选择需要建组节点');
        return;
      };
      const groupSize = 80;
      const getSize = (list: any) => {
        return (list || []).reduce(
          (prev: any, cent: any) => {
            const { xmin, xmax, ymin, ymax, ids } = prev;
            const {
              store: {
                data: { position, size },
              },
              id,
            } = cent;
            let result = prev;
            if (_.isNull(xmin) || position.x < xmin) {
              result = { ...result, xmin: position.x };
            }
            if (_.isNull(xmax) || position.x + size.width > xmax) {
              result = { ...result, xmax: position.x + size.width };
            }
            if (_.isNull(ymin) || position.y < ymin) {
              result = { ...result, ymin: position.y };
            }
            if (_.isNull(ymax) || position.y + size.height > ymax) {
              result = { ...result, ymax: position.y + size.height };
            }
            return { ...result, ids: ids.concat(id) };
          },
          {
            xmin: null,
            xmax: null,
            ymin: null,
            ymax: null,
            ids: [],
          }
        );
      }
      if (seletedGroups.length === 0) {
        // 选中的只有节点，没有分组
        let edges: any[] = [];
        const { xmin, xmax, ymin, ymax } = getSize(seletedNodes);
        const newGroupId = `group_${guid()}`;
        const group = createGroup(
          newGroupId,
          xmin - groupSize / 2,
          ymin - groupSize / 2,
          xmax - xmin + groupSize,
          ymax - ymin + groupSize,
          { label: { text: newGroupId } }
        );
        graphData.addNode(group);
        (seletedNodes || []).forEach((node: any) => {
          edges = edges.concat(graphData.removeConnectedEdges(node));
          group.addChild(node);
        });
        (edges || [])?.forEach((edge: any) => {
          graphData.addEdge(edge);
        });
        graphData.cleanSelection?.();
      } else {
        // 选中的包含分组
        let groupNodes: any = seletedNodes;
        let edges: any = seletedNodes?.reduce((pre: any, node: any) => {
          return pre.concat(graphData.removeConnectedEdges(node));
        }, []);
        // 解散原有的所有分组
        (seletedGroups || [])?.forEach((group: any) => {
          const { id, store, _children } = group;
          groupNodes = groupNodes.concat(_children?.filter((i: any) => i.store?.data?.customId?.indexOf('node_') > -1));
          (_children || [])?.forEach((node: any) => {
            edges = edges.concat(graphData.removeConnectedEdges(node));
          });
          graphData.removeCell(group);
        });
        groupNodes = _.uniqBy(groupNodes, 'id');
        edges = _.uniqBy(edges, 'id');
        const { xmin, xmax, ymin, ymax } = getSize(groupNodes);
        const newGroupId = `group_${guid()}`;
        const group = createGroup(
          newGroupId,
          xmin - groupSize / 2,
          ymin - groupSize / 2,
          xmax - xmin + groupSize,
          ymax - ymin + groupSize,
          { label: { text: newGroupId } }
        );
        graphData.addNode(group);
        (groupNodes || []).forEach((node: any) => {
          group.addChild(node);
        });
        (edges || [])?.forEach((edge: any) => {
          graphData.addEdge(edge);
        });
        graphData.cleanSelection?.();
      };
    } catch (err) { }
  };
  // 解散群组
  const unBuildGroup = () => {
    try {
      const selectedGroup = graphData.getCellById(
        canvasBarOption.selectedGroup
      );
      if (selectedGroup) {
        const { id, store } = selectedGroup;
        const { data } = store;
        const { children } = data;
        let edges: any[] = [];
        const childList = (children || [])
          ?.map?.((node: any) => {
            edges = edges.concat(graphData.removeConnectedEdges(node));
            return graphData.getCellById(node);
          })
          .filter(Boolean);
        graphData.removeCell(selectedGroup);
        setTimeout(() => {
          (childList.concat(edges) || []).forEach((cell: any) => {
            const { store = {} } = cell;
            const { data = {} } = store;
            cell.store.data.config = flowLocalData.nodes[data.customId];
            graphData.addCell(cell);
          });
        }, 50);
        dispatch({
          type: StoreEnum.flowLocalData,
          value: {
            groups: _.omit(flowLocalData.groups, id),
          },
        });
        setCanvasBarOption({
          selection: false,
          selectedGroup: '',
          selectedNode: '',
          sideBarType: '',
        });
      }
    } catch (err) { }
  };

  return (
    <div className={`flex-box ${styles.toolbar} boxShadow`}>
      <Button
        size='small'
        // type="text"
        icon={<ScissorOutlined />}
        name="截图"
        disabled={!!canvasStart}
        onClick={() => {
          graphData.exportJPEG(canvasData?.name, { padding: 8, quality: 1, width: 1920 * 4, height: 1080 * 4 });
        }}
      />
      <Button
        size='small'
        type={canvasBarOption.selection ? 'primary' : 'default'}
        icon={<GatewayOutlined />}
        name="框选"
        disabled={!!canvasStart}
        onClick={() => {
          selectionNode();
        }}
      />
      <Button
        size='small'
        // type="text"
        icon={<GroupOutlined />}
        name="截图"
        disabled={!!canvasStart || !canvasBarOption.selection}
        onClick={() => {
          buildGroup();
        }}
      />
    </div>
  );
};

export default memo(Toolbar);
