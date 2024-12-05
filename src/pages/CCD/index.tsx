import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete } from 'antd';
import {
  SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { GetQueryObj, guid } from '@/utils/utils';
import { getParams, updateParams } from '@/services/flowEditor';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DropSortableItem from '@/components/DragComponents/DropSortableItem';
import MoveItem from './MoveabledItem/MoveItem';
import Moveable from 'react-moveable';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasData, setLoading, setSelectedNode } from '@/redux/actions';
import { useCallback } from 'react';

interface Props { }

const CCDPage: React.FC<Props> = (props: any) => {
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const id = params?.['id'];
  const { canvasData, selectedNode } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  // 布局是否可编辑
  const ifCanEdit = useMemo(() => {
    return location.hash?.indexOf('edit') > -1;
  }, [location.hash]);
  const [dataList, setDataList] = useState<any>([]);
  // 初始化
  useEffect(() => {
    getParams(id).then((res: any) => {
      if (res && res.code === 'SUCCESS') {
        const box: any = document.querySelector('#moveableBox');
        const { flowData = {}, contentData = {}, selfStart = false } = res?.data || {};
        const {
          home = [],
          content = {},
          homeSetting = {
            'footer-1': { fontSize: 14 },
            'footer-2': { fontSize: 20 },
          },
          gridMargin,
        } = contentData;
        let scale = 1;
        if (location.hash?.indexOf('edit') < 0) {
          scale = window.screen.width / ((box?.clientWidth || 1120) - 802);//windowScale;
        };
        const contentList = (content || [])?.concat(home || [])
          ?.map((item: any) => {
            const { type, i, size, maxH, maxW, minH, minW, w, h, ...rest } = item;
            return {
              ...rest,
              name: `${type || i}_${guid()}`,
              type: type || i,
              ...(!!size
                // 组件窗口
                ? {
                  x: (size.x * window.screen.width) / 96,
                  y: size.y * 14,
                  width: (size.w * window.screen.width) / 96,
                  height: size.h * 14,
                }
                // 基础窗口
                :
                (!!w || !!h) ? {
                  ...homeSetting?.[i],
                  x: (item.x * window.screen.width) / 96,
                  y: item.y * 14,
                  width: (item.w * window.screen.width) / 96,
                  height: item.h * 14,
                }
                  : {}),
            };
          })
          ?.filter((i: any) => !!i.width);
        setDataList(contentList);
        dispatch(setCanvasData(res?.data || {}));
      } else {
        message.error(res?.msg || res?.message || '接口异常');
      };
    });
  }, [id]);
  // 保存布局
  const onSave = useCallback(() => {
    dispatch(setLoading(true));
    const param = {
      ...canvasData,
      contentData: {
        ..._.omit(_.omit(_.omit(canvasData?.contentData || {}, 'contentHeader'), 'homeSetting'), 'home'),
        content: dataList
      }
    };
    updateParams(canvasData?.id, param).then((res) => {
      if (!!res && res.code === 'SUCCESS') {
        message.success('保存成功');

        setTimeout(() => {
          let hash = '';
          if (location.href?.indexOf('?') > -1) {
            hash = location.href.split('?')[1];
          }
          location.href = `${location.href?.split('#/')?.[0]}#/ccd${!!hash ? `?${hash}` : ''}`;
          window.location.reload();
        }, 500);
      } else {
        message.error(res?.message || '接口异常');
      }
      dispatch(setLoading(false));
    });
  }, [dataList]);

  return (
    <div className={`flex-box-column ${styles.CCDPage}`}>
      {
        ifCanEdit ?
          <div className="flex-box">
            <Button
              icon={<SaveOutlined />}
              size='small'
              type="primary" onClick={onSave}>保存</Button>
          </div>
          : null
      }
      <MoveItem
        data={dataList}
        setDataList={setDataList}
      />
    </div>
  );
};

export default CCDPage;
