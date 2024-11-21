import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete, Dropdown, Menu, Popconfirm } from 'antd';
import {
  DeleteOutlined, CloudDownloadOutlined, FieldTimeOutlined, FolderAddOutlined, FolderOpenOutlined, FolderOutlined, LaptopOutlined, PlusOutlined, ProjectOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { login } from '@/services/auth';
import { cryptoEncryption, getUserAuthList } from '@/utils/utils';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import PrimaryTitle from '@/components/PrimaryTitle';

interface Props { }

const PluginPage: React.FC<Props> = (props: any) => {
  const [form] = Form.useForm();
  const { setFieldsValue } = form;
  const navigate = useNavigate();
  const userAuthList = getUserAuthList();
  const [searchVal, setSearchVal] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  const settingList: any = [
    userAuthList.includes('plugins.delete') ? {
      key: `delete`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {

      }}>
        <DeleteOutlined className="contextMenu-icon" />
        批量删除
        <span className="contextMenu-text">Delete plugins</span>
      </div>
    } : null,
    userAuthList.includes('plugins.export') ? {
      key: `export`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {

      }}>
        <CloudDownloadOutlined className="contextMenu-icon" />
        批量导出
        <span className="contextMenu-text">Copy ID</span>
      </div>
    } : {},
    { type: 'divider' },
  ]?.filter(Boolean);

  return (
    <div className={styles.PluginPage}>
      <PrimaryTitle title="插件管理 Plugins"
        style={{ marginBottom: 8 }}
        onSearch={(val: string) => setSearchVal(val)}
      >
        {userAuthList.includes('plugins.delete') ? (
          <Popconfirm
            title="确定自动过滤删除没有使用的插件?"
          // onConfirm={() => filterPluginList()}
          >
            <Button icon={<DeleteOutlined />} type="primary">
              自动筛选
            </Button>
          </Popconfirm>
        ) : null}
        {userAuthList.includes('plugins.download') ? (
          <Button
            icon={<CloudDownloadOutlined />}
            type="primary"
            onClick={() => {
              // const zip = new JSZip();
              // zip.file('info.json', JSON.stringify(pluginInfo));
              // zip.file('main.py', JSON.stringify(pluginMain));
              // zip.file('__init__.py', JSON.stringify(pluginInit));
              // zip.generateAsync({ type: 'blob' }).then((content: any) => {
              //   downFileFun(content, '插件模板.zip');
              // });
            }}
          >
            下载模版
          </Button>
        ) : null}
        {userAuthList.includes('plugins.import') ? (
          // <Upload {...pluginUploadProps}>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              // ifAllcover.current = false;
              // chooseFile(
              //   (res: any, err) => {
              //     if (!!err) {
              //       message.error('格式错误或含有特殊字符');
              //     } else {
              //       setSelectedFiles(res);
              //     }
              //   },
              //   true,
              //   { name: 'File', extensions: ['json'] }
              // );
            }}
          >
            导入插件
          </Button>
        ) : // </Upload>
          null}
        {
          ((userAuthList.includes('plugins.delete') ||
            userAuthList.includes('plugins.export')) && selectedRows.length) ? (
            <Dropdown
              getPopupContainer={(triggerNode: any) => {
                return triggerNode.parentNode || document.body;
              }}
              menu={{ items: settingList }}
              trigger={['contextMenu']}
            >
              <Button icon={<CloudDownloadOutlined />} type="primary">
                批量操作
              </Button>
            </Dropdown>
          ) : null
        }
      </PrimaryTitle>
      <div className="plugin-page-body">

      </div>
    </div>
  );
};

export default PluginPage;
