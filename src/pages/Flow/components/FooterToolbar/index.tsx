import React, { memo, useState } from 'react';
import {
  CodeOutlined, CodeFilled, FileTextOutlined, FileTextFilled, CloseCircleOutlined, CloseCircleFilled,
  HighlightOutlined, HighlightFilled,
} from '@ant-design/icons';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import TooltipDiv from '@/components/TooltipDiv';
import { chooseFolder, openFolder } from '@/api/native-path';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasDataAction } from '@/redux/actions';
import DetailLog from './components/detail-log';
import TerminalLog from './components/terminal-log';

interface Props { }

const FooterToolbar: React.FC<Props> = (props: any) => {
  const { canvasData, canvasStart } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const [terminalVisible, setTerminalVisible] = useState('');

  return (
    <div className={styles.footerToolbar}>
      {!!terminalVisible ?
        <div className="footer-toolbar-box">
          {
            terminalVisible === 'terminal' ?
              <TerminalLog />
              :
              terminalVisible === 'log' ?
                <DetailLog type="log" />
                :
                terminalVisible === 'error' ?
                  <DetailLog type="error" />
                  : null
          }
        </div>
        : null
      }
      <div className="flex-box-justify-between footer-toolbar-tab-box">
        <div className="flex-box">
          {
            buttonList?.map((item: any) => {
              const { key, title, icon, hover } = item;
              return <div
                className={`flex-box footer-toolbar-item ${terminalVisible === key ? 'primaryBackgroundColor' : ''}`}
                key={`footer-toolbar-item-${key}`}
                onClick={() => {
                  setTerminalVisible((pre) => pre === key ? '' : key);
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
                  dispatch(setCanvasDataAction(result));
                });
              }}>
                设置方案路径
              </TooltipDiv>
          }
        </div>
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
    title: '告警',
    key: 'error',
    icon: <CloseCircleOutlined className="item-icon" />,
    hover: <CloseCircleFilled className="item-icon" />,
  }
];