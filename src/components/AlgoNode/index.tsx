import React, { Fragment, memo, useMemo, useState } from 'react';
import { Dropdown, Modal } from 'antd';
import {
  AlignLeftOutlined, CloudDownloadOutlined, CloudSyncOutlined,
  CopyOutlined, DeleteOutlined, PlusOutlined, SyncOutlined, CaretRightOutlined, BugOutlined
} from '@ant-design/icons';
import * as X6 from '@antv/x6';
import TooltipDiv from '@/components/TooltipDiv';
import { copyUrlToClipBoard } from '@/utils/utils';
import styles from './index.module.less';
import _ from 'lodash';
import { nodeStatusColor } from '@/pages/Flow/common/constants';

const { Graph, Markup, Path, Shape, Cell, NodeView, Vector } = X6;
const { confirm } = Modal;

// @ts-ignore
export const isImgFun = (item: string) => {
  return (
    item?.indexOf('http') > -1 &&
    (item?.indexOf('jpg') > -1 ||
      item?.indexOf('jpeg') > -1 ||
      item?.indexOf('png') > -1 ||
      item?.indexOf('bmp') > -1)
  );
};
export const is3DFun = (item: string) => {
  return (
    item?.indexOf('http') > -1 &&
    (item?.indexOf('ply') > -1 || item?.indexOf('pcd') > -1 || item?.indexOf('stl') > -1)
  );
};

interface Props {
  graph?: any;
  node?: any;
  data: any;
  noBtn?: boolean;
}

const AlgoNode: React.FC<Props> = (props) => {
  const {
    data,
    graph,
    node,
    noBtn = false,
  } = props;
  const { alias, name, id, customId } = data;
  const nodeData = node?.getData?.();
  const [currentNode, setCurrentNode] = useState({
    status: 'STOPPED',
    input_check: true, // false未开启输入校验-蓝色
    initParams_check: true, // false有必填项没填-红色
  });
  const [borderColor, setBorderColor] = useState(nodeStatusColor.STOPPED);

  // 右键下拉菜单
  const settingList: any = [
    {
      key: '0',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        copyUrlToClipBoard(id);
      }}>
        <CaretRightOutlined className="contextMenu-icon" />
        停止流程
        <span className="contextMenu-text">Stop</span>
      </div>
    },
    {
      key: '1',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        copyUrlToClipBoard(id);
      }}>
        <CaretRightOutlined className="contextMenu-icon" />
        运行流程到此处
        <span className="contextMenu-text">Run to here</span>
      </div>
    },
    {
      key: '2',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        copyUrlToClipBoard(id);
      }}>
        <BugOutlined className="contextMenu-icon" />
        单元测试
        <span className="contextMenu-text">Run Self</span>
      </div>
    },
    {
      key: '3',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        copyUrlToClipBoard(id);
      }}>
        <BugOutlined className="contextMenu-icon" />
        停止单元测试
        <span className="contextMenu-text">Stop Self</span>
      </div>
    },
    { type: 'divider' },
    {
      key: '4',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        // setRenameVisible(true);
      }}>
        <DeleteOutlined className="contextMenu-icon" />
        删除节点
        <span className="contextMenu-text">Delete Node</span>
      </div>
    },
    {
      key: '5',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        // setRenameVisible(true);
      }}>
        <CopyOutlined className="contextMenu-icon" />
        复制节点
        <span className="contextMenu-text">Copy Node</span>
      </div>
    },
    {
      key: '6',
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
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        // setRenameVisible(true);
      }}>
        <SyncOutlined className="contextMenu-icon" />
        同步属性
        <span className="contextMenu-text">Sync Node</span>
      </div>
    },
    {
      key: '8',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        // setRenameVisible(true);
      }}>
        <CloudSyncOutlined className="contextMenu-icon" />
        同步链接桩
        <span className="contextMenu-text">Sync Ports</span>
      </div>
    },
    { type: 'divider' },
    {
      key: '9',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        // setRenameVisible(true);
      }}>
        <PlusOutlined className="contextMenu-icon" />
        新增输入输出
        <span className="contextMenu-text">Add Ports</span>
      </div>
    },
    {
      key: '10',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        // setRenameVisible(true);
      }}>
        <CloudDownloadOutlined className="contextMenu-icon" />
        导出info
        <span className="contextMenu-text">Export Info</span>
      </div>
    },
  ];

  return (
    <Fragment>
      <Dropdown
        trigger={!noBtn ? ['contextMenu'] : []}
        disabled={
          !['STOPPED', 'UNKNOWN'].includes(currentNode?.status)
        }
        menu={{ items: settingList }}
      >
        <div
          id={id}
          className={`${styles.node}`}
          style={Object.assign(
            { borderColor: borderColor },
            currentNode?.input_check ? {} : { backgroundColor: 'rgba(0,200,200,.5)' }, // 蓝色
            currentNode?.initParams_check ? {} : { backgroundColor: 'rgba(200,0,0,.5)' }, // 红色
            ['SEARCH'].includes(currentNode?.status) ? { backgroundColor: 'rgba(200,200,0,.5)' } : {} // 黄色
          )}
        >
          <div className="flex-box node-top">
            <TooltipDiv
              id={`algoNode_${id}_name`}
              title={nodeData?.alias || alias || name}
              content={name}
              style={{
                fontSize: 40,
                fontWeight: 800
              }}
            >
              {nodeData?.alias || alias || name}
            </TooltipDiv>
          </div>
          <div className="node-content flex-box">
            <div className="flex-box-justify-between center">
              <TooltipDiv
                style={{
                  fontSize: 24,
                  opacity: 0.6,
                  marginRight: 16,
                }}
              >
                {name}
              </TooltipDiv>
              <div
                style={{
                  opacity: 0.6,
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
