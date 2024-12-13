import React, { memo, useCallback, useEffect } from 'react';
import { Button, message, Modal, Dropdown, notification } from 'antd';
import { BugFilled, CaretRightOutlined, DatabaseOutlined, PauseOutlined, SaveOutlined } from '@ant-design/icons';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasStartAction, setErrorListAction, setFlowRunningDataAction, setFlowRunningDataHistoryAction, setLoadingAction, setLogListAction, setSaveGraphAction } from '@/redux/actions';
import { addParamsService, startFlowService, stopFlowService, updateParamsService } from '@/services/flowEditor';
import { defaultConfig } from 'antd/es/theme/context';
import { useNavigate } from 'react-router';
import { GetQueryObj } from '@/utils/utils';
import socketData from '@/socket/socketData';
import socketLog from '@/socket/socketLog';
import socketError from '@/socket/socketError';
import { notificationSetting } from '@/common/globalConstants';

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
  const number = [undefined, 'undefined'].includes(params?.['number']) ? 1 : params?.['number'];
  const { graphData, canvasData, canvasStart, selectedNode } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification(notificationSetting);

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
            const groupConfig: any = groups?.filter((i: any) => i.id === cent.id)?.[0] || {};
            return {
              ...prev,
              groupList: groupList?.concat({
                ...cent,
                config: groupConfig?.config || {},
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
          } else if (shape?.indexOf("edge") > -1) {
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
    dispatch(setLoadingAction(true));
    return new Promise((resolve, reject) => {
      const { groupList, nodeList, edgeList } = formatGraphData(param || canvasData);
      const params = {
        ...param || canvasData,
        flowData: { groups: groupList, nodes: nodeList, edges: edgeList }
      };
      if (canvasData?.id) {
        // 有id，代表修改
        updateParamsService(canvasData?.id, params).then((res) => {
          if (!!res && res.code === 'SUCCESS') {
            message.success('保存成功');
            resolve(true);
          } else {
            message.error(res?.message || '接口异常');
          }
          dispatch(setLoadingAction(false));
        });
      } else {
        // 没id，代表添加
        addParamsService(_.omit(params, 'id')).then((res) => {
          if (!!res && res.code === 'SUCCESS' && !!res?.data?.id) {
            message.success('保存成功');
            dispatch(setLoadingAction(false));
            navigate(`/flow?id=${res.data?.id}&number=${number}`, {
              state: res.data,
            });
          } else {
            message.error(res?.message || '接口异常');
          }
          dispatch(setLoadingAction(false));
        });
      };
    });
  }, [graphData, canvasData]);
  useEffect(() => {
    dispatch(setSaveGraphAction(saveGraph));
  }, [graphData, canvasData]);
  // 启动业务
  const startFlow = useCallback((type?: string) => {
    if (canvasData?.id) {
      // 启动之前，清理上一次的日志记录
      dispatch(setLogListAction([]));
      dispatch(setErrorListAction([]));
      // 方案启动函数
      saveGraph().then((res) => {
        dispatch(setLoadingAction(true));
        startFlowService({
          ...canvasData,
          id: canvasData?.id,
          debug: type === 'debugger'
        }).then((res) => {
          if (['success', 'SUCCESS'].includes(res?.code)) {
            dispatch(setCanvasStartAction(true));
            (graphData?.getNodes?.() || [])?.forEach((node: any) => {
              node.updateData?.({ canvasStart: true });
            });
          } else {
            message.error(
              res?.message || res?.msg || '服务启动失败，请检查网络设置'
            );
          };
          dispatch(setLoadingAction(false));
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
    dispatch(setLoadingAction(true));
    // socketDataRef.current && socketDataRef.current?.close();
    // socketStateRef.current && socketStateRef.current?.close();
    // socketErrorRef.current && socketErrorRef.current?.close();
    // socketDetailRef.current && socketDetailRef.current?.close();
    setTimeout(() => {
      stopFlowService(canvasData?.id).then((res) => {
        if (['success', 'SUCCESS'].includes(res?.code)) {
          dispatch(setCanvasStartAction(false));
          (graphData?.getNodes?.() || [])?.forEach((node: any) => {
            node.updateData?.({ canvasStart: false });
          });
        } else {
          message.error(res?.message || '停止服务失败，请检查网络设置');
        };
        dispatch(setLoadingAction(false));
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
  // 任务启动后，建立socket链接
  useEffect(() => {
    if (canvasStart) {
      socketError.listen((error: string) => dispatch(setErrorListAction(error)), api);
      socketLog.listen((log: string) => dispatch(setLogListAction(log)));
      setTimeout(() => {
        socketData.listen((data: any) => {
          dispatch(setFlowRunningDataAction(data));
          dispatch(setFlowRunningDataHistoryAction({ [new Date().getTime()]: data }));
        });
        // socketState.listen((data: any) => dispatch(setFlowRunningStatus(data)));
      }, 200);
    };

    return () => {
      socketError.close();
      socketLog.close();
      socketData.close();
      // socketState.close();
    };
  }, [canvasStart]);

  return (
    <div className={`flex-box-justify-between ${styles.headerToolbar} boxShadow`}>
      {contextHolder}
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
          disabled={!!canvasStart || !!selectedNode}
          onClick={() => {
            saveGraph();
          }}
        >保存</Button>
        <Dropdown
          trigger={!!selectedNode ? [] : ['click']}
          getPopupContainer={(triggerNode: any) => {
            return triggerNode.parentNode || document.body;
          }}
          menu={{ items: startList }}
        >
          <Button
            size='small'
            icon={<CaretRightOutlined />}
            className={!!canvasStart ? '' : 'success-font'}
            disabled={!!canvasStart || !!selectedNode}
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
