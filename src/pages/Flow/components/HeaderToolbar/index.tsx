import React, { memo, useEffect, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete, Modal, Dropdown } from 'antd';
import { BugFilled, CaretRightOutlined, DatabaseOutlined, PauseOutlined } from '@ant-design/icons';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasStart, setLoading } from '@/redux/actions';
import { startFlowService, stopFlowService } from '@/services/flowEditor';
import { clearAllInterval } from '@/utils/utils';
import { useReactFlow } from '@xyflow/react';

const { confirm } = Modal;
interface Props {
}

const HeaderToolbar: React.FC<Props> = (props) => {
  const { canvasData, canvasStart } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const reactFlow = useReactFlow();

  // 保存业务
  const saveGraph = () => {
    return new Promise((resolve, reject) => {
      console.log('toObject', reactFlow.toObject());
      resolve(true);
    });
  };
  // 启动业务
  const startFlow = (type?: string) => {
    if (canvasData?.id) {
      dispatch(setLoading(true));
      saveGraph().then((res) => {
        startFlowService({
          ...canvasData,
          id: canvasData?.id,
          debug: type === 'debugger'
        }).then(
          (res) => {
            dispatch(setLoading(false));
            if (['success', 'SUCCESS'].includes(res?.code)) {
              dispatch(setLoading(false));
              dispatch(setCanvasStart(true));
            } else {
              message.error(
                res?.message || res?.msg || '服务启动失败，请检查网络设置'
              );
              dispatch(setLoading(false));
            }
          }
        );
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
  };
  // 停止业务
  const stopFlow = (ifGoBack?: Boolean, ifRestart?: Boolean) => {
    dispatch(setLoading(true));
    // socketDataRef.current && socketDataRef.current?.close();
    // socketStateRef.current && socketStateRef.current?.close();
    // socketErrorRef.current && socketErrorRef.current?.close();
    // socketDetailRef.current && socketDetailRef.current?.close();
    setTimeout(() => {
      stopFlowService(canvasData?.id).then((res) => {
        if (['success', 'SUCCESS'].includes(res?.code)) {
          dispatch(setLoading(false));
          dispatch(setCanvasStart(false));
        } else {
          message.error(res?.message || '停止服务失败，请检查网络设置');
        }
      });
    }, 1000);
  };
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
        <DatabaseOutlined />{canvasData?.name || '默认方案'}
      </div>
      <div className="flex-box">

      </div>
      <div className="flex-box header-toolbar-operation-box">
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
