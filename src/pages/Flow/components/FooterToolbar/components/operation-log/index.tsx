import React, { useContext, useEffect, useState } from 'react';

import AlgoNode from '@/components/AlgoNode';
import { Group } from '@/pages/Flow/config/shape';

import styles from './index.module.less';
import moment from 'moment';
import { message, Modal } from 'antd';
import _ from 'lodash';

import { register } from '@antv/x6-react-shape';

const { confirm } = Modal;
interface Props {
  graphData: any;
}

const operationTypeList = (type: string) => {
  switch (type) {
    case 'add':
      return '添加了';
    case 'delete':
      return '删除了';
    case 'modify':
      return '修改了';
    default:
      return '';
  }
};
const OperationLog: React.FC<Props> = (props) => {

  return (
    <div className={styles.operationLog}>

    </div>
  );
};

export default OperationLog;
