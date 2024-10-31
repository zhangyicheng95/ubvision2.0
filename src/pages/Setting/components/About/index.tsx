import React, { useEffect, useState } from 'react';
import { Badge, Form, Input, message, Modal } from 'antd';
import icon from '@/layouts/BasicLayout/assets/icon.png';
import styles from './index.module.less';
import {
  getRandomSalt,
  copyUrlToClipBoard,
  cryptoDecrypt,
  cryptoEncryption,
  guid,
  timeToString,
} from '@/utils/utils';
import ProjectApi from '@/api/project';
import * as _ from 'lodash-es';

interface Props {
  stateData: any;
  dispatch: any;
}

const AboutPage: React.FC<Props> = (props: any) => {
  const { setEmpowerVisible } = props;
  const { ipcRenderer }: any = window?.Electron || {};
  const [form] = Form.useForm();
  const [empowerData, setEmpowerData] = useState<any>({});

  useEffect(() => {
    ProjectApi.getStorage('softwareEmpowerTime').then((empowerRes) => {
      console.log(empowerRes);
      setEmpowerData(empowerRes.data);
    });
  }, []);

  return (
    <div className={`${styles.aboutPage} flex-box-column`}>
      <div className="top-icon flex-box-center">
        <img src={icon} alt="icon" />
      </div>
      <div className="top-info">
        为工业视觉质检项目提供易用、快捷高效的集成解决方案。
      </div>
      <div className="bottom-content">
        <div
          className="content-item flex-box"
          onClick={() => {
            ipcRenderer.ipcCommTest('update-event');
          }}
        >
          检查更新
          <div className="flex-box">
            <span style={{ marginRight: 8, color: '#a0a3a7', fontSize: 12 }}>
              {process.env.APP_VERSION}
            </span>
            {!!localStorage.getItem('needUpdate') ? (
              <Badge status="success" />
            ) : null}
          </div>
        </div>
      </div>
      <div className="bottom-content">
        <div className="content-item flex-box">
          <div
            onClick={() => {
              setEmpowerVisible(true);
              const jiami = cryptoEncryption(
                'HOSTNAME=zhangyiengdeAir.lan&DAY=30&TODAY=1715915771453'
              );
              console.log(jiami);
            }}
          >
            更新授权码
          </div>
          <div className="flex-box">
            <span style={{ marginRight: 8, color: '#a0a3a7', fontSize: 12 }}>
              剩余
              {timeToString(
                (empowerData?.time || new Date().getTime()) -
                  new Date().getTime()
              )?.d || 0}
              天
              {timeToString(
                (empowerData?.time || new Date().getTime()) -
                  new Date().getTime()
              )?.h || 0}
              小时
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
