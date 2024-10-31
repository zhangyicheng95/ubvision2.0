import React, { useState } from 'react';
import { Button, Form, Input, message, Modal } from 'antd';

import styles from './index.module.less';
import { cryptoEncryption, getUserData } from '@/utils/utils';
import { modifyPassword, updateUserById } from '@/services/auth';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash';

interface Props {
  stateData: any;
  dispatch: any;
}

const UserInfoPage: React.FC<Props> = (props: any) => {
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const { validateFields, resetFields, getFieldsValue, setFieldsValue } = form;
  const navigate = useNavigate();
  const userInfo = getUserData();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.userInfoPage}>
      <div className="user-info-content">
        <Form form={form} scrollToFirstError={true} initialValues={userInfo}>
          <Form.Item
            name={'userName'}
            label={'角色账户'}
            rules={[{ required: false, message: '角色账户' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name={'nickName'}
            label={'用户昵称'}
            rules={[{ required: false, message: '用户昵称' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </div>
      <div className="flex-box user-info-footer">
        <Button
          type="primary"
          loading={loading}
          onClick={() => {
            setLoading(true);
            validateFields()
              .then((values) => {
                updateUserById(userInfo.id, {
                  ..._.omit(userInfo, 'password'),
                  ...values,
                }).then((res: any) => {
                  if (!!res && res?.code === 'SUCCESS') {
                    message.success('更新成功');
                    localStorage.setItem(
                      'userInfo',
                      JSON.stringify({
                        ...res?.data,
                        loginTime: new Date().getTime(),
                      })
                    );
                    window.location.reload();
                  } else {
                    message.error(res?.message || '接口异常');
                  }
                  setLoading(false);
                });
              })
              .catch((err) => {
                const { errorFields } = err;
                message.error(`${errorFields[0].errors[0]} 是必填项`);
              });
          }}
        >
          保存
        </Button>
        <Button
          type="primary"
          onClick={() => {
            setPasswordVisible(true);
          }}
        >
          重置密码
        </Button>
        {/* <Button onClick={() => {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }}>退出登录</Button> */}
      </div>
      {
        // 密码框
        !!passwordVisible ? (
          <Modal
            title={`修改密码`}
            centered
            open={!!passwordVisible}
            maskClosable={false}
            destroyOnClose
            confirmLoading={loading}
            onOk={() => {
              form1.validateFields().then((values) => {
                const { old_password, new_password } = values;
                setLoading(true);
                modifyPassword(userInfo?.id, {
                  new_password: cryptoEncryption(new_password),
                  old_password: cryptoEncryption(old_password),
                }).then((res: any) => {
                  if (res && res.code === 'SUCCESS') {
                    message.success('修改密码成功');
                    localStorage.setItem(
                      'userInfo',
                      JSON.stringify({
                        ...res?.data,
                        loginTime: new Date().getTime(),
                      })
                    );
                    form1.resetFields();
                    setPasswordVisible(false);
                  } else {
                    message.error(res?.msg || res?.message || '接口异常');
                  }
                  setLoading(false);
                });
              });
            }}
            onCancel={() => {
              form1.resetFields();
              setPasswordVisible(false);
            }}
          >
            <Form form={form1} scrollToFirstError>
              <Form.Item
                name="old_password"
                label="原密码"
                rules={[{ required: true, message: '原始密码' }]}
              >
                <Input.Password
                  visibilityToggle={false}
                  allowClear
                  placeholder="原始密码"
                />
              </Form.Item>
              <Form.Item
                name="new_password"
                label="新密码"
                rules={[{ required: true, message: '新密码' }]}
              >
                <Input.Password
                  visibilityToggle={false}
                  allowClear
                  placeholder="新密码"
                />
              </Form.Item>
            </Form>
          </Modal>
        ) : null
      }
    </div>
  );
};

export default UserInfoPage;
