import React, { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasData, setSelectedNode } from '@/redux/actions';
import { Button, Checkbox, Divider, Form, Input, InputNumber, message, Modal, Radio, Select, Splitter, Switch, Tabs, TabsProps, Upload } from 'antd';
import {
  CaretDownOutlined, CloudUploadOutlined, MinusCircleOutlined, PlusOutlined, ExclamationCircleOutlined,
  MinusSquareOutlined, ArrowUpOutlined, MinusOutlined,
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TooltipDiv from '@/components/TooltipDiv';
import { chooseFile, chooseFolder, openFolder } from '@/api/native-path';
import moment from 'moment';
import IpInput from '@/components/IpInputGroup';
import SliderGroup from '@/components/SliderGroup';
import { formatJson, getuid, guid, sortList } from '@/utils/utils';
import Measurement from '@/components/Measurement';

const { confirm } = Modal;
interface Props { }

const ShowDataPanel: React.FC<Props> = (props: any) => {
  const { graphData, selectedNode, canvasData, canvasStart } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [dataViewType, setDataViewType] = useState('output');

  // 选中的节点实例
  const node = useMemo(() => {
    if (!graphData) return null;
    const nodeId = selectedNode?.split('$%$')?.[1];
    return graphData.getCellById(nodeId)
  }, [graphData, selectedNode]);
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