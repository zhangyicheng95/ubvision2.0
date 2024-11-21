import React, { Fragment, memo, useRef, useState } from 'react';
import { Dropdown } from 'antd';
import {
  AlignLeftOutlined, CloudSyncOutlined, CopyOutlined, DeleteOutlined, SyncOutlined,
  CaretRightOutlined, BugOutlined, UserOutlined
} from '@ant-design/icons';
import TooltipDiv from '@/components/TooltipDiv';
import { copyUrlToClipBoard } from '@/utils/utils';
import styles from './index.module.less';
import _ from 'lodash';
import { errorColor } from '@/pages/Flow/common/constants';

interface Props {
  graph?: any;
  node?: any;
  data: any;
  noBtn?: boolean;
  setSyncNode?: any;
  setRunningNode?: any;
}

const AlgoNode: React.FC<Props> = (props) => {
  const {
    data,
    graph,
    node,
    noBtn = false,
    setSyncNode = null,
    setRunningNode = null,
  } = props;
  const { alias, name, id, customId } = data;
  const timer = useRef<any>(null);
  const [currentNode, setCurrentNode] = useState({
    alias: '',
    status: 'STOPPED',
    input_check: true, // false未开启输入校验-蓝色
    initParams_check: true, // false有必填项没填-红色
    canvasStart: false, // 方案启动
  });

  // 监听节点信息变化
  node?.on?.('change:data', (args: any) => {
    const { current } = args;
    const { customId, running, graphLock, alias, ...rest } = current;
    timer.current && clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCurrentNode(current);
    }, 200);
  });
  // 右键下拉菜单
  const settingList: any = [
    {
      key: '1',
      disabled: !currentNode?.canvasStart,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        if (currentNode?.canvasStart) {
          const nodesId = (graph.getPredecessors(node) || [])?.map((item: any) => item.store?.data?.config.id);
          setRunningNode(nodesId.concat(id));
        };
      }}>
        <CaretRightOutlined className="contextMenu-icon" />
        运行流程到此处
        <span className="contextMenu-text">Run to here</span>
      </div>
    },
    {
      key: '2',
      disabled: !currentNode?.canvasStart,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        if (currentNode?.canvasStart) {
          setRunningNode([id]);
        };
      }}>
        <BugOutlined className="contextMenu-icon" />
        单元测试
        <span className="contextMenu-text">Run Self</span>
      </div>
    },
    { type: 'divider' },
    {
      key: '4',
      disabled: currentNode?.canvasStart,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        graph.removeNode(id);
      }}>
        <DeleteOutlined className="contextMenu-icon" />
        删除节点
        <span className="contextMenu-text">Delete Node</span>
      </div>
    },
    {
      key: '6',
      disabled: currentNode?.canvasStart,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        copyUrlToClipBoard(id);
      }}>
        <AlignLeftOutlined className="contextMenu-icon" />
        复制节点 ID
        <span className="contextMenu-text">Copy Node ID</span>
      </div>
    },
    { type: 'divider' },
    {
      key: '7',
      disabled: currentNode?.canvasStart,
      label: <div className='flex-box-justify-between dropdown-box'>
        <SyncOutlined className="contextMenu-icon" />
        同步属性
        <span className="contextMenu-text">Sync Node</span>
      </div>,
      children: [
        {
          key: '7-1',
          label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
            setSyncNode({ type: 'params', data, cover: false });
          }}>
            <UserOutlined className="contextMenu-icon" />
            保留用户配置
            <span className="contextMenu-text">Sync Node</span>
          </div>,
        },
        {
          key: '7-2',
          label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
            setSyncNode({ type: 'params', data, cover: true });
          }}>
            <SyncOutlined className="contextMenu-icon" />
            覆盖配置
            <span className="contextMenu-text">Sync Node</span>
          </div>,
        },
      ],
    },
    {
      key: '8',
      disabled: currentNode?.canvasStart,
      label: <div className='flex-box-justify-between dropdown-box'>
        <CloudSyncOutlined className="contextMenu-icon" />
        同步连接桩
        <span className="contextMenu-text">Sync Ports</span>
      </div>,
      children: [
        {
          key: '8-1',
          label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
            setSyncNode({ type: 'port', data, cover: false });
          }}>
            <UserOutlined className="contextMenu-icon" />
            保留用户配置
            <span className="contextMenu-text">Sync Ports</span>
          </div>,
        },
        {
          key: '8-2',
          label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
            setSyncNode({ type: 'port', data, cover: true });
          }}>
            <CloudSyncOutlined className="contextMenu-icon" />
            覆盖所有连接桩
            <span className="contextMenu-text">Sync Ports</span>
          </div>,
        },
      ],
    }
  ];

  return (
    <Fragment>
      <Dropdown
        trigger={(!noBtn) ? ['contextMenu'] : []}
        disabled={
          !['STOPPED', 'UNKNOWN'].includes(_.toUpper(currentNode?.status))
        }
        menu={{ items: settingList }}
      >
        <div
          id={id}
          className={`${styles.node}`}
          style={Object.assign(
            currentNode?.input_check ? {} : { backgroundColor: 'rgba(0,200,200,.5)' }, // 蓝色
            currentNode?.initParams_check ? {} : { backgroundColor: 'rgba(200,0,0,.5)' }, // 红色
            ['SEARCH'].includes(_.toUpper(currentNode?.status)) ? { backgroundColor: 'rgba(200,200,0,.5)' } : {}, // 黄色
            errorColor.includes(_.toUpper(currentNode?.status)) ? { backgroundColor: 'rgba(200,0,0,.5)' } : {}, // 红色，节点报错
          )}
        >
          <div className="flex-box node-top">
            <TooltipDiv
              id={`algoNode_${id}_name`}
              title={currentNode?.alias || alias || name}
              content={name}
              style={{
                fontSize: 40,
                fontWeight: 800
              }}
            >
              {currentNode?.alias || alias || name}
            </TooltipDiv>
          </div>
          <div className="node-content flex-box">
            <div className="flex-box-justify-between center">
              <TooltipDiv
                style={{
                  fontSize: 24,
                  marginRight: 16,
                }}
              >
                {name}
              </TooltipDiv>
              <div
                style={{
                  marginRight: 4,
                  lineHeight: 1
                }}
              >
                {customId?.split('node_')[1]}
              </div>
            </div>
          </div>
        </div>
      </Dropdown>
    </Fragment>
  );
};

// 右键复选框
const optionsList: any = [
  // { label: '显示运行时间', value: 'time', key: 'time' },
  // { label: '显示输入参数', value: 'coding' },
  // {
  //   label: '显示检测数据（Footer）',
  //   value: 'footer',
  //   key: 'footer',
  //   disabled: false,
  // },
];
export default memo(AlgoNode);
