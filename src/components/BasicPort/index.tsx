import React, { memo } from 'react';
import { Popover } from 'antd';
import * as _ from 'lodash-es';
import { archSize, portTypeObj } from '@/pages/Flow/common/constants';

interface Props {
  group: string;
  id: string;
  label: any;
  node?: any;
}

const BasicPort: React.FC<Props> = (props) => {
  const {
    id,
    label,
    group,
    node = {},
  } = props;

  return (
    <Popover
      className={`port_${id}`}
      title={label?.alias}
      content={<div>
        <div>原名: {label?.name}</div>
        <div>类型: {label?.type}</div>
        <div>描述: {label?.description}</div>
        {
          group === 'bottom' ?
            <div>数据推送: {label?.pushData ? '开启' : '关闭'}</div>
            :
            <div>必要: {label?.require ? '是' : '否'}</div>
        }
      </div>
      }
      placement={group === 'bottom' ? 'bottomLeft' : 'topLeft'}
    >
      <div
        // @ts-ignore
        type={label.type}
        style={{
          width: archSize?.width,
          height: archSize?.height || 40,
          borderRadius: 5,
          marginLeft: `-${archSize?.width / 2}px`,
          marginTop: group === 'bottom' ? 0 : `-${archSize?.height}px`,
          background: portTypeObj[label?.type]?.color || portTypeObj.default || '#165b5c',
          color: '#fff',
          fontSize: 10,
          padding: '0 5px',
          cursor: group === 'bottom' ? 'crosshair' : 'move',
        }}
      >
        <div className="only-show-one-line" style={{ fontSize: 14, fontWeight: 'bold' }}>
          {label?.alias}
        </div>
        <div className="only-show-one-line">
          {label?.name}: {label?.type}
        </div>
      </div>
    </Popover>
  );
};

export default memo(BasicPort);
