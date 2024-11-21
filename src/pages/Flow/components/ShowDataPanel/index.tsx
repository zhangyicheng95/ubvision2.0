import React, { memo, useEffect, useMemo, useState } from 'react';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';
import { Form, Modal, Splitter } from 'antd';


import { errorColor } from '../../common/constants';

const { confirm } = Modal;
interface Props { }

const ShowDataPanel: React.FC<Props> = (props: any) => {
  const { graphData, selectedNode, canvasData, canvasStart, errorList, flowRunningData } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [dataViewType, setDataViewType] = useState('output');

  // 选中的节点实例
  const node = useMemo(() => {
    if (!graphData) return null;
    const nodeId = selectedNode?.split('$%$')?.[1];
    return graphData.getCellById(nodeId)
  }, [graphData, selectedNode]);
  // 监听errorList
  useEffect(() => {
    (errorList || [])?.forEach((error: any) => {
      const { level, uid } = error;
      if (errorColor.includes(_.toUpper(level)) && !!uid) {
        const node = graphData.getCellById(uid);
        node.updateData({ status: level })
      }
    })
  }, [graphData, errorList]);
  // 当前监听的节点
  const runningSource = useMemo(() => {
    console.log(flowRunningData, selectedNode);

    // const { customId, running, graphLock, alias, guid, description, ...rest } = flowRunningData || {};
    // return rest;
  }, [flowRunningData, selectedNode]);

  return (
    <div className={styles.showDataPanel}>
      <div className="config-panel-right">
        <Splitter layout="vertical">
          <Splitter.Panel>
            <div className="config-panel-right-title boxShadow">
              {`数据查看器`}
            </div>
            <div className="config-panel-right-body">

            </div>
          </Splitter.Panel>
          <Splitter.Panel defaultSize="20%" min="5%" max="50%">
            <div className="flex-box config-panel-right-footer-toolbar">
              {
                buttonList?.map((item: any) => {
                  const { key, title, icon, hover } = item;
                  return <div
                    className={`flex-box config-panel-right-footer-toolbar-item ${dataViewType === key ? 'primaryBackgroundColor' : ''}`}
                    key={`config-panel-right-footer-toolbar-item-${key}`}
                    onClick={() => {
                      setDataViewType(key);
                    }}
                  >
                    {dataViewType === key ? hover : icon}
                    <span className="item-title">{title}</span>
                  </div>
                })
              }
            </div>
            <div className="config-panel-right-footer-body">
              {
                dataViewType === 'output' ?
                  (Object.entries(flowRunningData) || [])?.map((res: any) => {
                    return <div
                      className="config-panel-right-footer-body-item"
                      key={`config-panel-right-footer-body-item-${res[0]}`}
                    >

                    </div>
                  })
                  : null
              }
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
};

export default memo(ShowDataPanel);

const buttonList = [
  {
    title: '输入数据',
    key: 'input',
  },
  {
    title: '输出结果',
    key: 'output',
  },
  {
    title: '历史结果',
    key: 'history',
  },
  {
    title: '帮助',
    key: 'help',
  }
];