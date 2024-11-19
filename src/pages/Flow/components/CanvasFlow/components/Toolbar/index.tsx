import React, { memo, useCallback, useState } from 'react';
import { Button, message, Modal, Dropdown, Upload, Radio, Input } from 'antd';
import {
  ScissorOutlined, GatewayOutlined, GroupOutlined, UngroupOutlined, ClearOutlined,
  UnlockOutlined, LockOutlined, CloudSyncOutlined
} from '@ant-design/icons';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasData, setCanvasStart, setLoading } from '@/redux/actions';
import { addParams, startFlowService, stopFlowService, updateParams } from '@/services/flowEditor';
import { defaultConfig } from 'antd/es/theme/context';
import { useNavigate } from 'react-router';
import { GetQueryObj, guid } from '@/utils/utils';
import { createGroup } from '@/pages/Flow/utils';
import { DagreLayout } from '@antv/layout'
import { archSize } from '@/pages/Flow/common/constants';
import BasicTable from '@/components/BasicTable';

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
  const [cloudNodeList, setCloudNodeList] = useState<any>([]);
  const [nodeVisible, setNodeVisible] = useState(false);
  const [cloudNodeType, setCloudNodeType] = useState('id');
  const [cloudNodeSearch, setCloudNodeSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
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
      };
      graphData.cleanSelection?.();
    } catch (err) { }
  };
  // 解散群组
  const unBuildGroup = () => {
    const selectedCells = graphData.getSelectedCells();
    const seletedGroups = selectedCells.filter((i: any) => i.id.indexOf('group_') > -1);
    try {
      if (seletedGroups?.length > 0) {
        let edges: any = [];
        let nodes: any = [];
        // 解散原有的所有分组
        (seletedGroups || [])?.forEach((group: any) => {
          const { id, store, _children } = group;
          nodes = _children?.filter((i: any) => i.store?.data?.customId?.indexOf('node_') > -1);
          (_children || [])?.forEach((node: any) => {
            edges = edges.concat(graphData.removeConnectedEdges(node));
          });
          graphData.removeCells(_children.concat(group));
        });
        nodes = _.uniqBy(nodes, 'id');
        edges = _.uniqBy(edges, 'id');
        graphData.addNodes(nodes);
        graphData.addEdges(edges);
        selectionNode();
        graphData.cleanSelection?.();
      } else {
        message.destroy();
        message.warning('请按下ctrl键并选择一个分组');
      }
    } catch (err) { }
  };
  // 清空画布
  const clearGraph = () => {
    confirm({
      title: `确认清空画布吗?`,
      content: '',
      onOk() {
        graphData.clearCells();
      },
      onCancel() { },
    });
  };
  // 导入插件配置
  const uploadProps = {
    accept: '.json',
    showUploadList: false,
    multiple: false,
    beforeUpload(file: any) {
      const reader = new FileReader(); // 创建文件对象
      reader.readAsText(file); // 读取文件的内容/URL
      reader.onload = (res: any) => {
        const {
          target: { result },
        } = res;
        try {
          const data = JSON.parse(result);
          if (_.isArray(data)) {
            setCloudNodeList(data);
            setNodeVisible(true);
          } else {
            message.error('导入的json有误，请检查');
          }
        } catch (err) {
          message.error('json文件格式错误，请修改后上传。');
          console.error(err);
        }
      };
      return false;
    },
  };
  const columns = [
    {
      title: '节点名称',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: '节点别名',
      dataIndex: 'alias',
      key: 'alias',
      width: '30%',
    },
    {
      title: '节点ID',
      dataIndex: 'customId',
      key: 'customId',
      width: '30%',
    },
  ];
  // 列表多选
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: []) => {
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record: any) => {
      const { nodes } = canvasData.flowData;
      const nodeList = (graphData.getNodes() || [])
        ?.map?.((node: any) => {
          if (node?.store?.data?.config?.customId) {
            const realNodeConfig: object = nodes?.filter((i: any) => i.customId === node?.store?.data?.config?.customId)?.[0];
            console.log(realNodeConfig);

            return {
              ...node?.store?.data?.config,
              ...realNodeConfig || {},
            };
          }
          return null;
        })
        .filter(Boolean);
      let result = false;
      if (cloudNodeType === 'id') {
        result = !nodeList.filter((i: any) => (i?.customId === record?.customId) || (i?.id === record?.id))?.length;
      } else {
        result = !nodeList.filter((i: any) => i?.alias === record?.alias)?.length;
      }
      return {
        disabled: result, // Column configuration not to be checked
        name: record.id,
      };
    },
  };

  return (
    <div className={`flex-box ${styles.toolbar} boxShadow`}>
      <Button
        size='small'
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
        icon={<GroupOutlined />}
        name="结组"
        disabled={!!canvasStart || !canvasBarOption.selection}
        onClick={() => {
          buildGroup();
        }}
      />
      <Button
        size='small'
        icon={<UngroupOutlined />}
        name="解组"
        disabled={!!canvasStart}
        onClick={() => {
          unBuildGroup();
        }}
      />
      <Button
        size='small'
        icon={<ClearOutlined />}
        name="清空画布"
        disabled={!!canvasStart}
        onClick={() => {
          clearGraph();
        }}
      />
      <Button
        size='small'
        icon={!!canvasData.graphLock ? <LockOutlined /> : <UnlockOutlined />}
        name="锁定画布"
        disabled={!!canvasStart}
        onClick={() => {
          const nodes = graphData.getNodes();
          nodes.forEach((node: any) => {
            node.updateData({ graphLock: !canvasData.graphLock });
          });
          dispatch(setCanvasData({
            ...canvasData,
            graphLock: !canvasData.graphLock
          }));
        }}
      />
      <Upload {...uploadProps}>
        <Button
          size='small'
          icon={<CloudSyncOutlined />}
          name="上传插件配置"
          disabled={!!canvasStart}
          onClick={() => {

          }}
        />
      </Upload>

      {
        // 导入节点列表
        nodeVisible ? (
          <Modal
            title={
              <div className="flex-box" style={{ gap: 24 }}>
                导入插件配置
                <Radio.Group
                  onChange={(e: any) => setCloudNodeType(e.target.value)}
                  value={cloudNodeType}
                >
                  <Radio.Button value="id">按节点ID上传</Radio.Button>
                  <Radio.Button value="alias">按节点别名上传</Radio.Button>
                </Radio.Group>
                <div style={{ width: 250 }}>
                  <Input.Search
                    placeholder="搜索组件"
                    onSearch={(val: any) => {
                      setCloudNodeSearch(val);
                    }}
                  />
                </div>
              </div>
            }
            width="calc(100vw - 48px)"
            wrapClassName={'modal-table-btn'}
            centered
            open={nodeVisible}
            maskClosable={false}
            getContainer={false}
            onCancel={() => {
              setNodeVisible(false);
              setCloudNodeList([]);
              setCloudNodeType('id');
            }}
            onOk={() => {
              const selectList = (selectedRows || [])?.reduce(
                (pre: any, cen: any) => {
                  return {
                    ...pre,
                    [cen.customId]: cen?.config?.initParams,
                    [cen.alias]: cen?.config?.initParams,
                  };
                },
                {}
              );
              message.success('参数属性导入成功');
              setNodeVisible(false);
              setCloudNodeList([]);
              setCloudNodeType('id');
            }}
          >
            <BasicTable
              className="plugin-list-table"
              columns={columns}
              rowSelection={{
                ...rowSelection,
              }}
              pagination={null}
              dataSource={cloudNodeList?.filter(
                (plu: any) => {
                  return (
                    _.toUpper(plu?.name).indexOf(_.toUpper(cloudNodeSearch)) > -1 ||
                    _.toUpper(plu?.alias).indexOf(_.toUpper(cloudNodeSearch)) > -1
                  );
                }
              )}
              rowKey={(record: any) => {
                return record?.id;
              }}
            />
          </Modal>
        ) : null
      }
    </div>
  );
};

export default memo(Toolbar);
