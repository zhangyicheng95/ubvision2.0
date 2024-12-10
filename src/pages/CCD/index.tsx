import React, { useEffect, useMemo, useRef, useState } from 'react';
import { message } from 'antd';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { GetQueryObj, getuid, guid } from '@/utils/utils';
import { getParamsService } from '@/services/flowEditor';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MoveItem from './layout/MoveItem';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasDataAction, setCanvasDataActionBaseAction, setLoadingAction } from '@/redux/actions';
import { useCallback } from 'react';
import CCDHeaderPage from './layout/header';
import CCDFooterPage from './layout/footer';

export const editLeftPanel = location.hash?.indexOf('edit') > -1 ? 400 : 0;

interface Props { }

const CCDPage: React.FC<Props> = (props: any) => {
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const id = params?.['id'];
  const number = params?.['number'];
  const { canvasData, canvasDataBase, selectedNode } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const moveRef = useRef<any>();
  // 布局是否可编辑
  const ifCanEdit = useMemo(() => {
    return location.hash?.indexOf('edit') > -1;
  }, [location.hash]);
  const [dataList, setDataList] = useState<any>([]);

  // init渲染
  const initParams = useCallback((data?: any) => {
    const { flowData = {}, contentData = {}, selfStart = false } = data || canvasDataBase || {};
    const {
      home = [],
      content = [],
      homeSetting = {
        'footer-1': { fontSize: 14 },
        'footer-2': { fontSize: 20 },
      },
      windowsScale,
      gridMargin,
    } = contentData;
    let scale = (windowsScale || 1) * (ifCanEdit ? ((moveRef?.current?.clientWidth - editLeftPanel) / window.screen.width) : 1);

    const contentList = (!!canvasData?.contentData?.content ? canvasData?.contentData?.content : content)
      ?.concat(home || [])
      ?.map((item: any) => {
        const { type, i, size, maxH, maxW, minH, minW, w, h, ...rest } = item;
        return {
          id: `${getuid()}$$${item.type}`,
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
              width: (w * window.screen.width) / 96,
              height: h * 14,
            }
              : {}),
        };
      })
      ?.map((item: any) => {
        let { x, y, width, height, name } = item;
        const baseItem: any = (canvasDataBase?.contentData?.content || [])?.filter((i: any) => i.name === name)?.[0];
        if (!!baseItem && !!baseItem.width) {
          x = baseItem.x;
          y = baseItem.y;
          width = baseItem.width;
          height = baseItem.height;
        };
        return {
          ...item,
          x: (x > 0 ? x : 0) * scale,
          y: (y > 0 ? y : 0) * scale,
          width: width * scale,
          height: height * scale,
        }
      })
      ?.filter((i: any) => !!i.width);

    setDataList(contentList);
  }, [canvasData, canvasDataBase]);
  // 获取方案详情
  const getParamFun = () => {
    dispatch(setLoadingAction(true));
    getParamsService(id).then((res: any) => {
      if (res && res.code === 'SUCCESS') {
        initParams(res?.data || {});
        dispatch(setCanvasDataAction(res?.data || {}));
        dispatch(setCanvasDataActionBaseAction(res?.data || {}));
      } else {
        message.error(res?.msg || res?.message || '接口异常');
      };
      dispatch(setLoadingAction(false));
    });
  };
  // 初始化
  useEffect(() => {
    window?.ipcRenderer?.invoke(`maximize-${number}`, number);
    setTimeout(() => {
      getParamFun();
    }, 100);
  }, [id]);

  return (
    <div className={`flex-box-column ${styles.CCDPage}`}>
      {
        // 头部
        useMemo(() => {
          return ifCanEdit ?
            <CCDHeaderPage dataList={dataList} />
            : null
        }, [dataList])
      }
      {
        // 布局每一个组件
        <div
          ref={moveRef}
          className='flex-box-start ccd-page-body-box'
          style={{ height: `calc(100% - ${ifCanEdit ? 64 : 32}px)` }}
        >
          <DndProvider backend={HTML5Backend}>
            <MoveItem
              data={dataList}
              setDataList={setDataList}
              initParams={initParams}
            />
          </DndProvider>
        </div>
      }
      {
        // 底部
        <CCDFooterPage dataList={dataList} />
      }
    </div>
  );
};

export default CCDPage;
