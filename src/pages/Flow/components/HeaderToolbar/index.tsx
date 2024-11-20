import React, { memo, useCallback, useEffect } from 'react';
import { Button, message, Modal, Dropdown } from 'antd';
import { BugFilled, CaretRightOutlined, DatabaseOutlined, PauseOutlined, SaveOutlined } from '@ant-design/icons';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasStart, setLoading, setSaveGraph } from '@/redux/actions';
import { addParams, startFlowService, stopFlowService, updateParams } from '@/services/flowEditor';
import { defaultConfig } from 'antd/es/theme/context';
import { useNavigate } from 'react-router';
import { GetQueryObj } from '@/utils/utils';

const { confirm } = Modal;
interface Props {
}

const HeaderToolbar: React.FC<Props> = (props) => {
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

  // 格式化方案数据
  const formatGraphData = useCallback((param: any) => {
    const { cells } = graphData.toJSON({ deep: true });
    const { groups, nodes } = param?.flowData;
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
            };
          } else if (shape?.indexOf("dag-node") > -1) {
            const { config, position, size } = cent;
            const nodeConfig: object = nodes?.filter((i: any) => i.id === config.id)?.[0] || {};
            return {
              ...prev,
              nodeList: nodeList?.concat({
                ...config,
                ...nodeConfig,
                position,
                size
              }),
            };
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
          return prev;
        }, {
        groupList: [],
        nodeList: [],
        edgeList: [],
      });
    return { groupList, nodeList, edgeList };
  }, [graphData, canvasData]);
  // 保存业务
  const saveGraph = useCallback((param?: any) => {
    dispatch(setLoading(true));
    return new Promise((resolve, reject) => {
      const { groupList, nodeList, edgeList } = formatGraphData(param || canvasData);
      const params = {
        ...param || canvasData,
        flowData: { groups: groupList, nodes: nodeList, edges: edgeList }
      };
      console.log(params);

      if (canvasData?.id) {
        // 有id，代表修改
        updateParams(canvasData?.id, params).then((res) => {
          if (!!res && res.code === 'SUCCESS') {
            message.success('保存成功');
            resolve(true);
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
    });
  }, [graphData, canvasData]);
  useEffect(() => {
    dispatch(setSaveGraph(saveGraph));
  }, [graphData, canvasData]);
  // 启动业务
  const startFlow = useCallback((type?: string) => {
    if (canvasData?.id) {
      saveGraph().then((res) => {
        dispatch(setLoading(true));
        startFlowService({
          ...canvasData,
          id: canvasData?.id,
          debug: type === 'debugger'
        }).then((res) => {
          if (['success', 'SUCCESS'].includes(res?.code)) {
            dispatch(setCanvasStart(true));
            (graphData?.getNodes?.() || [])?.forEach((node: any) => {
              node.setData?.({
                ...node?.getData?.() || {},
                canvasStart: true
              });
            });
          } else {
            message.error(
              res?.message || res?.msg || '服务启动失败，请检查网络设置'
            );
          };
          dispatch(setLoading(false));
        });
      });
    } else {
      confirm({
        title: '请先保存',
        content: '保存流程后，才能启动',
        okText: '确认保存',
        cancelText: '取消',
        onOk() {
          saveGraph();
        },
        onCancel() {

        },
      });
    }
    return false;
  }, [graphData, canvasData]);
  // 停止业务
  const stopFlow = useCallback((ifGoBack?: Boolean, ifRestart?: Boolean) => {
    dispatch(setLoading(true));
    // socketDataRef.current && socketDataRef.current?.close();
    // socketStateRef.current && socketStateRef.current?.close();
    // socketErrorRef.current && socketErrorRef.current?.close();
    // socketDetailRef.current && socketDetailRef.current?.close();
    setTimeout(() => {
      stopFlowService(canvasData?.id).then((res) => {
        if (['success', 'SUCCESS'].includes(res?.code)) {
          dispatch(setCanvasStart(false));
          (graphData?.getNodes?.() || [])?.forEach((node: any) => {
            node.setData?.({
              ...node?.getData?.() || {},
              canvasStart: false
            });
          });
        } else {
          message.error(res?.message || '停止服务失败，请检查网络设置');
        };
        dispatch(setLoading(false));
      });
    }, 1000);
  }, [graphData, canvasData]);
  const startList: any = [
    {
      key: `start-normal`,
      label: <Button
        size='small'
        icon={<CaretRightOutlined />}
        color="primary"
        variant="outlined"
        style={{ width: '100%' }}
        onClick={() => {
          startFlow('normal');
        }}
      >
        普通启动
      </Button>
    },
    {
      type: 'divider',
    },
    {
      key: `start-debugger`,
      label: <Button
        size='small'
        icon={<BugFilled />}
        danger
        style={{ width: '100%' }}
        onClick={() => {
          startFlow('debugger');
        }}
      >
        断点启动
      </Button>
    }
  ];

  return (
    <div className={`flex-box-justify-between ${styles.headerToolbar} boxShadow`}>
      <div className="flex-box header-toolbar-title-box">
        <DatabaseOutlined style={{ fontSize: 22 }} />{canvasData?.name || '默认方案'}
      </div>
      <div className="flex-box">

      </div>
      <div className="flex-box header-toolbar-operation-box">
        <Button
          size='small'
          icon={<SaveOutlined />}
          className={!!canvasStart ? '' : 'info-font'}
          disabled={!!canvasStart}
          onClick={() => {
            saveGraph();
          }}
        >保存</Button>
        <Dropdown
          getPopupContainer={(triggerNode: any) => {
            return triggerNode.parentNode || document.body;
          }}
          menu={{ items: startList }}
        >
          <Button
            size='small'
            icon={<CaretRightOutlined />}
            className={!!canvasStart ? '' : 'success-font'}
            disabled={!!canvasStart}
          >启动</Button>
        </Dropdown>
        <Button
          size='small'
          icon={<PauseOutlined />}
          className={!canvasStart ? '' : 'error-font'}
          disabled={!canvasStart}
          onClick={() => { stopFlow() }}
        >停止</Button>
      </div>
    </div>
  );
};

export default memo(HeaderToolbar);
