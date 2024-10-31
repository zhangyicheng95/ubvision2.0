import { Button, Col, Form, Input, message, Switch } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  chooseFile,
  chooseFolder,
  openFolder,
} from '@/api/native-path';
import styles from './index.module.less';
import * as _ from 'lodash-es';
import TooltipDiv from '@/components/TooltipDiv';

interface Props {
  stateData: any;
  dispatch: any;
}

const GeneralPage: React.FC<Props> = (props: any) => {
  const params: any = !!location.search
    ? new URLSearchParams(location.search)
    : !!location.href
      ? new URLSearchParams(location.href)
      : {};
  const number = params.get('number');
  const { ipcRenderer }: any = window?.Electron || {};
  const [form] = Form.useForm();
  const {
    validateFields,
    resetFields,
    getFieldsValue,
    getFieldValue,
    setFieldsValue,
  } = form;
  const [folderPath, setFolderPath] = useState('');
  const [logSavePath, setLogSavePath] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (localStorage.getItem('theme-mode')) {
      setTheme(localStorage.getItem('theme-mode') || '');
    } else {
      window?.Electron?.ipcRenderer?.invoke?.('theme-get').then((res) => {
        if (res === 'light') {
          setTheme('light');
        } else if (res === 'system') {
          setTheme('system');
        } else {
          setTheme('dark');
        }
      });
    }
    try {
      const result = JSON.parse(
        localStorage.getItem('general_setting') || '{}'
      );
      setFolderPath(result?.folder_path);
      setFieldsValue(
        Object.assign(
          {},
          result,
          !result['alert_url_path']
            ? {
              alert_url_path: 'localhost:5001/index.html',
            }
            : {},
          {
            ipUrl: !!localStorage.getItem('ipUrl')
              ? localStorage.getItem('ipUrl')
              : 'localhost:8866',
          },
        )
      );
      if (!!result?.logSave_path) {
        setLogSavePath(result?.logSave_path);
      } else {
        setLogSavePath(`C:\\UBVisionData\\.ubvision`);
        setFieldsValue({ logSave_path: `C:\\UBVisionData\\.ubvision` });
        return;

        ipcRenderer.once('home-dir-read-reply', function (res: any) {
          if (res === 'error') {
            message.error('系统信息获取失败');
          } else {
            const path = `${res}\\.ubvision`;
            setLogSavePath(path);
            setFieldsValue({ logSave_path: path });
          }
        });
        ipcRenderer.ipcCommTest('home-dir-read');
      }
    } catch (err) {
      console.error(err);
    }

    return () => {
      setFolderPath('');
      setLogSavePath('');
      resetFields();
    };
  }, []);
  // 改变主题色
  const onChangeTheme = (theme: string) => {
    setFieldsValue({ theme });
    window?.Electron?.ipcRenderer?.invoke?.(`theme-mode-${number}`, theme);
    setTheme(theme);
    localStorage.setItem('theme-mode', theme);
    window.location.reload();
  };
  // 保存
  const onFinish = (values: any) => {
    const { ipUrl, ...rest } = values;
    localStorage.setItem('general_setting', JSON.stringify(rest));
    localStorage.setItem('ipUrl', ipUrl);
    message.success('设置成功');
    window.location.reload();
  };

  return (
    <div className={styles.generalPage}>
      <Form
        form={form}
        layout={'vertical'}
        scrollToFirstError
        onFinish={onFinish}
      >
        <Form.Item
          name="ipUrl"
          label="服务端地址"
          rules={[{ required: true, message: '服务端地址' }]}
        >
          <Input placeholder="localhost:8866" />
        </Form.Item>
        <Form.Item
          name="theme"
          label="主题色"
          rules={[{ required: false, message: '主题色' }]}
        >
          <div className="flex-box">
            <Button
              type={theme === 'light' ? 'primary' : 'default'}
              onClick={() => theme !== 'light' && onChangeTheme('light')}
              style={{ marginRight: 16 }}
            >
              亮
            </Button>
            <Button
              type={theme === 'dark' ? 'primary' : 'default'}
              onClick={() => theme !== 'dark' && onChangeTheme('dark')}
            >
              暗
            </Button>
          </div>
        </Form.Item>
        <Form.Item
          name="folder_path"
          label="资源管理路径"
          rules={[{ required: false, message: '资源管理路径' }]}
        >
          <div className="flex-box">
            {folderPath ? (
              <TooltipDiv
                title={folderPath}
                style={{ maxWidth: '70%', marginRight: 16 }}
              >
                <a onClick={() => openFolder(folderPath)}>{folderPath}</a>
              </TooltipDiv>
            ) : null}
            <Button
              onClick={() => {
                chooseFolder((res, err) => {
                  const result =
                    _.isArray(res) && res.length === 1 ? res[0] : res;
                  setFolderPath(result);
                  setFieldsValue({ folder_path: result });
                });
              }}
            >
              选择文件夹
            </Button>
          </div>
        </Form.Item>
        <Form.Item
          name="logSave_path"
          label="日志存储路径"
          rules={[{ required: false, message: '日志存储路径' }]}
        >
          <div className="flex-box">
            {logSavePath ? (
              <TooltipDiv
                title={logSavePath}
                style={{ maxWidth: '70%', marginRight: 16 }}
              >
                <a onClick={() => openFolder(logSavePath)}>{logSavePath}</a>
              </TooltipDiv>
            ) : null}
            <Button
              onClick={() => {
                chooseFolder((res, err) => {
                  const result =
                    _.isArray(res) && res.length === 1 ? res[0] : res;
                  setLogSavePath(result);
                  setFieldsValue({ logSave_path: result });
                });
              }}
            >
              选择文件夹
            </Button>
          </div>
        </Form.Item>
        <Form.Item
          name="alert_url_path"
          label="监控窗口地址"
          rules={[{ required: false, message: '监控窗口地址' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default GeneralPage;
