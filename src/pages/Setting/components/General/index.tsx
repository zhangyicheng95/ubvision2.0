import { Button, Form, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  chooseFolder,
  openFolder,
} from '@/api/native-path';
import styles from './index.module.less';
import * as _ from 'lodash-es';
import TooltipDiv from '@/components/TooltipDiv';
import { GetQueryObj } from '@/utils/utils';

interface Props {

}

const GeneralPage: React.FC<Props> = () => {
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const number = [undefined, 'undefined'].includes(params?.['number']) ? 1 : params?.['number'];
  const { ipcRenderer }: any = window || {};
  const [form] = Form.useForm();
  const {
    resetFields,
    setFieldsValue,
  } = form;
  const [logSavePath, setLogSavePath] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (localStorage.getItem('theme-mode')) {
      setTheme(localStorage.getItem('theme-mode') || '');
    } else {
      window?.ipcRenderer?.invoke?.('theme-get').then((res) => {
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
      setFieldsValue(
        Object.assign(
          {},
          result,
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
      }
    } catch (err) {
      console.error(err);
    }

    return () => {
      setLogSavePath('');
      resetFields();
    };
  }, []);
  // 改变主题色
  const onChangeTheme = (theme: string) => {
    setFieldsValue({ theme });
    window?.ipcRenderer?.invoke?.(`theme-mode-${number}`, theme);
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
                chooseFolder((res) => {
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
