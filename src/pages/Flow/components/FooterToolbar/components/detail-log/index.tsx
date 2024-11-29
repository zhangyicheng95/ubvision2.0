import React, { useEffect, useRef, useState } from 'react';
import { Input, message, Tooltip } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import { openFolder } from '@/api/native-path';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { GetQueryObj } from '@/utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setErrorList, setLogList } from '@/redux/actions';
import moment from 'moment';

interface Props {
  type: string;
}

const logColors: any = {
  WARNING: 'rgba(245,160,49,1)',
  ERROR: 'rgba(255,107,104,1)',
  CRITICAL: 'rgba(255,107,104,1)',
};

const DetailLog: React.FC<Props> = (props) => {
  const { type = 'log' } = props;
  const { logList, errorList } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const id = params?.['id'];

  const domRef = useRef<any>(null);
  const [searchData, setSearchData] = useState('');
  const [logSavePath, setLogSavePath] = useState('');

  // 清空控制台
  const clearLogContent = () => {
    if (type === 'log') {
      dispatch(setLogList([]));
    } else {
      dispatch(setErrorList([]));
    }
  };
  // 搜索框
  const onSearch = (val: string) => {
    setSearchData(val);
  };
  // 日志存储路径
  useEffect(() => {
    let path = '';
    try {
      const result = JSON.parse(localStorage.getItem('general_setting') || "{}");
      path = !!result?.logSave_path ? result?.logSave_path : '';
    } catch (err) {
      path = '';
    }
    if (path) {
      setLogSavePath(`${path}\\${id}\\logs\\master.log`);
      return;
    } else {
      setLogSavePath(`C:\\UBVisionData\\.ubvision\\${id}\\logs\\master.log`);
      return;
    }
  }, [localStorage.getItem('general_setting')]);

  return (
    <div
      ref={domRef}
      className={`${styles.detailPanel} flex-box-column`}
      id={'detail-log'}
    >
      <div className="header-search-box flex-box">
        <Tooltip placement="bottom" title="清空控制台">
          <StopOutlined
            className="header-icon"
            onClick={() => {
              return clearLogContent();
            }}
          />
        </Tooltip>
        <a
          className="header-icon-btn"
          onClick={() => {
            if (!id) {
              message.warning('请先保存');
              return;
            }
            openFolder(`${logSavePath}\\`).then(res => {
              if (res === 'error') {
                message.error('请打开正确路径');
              };
            });
          }}
        >
          打开日志存储目录
        </a>
        <Input.Search
          size="small"
          allowClear
          onSearch={(val) => {
            return onSearch(val);
          }}
        />
      </div>

      <div className="detail-panel-content ">
        <div className="log-content" style={type === 'error' ? { color: '#d70000' } : {}}>
          {
            type === 'log' ?
              <div
                className="content-item-span"
                dangerouslySetInnerHTML={{
                  // 此处需要处理
                  __html: (logList || [])?.filter((i: any) => ('' + i).indexOf(searchData || '') > -1)
                    .join(`<br/>`)
                }}
              />
              :
              errorList
                .filter((i: any) => ('' + i).indexOf(searchData || '') > -1)
                .map((item: any, index: number) => {
                  const { level, node_name, nid, message, time } = item;
                  return <div className="content-item" key={`problem_${index}`}>
                    <span>
                      {moment(time).format('YYYY-MM-DD HH:mm:ss')}&nbsp;
                    </span>
                    &nbsp;
                    <div
                      className="content-item-span"
                      style={{
                        color: logColors[_.toUpper(level)]
                          ? logColors[_.toUpper(level)]
                          : logColors.CRITICAL,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: `节点${node_name || ''} (${nid || ''}) ${message}`,
                      }}
                    />
                  </div>
                })
          }
        </div>
      </div>
    </div>
  );
};

export default DetailLog;
