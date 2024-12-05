import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Moveable from 'react-moveable';
import { getuid, guid } from '@/utils/utils';
import * as _ from 'lodash';
import TooltipDiv from '@/components/TooltipDiv';
import { Button, message, Modal, Form, Dropdown, Menu, Badge, Image } from 'antd';
import {
  SaveOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setSelectedNode } from '@/redux/actions';
import ChartPreviewModal from '../components/ChartPreviewModal';
import LogPreviewModal from '../components/LogPreviewModal';
import dataItemImageNG from '@/assets/images/item-bg-ng.png';

interface Props {
  data?: [];
  setDataList?: any;
}

const MoveItem: React.FC<Props> = (props: any) => {
  const {
    data, setDataList
  } = props;
  const { canvasData, selectedNode } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  // 布局是否可编辑
  const ifCanEdit = useMemo(() => {
    return location.hash?.indexOf('edit') > -1;
  }, [location.hash]);
  const [form] = Form.useForm();
  const boxRef = useRef<any>();
  const itemRef = useRef<any>();
  const [snapContainer, setSnapContainer] = useState<any>(null);
  const [myChartVisible, setMyChartVisible] = useState<any>(null);
  const [logDataVisible, setLogDataVisible] = useState('');
  const [boxSize, setBoxSize] = useState({
    top: 0,
    left: 0,
    right: 1920,
    bottom: 1080,
  });
  // 屏幕变化
  const windowResize = () => {
    const box: any = boxRef.current;
    const height = (box?.clientWidth - 2) * window.screen.height / window.screen.width;
    setBoxSize((prev: any) => {
      return {
        ...prev,
        right: box?.clientWidth - 2,
        bottom: height <= box?.clientHeight ? height : box?.clientHeight,
      };
    });
  };
  // 初始化
  useEffect(() => {
    windowResize();
    window.addEventListener('resize', windowResize);
    setSnapContainer(document.querySelector('.ccd-main-box'));

    return () => {
      window.removeEventListener('resize', windowResize);
    }
  }, []);
  // 磁吸效果辅助线的dom列表
  const elementGuidelines = useMemo(() => {
    return (data || [])?.map((item: any) => `.${item.name}`);
  }, [data]);
  // 点击编辑每一个组件
  const handelClick = (name: string, e: any) => {
    if (ifCanEdit) {
      dispatch(setSelectedNode(name));
    };
    e.preventDefault();
    e.stopPropagation();
  };
  // 拖拽
  function handleDragEnd(e: any) {
    let { width, height, left, top, transform } = e?.target?.style;
    const className = e?.target?.className?.split(` `)?.[1];
    width = Number(width.split('px')?.[0]);
    height = Number(height.split('px')?.[0]);
    left = Number(left.split('px')?.[0]);
    top = Number(top.split('px')?.[0]);
    if (!!transform) {
      const transforms = transform.split('translate(')?.[1]?.split(')')?.[0]?.split(',');
      left += Number(transforms?.[0]?.split('px')?.[0]);
      top += Number(transforms?.[1]?.split('px')?.[0]);
    };
    setDataList?.((prev: any) => prev?.map((item: any) => {
      if (item.name === className) {
        return {
          ...item,
          x: left,
          y: top,
          width, height
        }
      }
      return item;
    }));
  };
  // 缩放
  function handleResizeEnd(e: any) {
    const className = e?.target?.className?.split(` `)?.[1];
    let { width, height } = e?.target?.style;
    width = Number(width?.split('px')?.[0] || 0);
    height = Number(height?.split('px')?.[0] || 0);
    setDataList?.((prev: any) => prev?.map((item: any) => {
      if (item.name === className) {
        return {
          ...item,
          width, height
        }
      }
      return item;
    }));
  };
  // 旋转
  function handleRotateEnd(e: any) {
    const className = e?.target?.className?.split(` `)?.[1];
    const { transform } = e?.target?.style;
    const rotate = transform.split('rotate(')?.[1]?.split('deg)')?.[0];

    setDataList?.((prev: any) => prev?.map((item: any) => {
      if (item.name === className) {
        return {
          ...item,
          rotate
        }
      }
      return item;
    }));
  };

  return (
    <div
      className="ccd-main-box"
      ref={boxRef}
      style={{ height: '100%', width: '100%' }}
      onClick={(e) => {
        dispatch(setSelectedNode(''));
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {(data || [])?.map((item: any, index: number) => {
        const { name, x, y, width, height, rotate = 0, type } = item;
        const target = `.${name}`;
        if (width === 0 || height === 0) {
          return null;
        }
        return <Fragment key={index}>
          <div
            className={`move-item ${name}`}
            style={{
              height,
              width,
              transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`
            }}
            onClick={(e) => handelClick(name, e)}
          >
            {name}
          </div>
          <Moveable
            target={target} // 拖拽目标

            // 拖动
            draggable={selectedNode === name} // 元素可拖动
            padding={{ left: 0, top: 0, right: 0, bottom: 0 }} // padding距离
            zoom={selectedNode === name ? 1 : 0} // 缩放包裹的moveable
            origin={false} // 显示中心点
            boundingBox={true} // 元素将被限制在其父容器内移动
            throttleDrag={0} // 拖拽阈值 达到这个值才执行拖拽
            onDragEnd={handleDragEnd}

            // 磁吸功能
            snappable={true} // 是否初始化磁吸功能
            snapContainer={snapContainer} // 磁吸功能的容器
            bounds={boxSize} // 边界点

            // 缩放
            resizable={selectedNode === name} // 是否可以缩放
            throttleResize={0} //  缩放阈值
            renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']} // 变化的点
            onResizeEnd={handleResizeEnd}

            // 旋转
            rotatable={selectedNode === name} // 旋转
            throttleRotate={0} // 旋转阈值
            rotationPosition={"top"}  // 旋转方向
            onRotateEnd={handleRotateEnd} // 旋转完成

            // 辅助线
            snapGap={true} // 开启辅助线
            elementGuidelines={elementGuidelines}
            snapDirections={{
              "top": true, "right": true, "bottom": true, "left": true, "center": true, "middle": true
            }} // 辅助线方向
            elementSnapDirections={{
              "top": true, "right": true, "bottom": true, "left": true, "center": true, "middle": true
            }} // 元素捕捉方向
            snapThreshold={10} // 辅助线阈值 ,即元素与辅助线间距小于x,则自动贴边
            isDisplaySnapDigit={true} // 是否展示与磁吸辅助线的距离
            snapDigit={0} //捕捉距离数字

            // 每一个图形变换的更新动作
            onRender={(e) => {
              itemRef.current = e;
              e.target.style.cssText += e.cssText;
            }}
          />
        </Fragment>
      })}
      {
        // 图表放大预览
        _.isObject(myChartVisible) && !_.isEmpty(myChartVisible) ? (
          <ChartPreviewModal option={myChartVisible} onCancel={() => setMyChartVisible(null)} />
        ) : null
      }
      {
        // 日志放大预览
        !!logDataVisible ? (
          <LogPreviewModal type={logDataVisible} onCancel={() => setLogDataVisible('')} />
        ) : null
      }
    </div>
  );
};

const InitItem = (props: any) => {
  const { canvasData } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const {
    data,
    item,
    setMyChartVisible,
    setLogDataVisible,
    snapshot,
    bodyBoxTab,
    formCustom,
    configForm,
    addWindow,
    removeWindow,
    loading, setLoading,
    startProjects,
    endProjects,
    projectStatus,
    started,
  } = props;
  const ifCanEdit = useMemo(() => {
    return location.hash?.indexOf('edit') > -1;
  }, [location.hash]);
  const newGridContentList = !!localStorage.getItem(`localGridContentList-${canvasData.id}`)
    ? JSON.parse(localStorage.getItem(`localGridContentList-${canvasData.id}`) || '{}')
    : [];
  const {
    id: key,
    size,
    value: __value = [],
    type,
    yName,
    xName,
    defaultImg,
    fontSize,
    reverse,
    direction,
    symbol,
    fetchType,
    ifFetch,
    fetchParams,
    align,
    hiddenAxis,
    labelInxAxis,
    labelDirection,
    barRadius,
    showBackground,
    showWithLine,
    backgroundColor = 'default',
    barColor = 'default',
    progressType = 'line',
    progressSize = 8,
    progressSteps = 5,
    des_bordered,
    des_column,
    des_layout,
    des_size,
    ifLocalStorage,
    CCDName,
    imgs_width,
    imgs_height,
    tableSize,
    magnifier,
    comparison,
    operationList,
    dataZoom,
    fontColor,
    interlacing,
    modelRotate,
    modelScale,
    modelRotateScreenshot,
    password,
    passwordHelp,
    ifShowHeader,
    ifShowColorList,
    headerBackgroundColor,
    basicInfoData = [{ id: guid(), name: '', value: '' }],
    ifNeedClear,
    ifUpdateProject,
    ifUpdatetoInitParams,
    magnifierSize,
    listType,
    valueColor,
    blockType,
    blockTypeLines,
    modelUpload,
    xColumns,
    yColumns,
    platFormOptions,
    ifFetchParams,
    ifNeedAllow,
    lineNumber,
    columnNumber,
    magnifierWidth,
    magnifierHeight,
    ifPopconfirm,
    showImgList,
    notLocalStorage,
    imgListNum,
    showFooter,
    markNumberLeft,
    markNumberTop,
    line_height,
    staticHeight,
    fileTypes,
    fileFetch,
    titlePaddingSize = 0,
    bodyPaddingSize = 0,
    showLabel,
    titleBackgroundColor,
    titleFontSize = 20,
    valueOnTop = false,
    timeSelectDefault,
    iconSize,
    parentBodyBox,
    parentBodyBoxTab,
  } = item;
  const gridValue = []?.filter((i: any) => i?.id === key)?.[0];
  const newGridValue = newGridContentList?.filter((i: any) => i?.id === key)?.[0];
  // socket有数据就渲染新的，没有就渲染localStorage缓存的
  const dataValue: any = gridValue?.[__value[1]] || newGridValue?.[__value[1]] || undefined;
  const parent = canvasData?.flowData?.nodes?.filter((i: any) => i.id === __value[0]);
  const { alias, name, ports } = parent?.[0] || {};
  const { items = [] } = ports || {};
  const SecLabel: any = items?.filter(
    (i: any) => i.group === 'bottom' && i?.label?.name === __value[1],
  )[0];

  return (
    <div
      key={key}
      className={`log-content drag-item-content-box background-ubv`}
      // @ts-ignore
      style={Object.assign(
        {},
        ['imgButton', 'heatMap'].includes(type)
          ? { backgroundColor: 'transparent' }
          : ['default'].includes(backgroundColor)
            ? {}
            : backgroundColor === 'border'
              ? { paddingTop: (titleFontSize / 4) * 3, backgroundColor: 'transparent' }
              : backgroundColor === 'transparent'
                ? { backgroundColor: 'transparent' }
                : backgroundColor === 'black'
                  ? { backgroundColor: 'black' }
                  : {
                    backgroundImage: `url(${type === 'img' && (dataValue?.status == 'NG' || dataValue?.status?.value == 'NG')
                      ? dataItemImageNG
                      : backgroundColor
                      })`,
                    backgroundColor: 'transparent',
                  },
        !!parentBodyBox && parentBodyBoxTab != bodyBoxTab ? { visibility: 'hidden' } : {},
      )}
    >
      {!['default', 'transparent'].includes(backgroundColor) ? (
        <div
          className={`flex-box data-screen-card-title-box ${['border'].includes(backgroundColor) ? 'data-screen-card-title-box-border' : ''
            }`}
          style={Object.assign(
            {},
            { fontSize: titleFontSize, padding: titlePaddingSize },
            ['border'].includes(backgroundColor)
              ? { padding: 0 }
              : { backgroundImage: `url(${titleBackgroundColor})` },
          )}
        >
          {['border'].includes(backgroundColor) ? (
            <div
              className="data-screen-card-title-box-border-bg"
              style={{ top: (titleFontSize / 4) * 3 }}
            />
          ) : null}
          <div className="data-screen-card-title">{CCDName}</div>
        </div>
      ) : null}
      {ifShowHeader ? (
        <div className="common-card-title-box flex-box">
          <TooltipDiv className="flex-box common-card-title">
            {`${CCDName || alias || name || '无效的节点'}`}
            <span className="title-span">{`- ${SecLabel?.label?.alias || __value[1] || ''}`}</span>
          </TooltipDiv>
        </div>
      ) : null}
      <div
        className={`card-body-box ${backgroundColor === 'border' ? 'background-ubv' : ''}`}
        style={Object.assign(
          {},
          ifShowHeader
            ? { height: 'calc(100% - 28px)' }
            : !['default', 'transparent'].includes(backgroundColor)
              ? { height: `calc(100% - ${(titleFontSize / 2) * 3 + titlePaddingSize * 2}px)` }
              : { height: '100%' },
          backgroundColor === 'border'
            ? {
              border: '2px solid rgba(144,144,144,0.6)',
              borderRadius: 6,
              height: '100%',
              padding: `${titleFontSize / 2 + bodyPaddingSize
                }px ${bodyPaddingSize}px ${bodyPaddingSize}px`,
            }
            : { padding: bodyPaddingSize },
        )}
      >
        <div className="flex-box-center" style={{ height: '100%' }}>
          {!parent?.[0] &&
            type?.indexOf('button') < 0 &&
            ![
              'header',
              'slider-1',
              'slider-4',
              'footer-1',
              'footer-2',
              'bodyBox',
              'form',
              'switchBox',
              'segmentSwitch',
              'rangeDomain',
              'rectRange',
              'modelSwitch',
              'iframe',
              'timeSelect',
            ].includes(type) ? (
            '请重新绑定数据节点'
          ) : type === 'line' ? (
            <Image />
          )
            : <Image />
          }
        </div>
      </div>
    </div>
  );
};

export default MoveItem;
