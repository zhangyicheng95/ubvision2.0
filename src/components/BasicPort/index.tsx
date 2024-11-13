import React, { Fragment, memo, useRef, useState } from 'react';
import TooltipDiv from '@/components/TooltipDiv';
import { Dropdown, Menu, Modal, Popover } from 'antd';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import * as _ from 'lodash-es';
import EditPortModal from '@/components/BasicPort/components/EditPortModal';
import { guid } from '@/utils/utils';
import { archSize } from '@/pages/Flow/common/constants';

interface Props {
  color: string;
  group: string;
  id: string;
  label: any;
  node?: any;
  noBtn?: boolean;
}

const { confirm } = Modal;

const BasicPort: React.FC<Props> = (props) => {
  const {
    id,
    label,
    group,
    color,
    noBtn = false,
    node = {},
  } = props;
  const timer = useRef<any>({});
  const [settdingModel, setSettingModel] = useState(false);
  const [modifyItem, setModifyItem] = useState<any>({});
  const [currentNode, setCurrentNode] = useState<any>({
    status: 'STOPPED',
  });

  const onCancel = () => {
    setSettingModel(false);
    setModifyItem({});
  };
  // 监听节点信息变化
  node?.on?.('change:data', (args: any) => {
    const { current } = args;
    const { customId, running, graphLock, alias, ...rest } = current;
    !!timer.current[`timer-${node.id}`] &&
      clearTimeout(timer.current[`timer-${node.id}`]);
    timer.current[`timer-${node.id}`] = setTimeout(() => {
      setCurrentNode(rest);
    });
  });
  const settingList: any = [
    {
      key: '0',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {

      }}>
        <DeleteOutlined className="contextMenu-icon" />
        删除链接桩
        <span className="contextMenu-text">Delete Ports</span>
      </div>
    },
    {
      key: '1',
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {

      }}>
        <SettingOutlined className="contextMenu-icon" />
        配置链接桩
        <span className="contextMenu-text">Setting Ports</span>
      </div>
    }
  ];

  return (
    <Fragment>
      <Dropdown
        trigger={!noBtn ? ['contextMenu'] : []}
        disabled={
          !['STOPPED', 'UNKNOWN', 'SEARCH'].includes(currentNode?.status)
        }
        menu={{ items: settingList }}
      >
        <Popover
          className={`port_${id}`}
          title={label?.alias}
          content={<div>
            <div>原名: {label?.name}</div>
            <div>类型: {label?.type}</div>
            <div>描述: {label?.description}</div>
          </div>
          }
          placement={group === 'bottom' ? 'bottomLeft' : 'topLeft'}
        >
          <div style={{
            width: archSize?.width,
            height: archSize?.height || 40,
            borderRadius: 5,
            marginLeft: `-${archSize?.width / 2}px`,
            marginTop: group === 'bottom' ? 0 : `-${archSize?.height}px`,
            background: color || '#165b5c',
            color: '#fff',
            fontSize: 10,
            padding: '0 5px',
            cursor: group === 'bottom' ? 'crosshair' : 'move',
          }}>
            <div className="only-show-one-line" style={{ fontSize: 14, fontWeight: 'bold' }}>
              {label?.alias}
            </div>
            <div className="only-show-one-line">
              {label?.name}: {label?.type}
            </div>
          </div>
        </Popover>
      </Dropdown>
      {settdingModel ? (
        <EditPortModal
          data={modifyItem}
          onCancel={() => {
            onCancel();
          }}
          onOk={(params: any) => {
            const nodeData = node?.store?.data?.ports;
            const group = params.direction === 'input' ? 'top' : 'bottom';
            const ports = Object.assign({}, nodeData, {
              items: !_.isEmpty(modifyItem)
                ? (nodeData?.items || [])?.map?.((item: any) => {
                  return Object.assign(
                    {},
                    item,
                    item.id === id
                      ? {
                        group,
                        label: params,
                        position: Object.assign({}, item.position, {
                          name: group,
                        }),
                      }
                      : {}
                  );
                })
                : (nodeData?.items || []).concat({
                  group,
                  label: params,
                  customId: `port_${guid()}`,
                  position: {
                    name: group,
                  },
                }),
            });
            const result = Object.assign({}, node, {
              store: Object.assign({}, node?.store, {
                data: Object.assign({}, node?.store?.data, {
                  ports,
                }),
              }),
            });
            onCancel();
          }}
        />
      ) : null}
    </Fragment>
  );
};

export default memo(BasicPort);
