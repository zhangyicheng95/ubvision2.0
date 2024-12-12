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
import { IRootActions, setCanvasDataAction, setLoadingAction } from '@/redux/actions';
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
  const { canvasData, selectedNode } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();

  const moveRef = useRef<any>();
  // 布局是否可编辑
  const ifCanEdit = useMemo(() => {
    return location.hash?.indexOf('edit') > -1;
  }, [location.hash]);
  const [dataList, setDataList] = useState<any>([]);

  // init渲染
  const initParams = useCallback((data?: any) => {
    const { contentData } = data || canvasData || {};
    const {
      content = [],
      homeSetting = {
        'footer-1': { fontSize: 14 },
        'footer-2': { fontSize: 20 },
      },
      windowsScale,
    } = contentData;
    const realWidth = moveRef?.current?.clientWidth - editLeftPanel;
    const realHeight = realWidth / (window.screen.width / window.screen.height);
    const contentList = (content || [])
      ?.map((item: any) => {
        const { type, i, size, maxH, maxW, minH, minW, w, h, ...rest } = item;
        return {
          id: `${getuid()}$$${item.type}`,
          name: `${type || i}_${guid()}`,
          type: type || i,
          ...rest,
          ...(!!size
            // 组件窗口
            ? {
              x: (size.x * realWidth) / 96,
              y: size.y * 14,
              width: (size.w * realWidth) / 96,
              height: size.h * 14,
            }
            // 基础窗口
            :
            (!_.isUndefined(w) || !_.isUndefined(h)) ? {
              ...homeSetting?.[i],
              x: (item.x * realWidth) / 96,
              y: item.y * 14,
              width: (w * realWidth) / 96,
              height: h * 14,
            }
              : {}),
        };
      })
      ?.filter((i: any) => !!i.width)
      ?.map((item: any) => {
        let { x = 0, y = 0, width = 0, height = 0, name } = item;
        if (x < 0) {
          x = 0;
        };
        if (y < 0) {
          y = 0;
        };
        if (width > 1) {
          x = x / realWidth;
          y = y / realHeight;
          width = width / realWidth;
          height = height / realHeight;
        };
        return {
          ...item,
          x: x * realWidth,
          y: y * realHeight,
          width: width * realWidth,
          height: height * realHeight
        }
      });
    // console.log(contentList);

    setDataList(contentList);
  }, [canvasData]);
  // 获取方案详情
  const getParamFun = () => {
    dispatch(setLoadingAction(true));
    getParamsService(id).then((res: any) => {
      if (res && res.code === 'SUCCESS') {
        dispatch(setCanvasDataAction({
          ...res?.data || {},
          contentData: {
            ..._.omit(res?.data?.contentData || {}, 'home'),
            content: (res?.data?.contentData?.content || [])?.concat(res?.data?.contentData?.home || [])
          }
        }));
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
    }, 500);
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
          style={ifCanEdit ? { height: 'calc(100% - 32px)' } : {}}
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
        !!canvasData?.contentData?.showFooter ?
          // 底部
          <CCDFooterPage dataList={dataList} />
          : null
      }
    </div>
  );
};

export default CCDPage;
