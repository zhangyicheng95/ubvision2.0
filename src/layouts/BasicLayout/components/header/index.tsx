import React, { useEffect } from 'react';
import { Menu, Dropdown, Button } from 'antd';
import {
  BorderOutlined,
  UnorderedListOutlined,
  MinusOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import styles from './index.module.less';
import { useNavigate } from 'react-router-dom';
import { clearAllInterval } from '@/utils/utils';

const CHeader: React.FC = (props: any) => {
  const params: any = !!location.search
    ? new URLSearchParams(location.search)
    : !!location.href
      ? new URLSearchParams(location.href)
      : {};

  const number = params.get('number') || 1;
  var document: any = window.document;
  const navigate = useNavigate();
  // 展开/全屏
  const requestFullScreen = (element: any) => {
    var requestMethod =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.msRequestFullscreen ||
      element.mozRequestFullScreen;
    if (requestMethod) {
      requestMethod.call(element);
    }
  };
  // 退出全屏
  const exitFullScreen = () => {
    var exitMethod =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen ||
      document.mozCancelFullScreen;
    if (exitMethod) {
      exitMethod.call(document);
    }
  };
  // 判断当前是否全屏
  const isFullscreenElement = () => {
    var isFull =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement ||
      document.mozFullScreenElement;
    return !!isFull;
  };
  // 全屏
  const fullScreen = () => {
    if (isFullscreenElement()) {
      exitFullScreen();
      // document.getElementById('full-button-new').innerText = '全屏';
    } else {
      requestFullScreen(document.body);
      // document.getElementById('full-button-new').innerText = '退出全屏';
    }
  };
  // 最小化窗口
  const minimize = () => {
    window?.ipcRenderer?.invoke(`minimize-${number}`, number);
  };
  // 最大化/还原窗口
  const maximize = () => {
    window?.ipcRenderer?.invoke(`maximize-${number}`, number);
  };
  // 关闭窗口
  const close = () => {
    clearAllInterval();
    window?.ipcRenderer?.invoke(
      `close-${number}`,
      location.href?.indexOf('#/flow') > -1 ||
      location.href?.indexOf('#/ccd') > -1
    );
  };
  // 改变主题色
  const changeTheme = (theme: string) => {
    localStorage.setItem('theme-mode', theme);
    window?.ipcRenderer?.invoke(`theme-mode-${number}`, theme);
    window.location.reload();
  };
  const settingList: any = [
    {
      key: 'f12',
      label: <div onClick={() => {
        window?.ipcRenderer?.invoke(`openDevTools-${number}`);
      }}>开发者工具</div>
    },
    {
      key: 'f5',
      label: <div onClick={() => {
        window.location.reload();
      }}>刷新</div>
    },
    {
      key: 'screen',
      label: <div onClick={() => {
        fullScreen();
      }}>全屏/退出全屏</div>
    },
    { type: 'divider' },
    {
      key: 'light',
      label: <div onClick={() => {
        changeTheme('light');
      }}>主题色-亮</div>
    },
    {
      key: 'dark',
      label: <div onClick={() => {
        changeTheme('dark');
      }}>主题色-暗</div>
    }
  ];

  return (
    <div className={`${styles.basicLayoutHeader} flex-box-justify-between`}>
      <div className="flex-box">
        <div className="basic-layout-header-title-box">UBVision</div>
        <Dropdown
          menu={{ items: settingList }}
          placement="bottomLeft"
        >
          <Button
            icon={<UnorderedListOutlined style={{
              color: localStorage.getItem('theme-mode') === 'dark' ? '#fff' : '#000'
            }} />}
            type="text"
            className="basic-layout-header-btn"
          />
        </Dropdown>
        <div className="flex-box"></div>
      </div>
      <div className="flex-box electron-drag"></div>
      <div className="flex-box operation-box">
        <Button
          icon={<MinusOutlined style={{
            color: localStorage.getItem('theme-mode') === 'dark' ? '#fff' : '#000'
          }} />}
          type="text"
          className="basic-layout-header-btn"
          onClick={() => minimize()}
        />
        <Button
          icon={<BorderOutlined style={{
            color: localStorage.getItem('theme-mode') === 'dark' ? '#fff' : '#000'
          }} />}
          type="text"
          className="basic-layout-header-btn"
          onClick={() => maximize()}
        />
        <Button
          icon={<CloseOutlined style={{
            color: localStorage.getItem('theme-mode') === 'dark' ? '#fff' : '#000'
          }} />}
          type="text"
          className="basic-layout-header-btn"
          onClick={() => close()}
        />
      </div>
    </div>
  );
};

export default CHeader;
