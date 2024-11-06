import React, { memo, useEffect, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete } from 'antd';
import {
  CodeOutlined, CodeFilled, FileTextOutlined, FileTextFilled,
  HighlightOutlined, HighlightFilled, CloseCircleOutlined, CloseCircleFilled
} from '@ant-design/icons';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasData } from '@/redux/actions';
import TooltipDiv from '@/components/TooltipDiv';
import { chooseFolder, openFolder } from '@/api/native-path';

interface Props { }

const FooterToolbar: React.FC<Props> = (props: any) => {
  const { canvasData, canvasStart } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const [terminalVisible, setTerminalVisible] = useState('');

  return (
    <div className={`flex-box-justify-between ${styles.footerToolbar}`}>
      <div className="flex-box">
        {
          buttonList?.map((item: any) => {
            const { key, title, icon, hover } = item;
            return <div
              className={`flex-box footer-toolbar-item ${terminalVisible === key ? 'primaryBackgroundColor' : ''}`}
              key={`footer-toolbar-item-${key}`}
              onClick={() => {
                setTerminalVisible(key);
              }}
            >
              {terminalVisible === key ? hover : icon}
              <span className="item-title">{title}</span>
            </div>
          })
        }
      </div>
      <div className="flex-box-justify-end right-project-dir">
        {
          !!canvasData?.plugin_dir
            ?
            <TooltipDiv title="打开插件地址" placement="topRight" onClick={() => openFolder(canvasData?.plugin_dir + '\\plugins')}>
              {canvasData?.plugin_dir}
            </TooltipDiv>
            :
            <TooltipDiv onClick={() => {
              chooseFolder((res: any) => {
                const pluginPath = _.isArray(res) ? res[0] : res;
                const result = {
                  ...canvasData,
                  plugin_dir: pluginPath,
                };
                dispatch(setCanvasData(result));
              });
            }}>
              设置方案路径
            </TooltipDiv>
        }
      </div>
    </div>
  );
};

export default memo(FooterToolbar);

const buttonList = [
  {
    title: 'Terminal',
    key: 'terminal',
    icon: <CodeOutlined className="item-icon" />,
    hover: <CodeFilled className="item-icon" />,
  },
  {
    title: '运行日志',
    key: 'log',
    icon: <FileTextOutlined className="item-icon" />,
    hover: <FileTextFilled className="item-icon" />,
  },
  {
    title: '操作记录',
    key: 'operationLog',
    icon: <HighlightOutlined className="item-icon" />,
    hover: <HighlightFilled className="item-icon" />,
  },
  {
    title: '告警',
    key: 'problem',
    icon: <CloseCircleOutlined className="item-icon" />,
    hover: <CloseCircleFilled className="item-icon" />,
  }
];