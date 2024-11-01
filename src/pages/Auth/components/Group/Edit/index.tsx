import React, { Fragment, useEffect, useReducer, useState } from 'react';
import { AutoComplete, Button, Checkbox, Divider, Empty, Form, Input, message, Popconfirm, Row, Select, Spin, Table } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './index.module.less';
import { addGroup, getGroupById, updateGroupById } from '@/services/auth';
import { authorIds } from '@/auth/auth';
import { authorToChinese } from '@/auth/common'
import { StoreEnum } from '@/pages/Auth/store/typing';
import { getUserData } from '@/utils/utils';
import * as _ from 'lodash-es';

interface Props {
  dispatch: any;
}

const GroupEditPage: React.FC<Props> = (props: any) => {
  const { dispatch } = props;
  const location: any = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { validateFields, resetFields, getFieldsValue, setFieldsValue } = form;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const [selected, setSelected] = useState<any>({
    home: {
      indeterminate: false,
      value: []
    },
    projects: {
      indeterminate: false,
      value: []
    },
    monitor: {
      indeterminate: false,
      value: []
    },
    plugins: {
      indeterminate: false,
      value: []
    },
    resource: {
      indeterminate: false,
      value: []
    },
    software: {
      indeterminate: false,
      value: []
    },
    auth: {
      indeterminate: false,
      value: []
    },
    'ccd-home': {
      indeterminate: false,
      value: []
    },
    'ccd-history': {
      indeterminate: false,
      value: []
    },
    'ccd-control': {
      indeterminate: false,
      value: []
    },
    'ccd-setting': {
      indeterminate: false,
      value: []
    },
    'ccd-log': {
      indeterminate: false,
      value: []
    }
  });
  useEffect(() => {
    if (!!state) {
      setLoading(true);
      getGroupById(state).then((res: any) => {
        if (!!res && res?.code === 'SUCCESS') {
          setData(res?.data || {});
          setFieldsValue({ auth: res?.data?.auth });
          let result: any = {};
          (res?.data?.authList || [])?.forEach((auth: any) => {
            if (auth?.indexOf('.') < 0) {
              result[auth] = [];
            } else if (result[auth?.split('.')?.[0]]) {
              result[auth?.split('.')?.[0]] = result[auth?.split('.')?.[0]]?.concat(auth);
            } else {
              result[auth?.split('.')?.[0]] = []?.concat(auth);
            }
          });
          setSelected((prev: any) => {
            return (Object.entries(prev) || [])?.reduce((pre: any, cen: any) => {
              return {
                ...pre,
                [cen[0]]: {
                  ...cen[1],
                  indeterminate: !!result[cen[0]]?.length && (result[cen[0]]?.length < (authorIds?.filter((i: any) => i.id === cen[0])?.[0]?.children?.length || 0)),
                  value: result[cen[0]]
                }
              }
            }, {});
          });
        } else {
          message.error(res?.message || '接口异常');
        }
        setLoading(false);
      });
    }
  }, [state]);
  const onCancel = () => {
    navigate(-1);
  };
  const handleOk = () => {
    validateFields()
      .then((values) => {
        const { auth, ...rest } = values;
        const userInfo = getUserData();
        const params = {
          ...rest,
          auth: auth.trim(),
          designedBy: userInfo?.userName,
          authList: (Object.entries(selected) || [])?.reduce((pre: any, cen: any) => {
            if (cen[1]?.value?.length) {
              return pre.concat(cen[0]).concat(cen[1]?.value)
            }
            return pre.concat(cen[1]?.value)
          }, []).filter(Boolean)
        }
        if (data?.id) {
          updateGroupById(data.id, params).then((res: any) => {
            if (!!res && res?.code === 'SUCCESS') {
              message.success('编辑成功');
              onCancel();
            } else {
              message.error(res?.message || '接口异常');
            }
          });
        } else {
          addGroup(params).then((res: any) => {
            if (!!res && res?.code === 'SUCCESS') {
              message.success('添加成功');
              onCancel();
            } else {
              message.error(res?.message || '接口异常');
            }
          });
        }
      })
      .catch((err) => {
        const { errorFields } = err;
        message.error(`${errorFields[0].errors[0]} 是必填项`);
      });;
  };
  useEffect(() => {
    dispatch({
      type: StoreEnum.buttonDom,
      value: <Fragment>
        <Button
          onClick={() => {
            return onCancel();
          }}
        >
          返回
        </Button>
        <Button
          type="primary"
          style={{ marginLeft: 8 }}
          onClick={() => {
            return handleOk();
          }}
        >
          保存
        </Button>
      </Fragment>,
    });
    return () => {
      dispatch({
        type: StoreEnum.buttonDom,
        value: '',
      });
    }
  }, [data, selected]);

  return <div className={`${styles.groupEditPage}`}>
    <Spin spinning={loading} tip={"加载中..."}>
      <Form
        form={form}
        // layout={'vertical'}
        scrollToFirstError
      >
        <div className="flex-box group-edit-page-item">
          <div className="group-edit-page-title">分组名称:</div>
          <div className="group-edit-page-value">
            <Form.Item
              name="auth"
              label=""
              rules={[{ required: true, message: '分组名称' }]}
              style={{ margin: 0 }}
            >
              <AutoComplete
                style={{ width: '99%' }}
                options={[
                  { value: '普通用户' },
                  { value: '管理员' },
                ]}
                placeholder="请输入分组名称"
                disabled={data?.auth}
                filterOption={(inputValue: any, option: any) =>
                  option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
              />
            </Form.Item>
          </div>
        </div>
      </Form>
      <div className="group-edit-page-item">
        <div className="group-edit-page-title">分组权限:</div>
        <div className="group-edit-page-value">{
          (authorIds || [])?.map?.((item: any, index: number) => {
            const { id, children = [] } = item;
            return <div className="group-edit-page-item-selected" key={`group-edit-${index}`}>
              <Checkbox
                indeterminate={selected[id]?.indeterminate}
                checked={selected[id]?.value?.length === children.length}
                onChange={(e: any) => {
                  setSelected((prev: any) => {
                    return {
                      ...prev,
                      [id]: {
                        ...prev[id],
                        indeterminate: false,
                        value: e.target.checked ? children : []
                      }
                    };
                  });
                }}
              >
                {authorToChinese[id]}
              </Checkbox>
              {
                !!children && !!children?.length ?
                  <br />
                  : null
              }
              <Checkbox.Group
                options={(children || [])?.map?.((child: any) => {
                  if (!child) return null;
                  return {
                    label: authorToChinese[child]?.split(`${authorToChinese[id]}-`)?.[1],
                    value: child
                  };
                })}
                value={selected[id]?.value}
                onChange={(value: any) => {
                  setSelected((prev: any) => {
                    const res = (prev[id]?.value || [])?.filter((i: string) => !children.includes(i));
                    const result = Array.from(new Set(res.concat(value)));
                    return {
                      ...prev,
                      [id]: {
                        ...prev[id],
                        indeterminate: !!result?.length && (result?.length < children?.length),
                        value: result
                      }
                    };
                  });
                }}
              />
              <Divider />
            </div>
          })
        }</div>
      </div>
    </Spin>
  </div>;
};


export default GroupEditPage;

