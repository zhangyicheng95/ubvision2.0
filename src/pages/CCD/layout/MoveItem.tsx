import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Moveable from 'react-moveable';
import { getuid, guid } from '@/utils/utils';
import * as _ from 'lodash';
import TooltipDiv from '@/components/TooltipDiv';
import {
  Button, message, Modal, Form, Dropdown, Menu, Badge, Image, Input,
  Switch, Divider, InputNumber
} from 'antd';
import {
  SaveOutlined, SettingOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
  VerticalAlignTopOutlined, VerticalAlignBottomOutlined, CopyOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasDataAction, setSelectedNodeAction } from '@/redux/actions';
import ChartPreviewModal from '../components/ChartPreviewModal';
import LogPreviewModal from '../components/LogPreviewModal';
import dataItemImageNG from '@/assets/images/item-bg-ng.png';
import { editLeftPanel } from '../index';
import { windowTypeList } from './config';
import homeBg from '@/assets/images/home-bg.png';
import DropSortableItem from '@/components/DragComponents/DropSortableItem';
import DragSortableItem from '@/components/DragComponents/DragSortableItem';

interface Props {
  data?: [];
  setDataList?: any;
  initParams?: any;
}

const MoveItem: React.FC<Props> = (props: any) => {
  const {
    data, setDataList, initParams
  } = props;
  const { canvasData, selectedNode } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  // 布局是否可编辑
  const ifCanEdit = useMemo(() => {
    return location.hash?.indexOf('edit') > -1;
  }, [location.hash]);
  const [form] = Form.useForm();
  const timerRef = useRef<any>();
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
  // 屏幕分辨率宽高比例 width/height
  const [windowsScale, setWindowsScale] = useState(1);
  const [windowTypeFirst, setWindowTypeFirst] = useState('charts');
  const [windowTypeSecond, setWindowTypeSecond] = useState('all');
  const [searchVal, setSearchVal] = useState('');
  const [editItem, setEditItem] = useState<any>(null);

  // 屏幕变化
  const windowResize = () => {
    if (!!timerRef.current) {
      clearTimeout(timerRef.current);
    };
    timerRef.current = setTimeout(() => {
      !!data?.length ?
        initParams({
          ...canvasData,
          contentData: {
            ...canvasData?.contentData,
            content: data
          }
        })
        :
        initParams();
      // 拿到屏幕的分辨率宽高比
      const scale = window.screen.width / window.screen.height;
      const box: any = boxRef.current;
      const rect = boxRef.current.getBoundingClientRect();
      const height = box?.clientWidth / scale;
      setWindowsScale(scale);
      //渲染边界
      setBoxSize((prev: any) => {
        return {
          ...prev,
          left: rect.left,
          right: rect.right,
          bottom: height,
        };
      });
      // 编辑时，把窗口缩放保存
      if (ifCanEdit) {
        dispatch(setCanvasDataAction({
          ...canvasData,
          ...{
            contentData: {
              ...canvasData?.contentData,
              windowsScale: window.screen.width / (window.screen.width - editLeftPanel)
            }
          }
        }));
      };
    }, 100);
  };
  // 初始化
  useEffect(() => {
    if (canvasData.id) {
      windowResize();
      window.addEventListener('resize', windowResize);
      setSnapContainer(document.querySelector('.ccd-main-box'));
    }
    return () => {
      window?.removeEventListener?.('resize', windowResize);
    }
  }, [canvasData.id, data.length]);
  // 磁吸效果辅助线的dom列表
  const elementGuidelines = useMemo(() => {
    return (data || [])?.map((item: any) => `.${item.name}`);
  }, [data]);
  // 添加组件
  const handleAddItem = (item: any) => {
    const { type } = item;
    setDataList?.((prev: any) => prev?.concat({
      rotate: 0, value: [],
      zIndex: 0,
      ...item,
      id: `${getuid()}$$${type}`,
      name: `${type}_${guid()}`,
    }));
  };
  // 复制窗口
  const handleCopyItem = (item: any) => {
    handleAddItem({
      ...item,
      x: item.x + 20,
      y: item.y + 20,
      zIndex: (item.zIndex || 0) + 1
    });
  };
  // 删除窗口
  const handleDeleteItem = (id: string) => {
    Modal.confirm({
      title: "确认删除?",
      content: '删除后无法恢复',
      onOk() {
        if (!!editItem && editItem?.id === id) {
          setEditItem(null);
        };
        setDataList?.((prev: any) => prev?.filter((i: any) => i.id !== id));
      },
      onCancel() { },
    });
  };
  // 点击窗口
  const handelClick = (name: string, e: any) => {
    if (ifCanEdit) {
      dispatch(setSelectedNodeAction(name));
    };
    e.preventDefault();
    e.stopPropagation();
  };
  // 拖拽
  function handleDragEnd(e: any) {
    let { width, height, left, top, transform } = e?.target?.style;
    const className = e?.target?.className?.split(` `)?.filter((i: any) => i?.indexOf('_') > -1)?.[0];
    width = Number(width.split('px')?.[0]);
    height = Number(height.split('px')?.[0]);
    left = Number(left.split('px')?.[0]);
    top = Number(top.split('px')?.[0]);
    if (!!transform) {
      const transforms = transform.split('translate(')?.[1]?.split(')')?.[0]?.split(',');
      left += Number(transforms?.[0]?.split('px')?.[0]);
      top += Number(transforms?.[1]?.split('px')?.[0]);
    };
    const result = (data || [])?.map((item: any) => {
      if (item.name === className) {
        return {
          ...item,
          x: left,
          y: top,
          width, height
        }
      }
      return item;
    });
    setDataList?.(result);
  };
  // 缩放
  function handleResizeEnd(e: any) {
    const className = e?.target?.className?.split(` `)?.filter((i: any) => i?.indexOf('_') > -1)?.[0];
    let { width, height } = e?.target?.style;
    width = Number(width?.split('px')?.[0] || 0);
    height = Number(height?.split('px')?.[0] || 0);
    const result = (data || [])?.map((item: any) => {
      if (item.name === className) {
        return {
          ...item,
          width, height
        }
      }
      return item;
    });
    setDataList?.(result);
  };
  // 旋转
  function handleRotateEnd(e: any) {
    const className = e?.target?.className?.split(` `)?.filter((i: any) => i?.indexOf('_') > -1)?.[0];
    const { transform } = e?.target?.style;
    const rotate = transform.split('rotate(')?.[1]?.split('deg)')?.[0];
    const result = (data || [])?.map((item: any) => {
      if (item.name === className) {
        return {
          ...item,
          rotate
        }
      }
      return item;
    });
    setDataList?.(result);
  };
  // 每个item右键
  const settingList: any = (item: any) => {
    return [
      {
        key: `top`,
        label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
          setDataList?.((prev: any) => {
            let zIndex = 0;
            prev.forEach((i: any) => {
              if (i.zIndex > zIndex) {
                zIndex = i.zIndex;
              }
            });
            return prev?.map((i: any) => {
              if (item.name === i.name) {
                return {
                  ...i,
                  zIndex: Math.max(zIndex || 0, 0) + 1,
                }
              }
              return i;
            });
          });
        }}>
          <VerticalAlignTopOutlined className="contextMenu-icon" />
          置顶
          <span className="contextMenu-text">Top Up</span>
        </div>
      },
      {
        key: `bottom`,
        disabled: !item.zIndex || (item.zIndex === 0),
        label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
          setDataList?.((prev: any) => prev?.map((i: any) => {
            if (item.name === i.name) {
              return {
                ...i,
                zIndex: 0,
              }
            }
            return i;
          }));
        }}>
          <VerticalAlignBottomOutlined className="contextMenu-icon" />
          置底
          <span className="contextMenu-text">Bottom Up</span>
        </div>
      },
      {
        key: `upper`,
        label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
          setDataList?.((prev: any) => prev?.map((i: any) => {
            if (item.name === i.name) {
              return {
                ...i,
                zIndex: Math.max(i?.zIndex || 0, 0) + 1,
              }
            }
            return i;
          }));
        }}>
          <ArrowUpOutlined className="contextMenu-icon" />
          向上一层
          <span className="contextMenu-text">Layer Up</span>
        </div>
      },
      {
        key: `lower`,
        disabled: !item.zIndex || (item.zIndex === 0),
        label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
          setDataList?.((prev: any) => prev?.map((i: any) => {
            if (item.name === i.name) {
              return {
                ...i,
                zIndex: Math.max(i?.zIndex || 1, 1) - 1,
              }
            }
            return i;
          }));
        }}>
          <ArrowDownOutlined className="contextMenu-icon" />
          向下一层
          <span className="contextMenu-text">Layer down</span>
        </div>
      },
      { type: 'divider' },
      {
        key: `edit`,
        label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
          setEditItem(item);
          setTimeout(() => {
            form.setFieldsValue(item);
          }, 200);
        }}>
          <SettingOutlined className="contextMenu-icon" />
          编辑
          <span className="contextMenu-text">Layer Edit</span>
        </div>
      },
      {
        key: `copy`,
        label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
          handleCopyItem(item);
        }}>
          <CopyOutlined className="contextMenu-icon" />
          复制
          <span className="contextMenu-text">Layer Copy</span>
        </div>
      },
      {
        key: `delete`,
        label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
          handleDeleteItem(item?.id);
        }}>
          <DeleteOutlined className="contextMenu-icon" />
          删除
          <span className="contextMenu-text">Layer Delete</span>
        </div>
      },
    ];
  };
  // 保存窗口属性
  const onConfigSave = () => {
    return new Promise((resolve, reject) => {
      form.validateFields()
        .then((values) => {
          if (editItem.id) {
            // 编辑的窗口
            setDataList((prev: any) => {
              return prev?.map((i: any) => {
                if (i.id === editItem.id) {
                  return {
                    ...i,
                    ...values
                  };
                } else {
                  return i;
                };
              });
            });
            setEditItem(null);
          };
        })
        .catch((err) => {
          console.log(err);
          const { errorFields } = err;
          errorFields?.length && message.error(`${errorFields[0]?.errors[0]} 是必填项`);
          reject()
        });
    })
  };

  return (
    <div
      className="flex-box-start ccd-main-box"
    >
      {
        !!ifCanEdit ?
          <div className="flex-box-column ccd-main-box-plugin-panel" style={{
            width: editLeftPanel - (editLeftPanel > 0 ? 16 : 0),
            minWidth: editLeftPanel - (editLeftPanel > 0 ? 16 : 0),
            maxWidth: editLeftPanel - (editLeftPanel > 0 ? 16 : 0)
          }}>
            <div className="ccd-main-box-plugin-panel-search-box">
              <Input.Search onSearch={(val) => {
                setSearchVal(val);
              }} />
            </div>
            <div className="ccd-main-box-plugin-panel-body">
              <div className="flex-box ccd-main-box-plugin-panel-body">
                <div className="flex-box ccd-main-box-plugin-panel-body-type">
                  <div className="ccd-main-box-plugin-panel-body-type-first">
                    {
                      windowTypeList?.map((item: any) => {
                        const { label, value, icon, types, contents } = item;
                        return <div
                          className={`flex-box-column-center ccd-main-box-plugin-panel-body-type-first-item ${windowTypeFirst === value ? 'menu-selected-self' : ''}`}
                          key={value}
                          onClick={() => setWindowTypeFirst(value)}
                        >
                          {icon}
                          {label}
                        </div>
                      })
                    }
                  </div>
                  <div className="ccd-main-box-plugin-panel-body-type-second">
                    {
                      (windowTypeList?.filter((i: any) => i.value === windowTypeFirst)?.[0]?.types || [])
                        ?.map((item: any) => {
                          const { label, value, } = item;
                          return <div
                            className={`flex-box-column-center ccd-main-box-plugin-panel-body-type-second-item ${windowTypeSecond === value ? 'font-selected-self' : ''}`}
                            key={value}
                            onClick={() => setWindowTypeSecond(value)}
                          >
                            {label}
                          </div>
                        })
                    }
                  </div>
                </div>
                <div className="ccd-main-box-plugin-panel-body-content">
                  {
                    (windowTypeList?.filter((i: any) => i.value === windowTypeFirst)?.[0]?.contents || [])
                      ?.filter((i: any) => i.label?.indexOf(searchVal) > -1 && (windowTypeSecond === 'all' ? i : _.toUpper(i.value)?.indexOf(_.toUpper(windowTypeSecond)) > -1))
                      ?.map((item: any) => {
                        const { label, value, type, icon } = item;
                        return <div
                          className={`flex-box-column-start ccd-main-box-plugin-panel-body-content-item`}
                          key={`${type}-${value}`}
                        >
                          <DragSortableItem item={{ ...item, type: value, alias: label }} onDragStart={() => { }}>
                            <div className="ccd-main-box-plugin-panel-body-content-item-title">{label}</div>
                            <div className="ccd-main-box-plugin-panel-body-content-item-icon">
                              {icon ? <Image src={icon} /> : <img src={homeBg} />}
                            </div>
                          </DragSortableItem>
                        </div>
                      })
                  }
                </div>
              </div>
            </div>
          </div>
          : null
      }
      <div style={{
        height: '100%',
        width: `calc(100% - ${editLeftPanel - (editLeftPanel > 0 ? 16 : 0)}px)`,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <DropSortableItem
          onDragEnd={(props: any) => {
            const { source, clientOffset } = props;
            let { x = 0, y = 0 } = clientOffset || {};
            x -= editLeftPanel;
            y -= 62;
            handleAddItem({ alias: source.alias, type: source.type, x, y, width: 300, height: 150 })
          }}
        >
          <div className="ccd-main-box-canvas"
            ref={boxRef}
            style={{
              height: ((((boxRef?.current?.clientWidth || 1920) / windowsScale + 30) > window.screen.height) ? window.screen.height : (boxRef?.current?.clientWidth / windowsScale))
            }}
            onClick={(e) => {
              if (ifCanEdit) {
                dispatch(setSelectedNodeAction(''));
              };
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {(data || [])?.map((item: any, index: number) => {
              let { name, x, y, width, height, rotate = 0, zIndex = 0, type, id } = item;
              const target = `.${name}`;
              if (width === 0 || height === 0) {
                return null;
              }
              return <Fragment key={id}>
                <Dropdown
                  getPopupContainer={(triggerNode: any) => {
                    return triggerNode?.parentNode || document.body;
                  }}
                  menu={{ items: settingList(item) }}
                  trigger={['contextMenu']}
                >
                  <div
                    className={`move-item ${name}`}
                    style={{
                      height,
                      width,
                      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
                      zIndex
                    }}
                    onClick={(e) => handelClick(name, e)}
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {name}
                  </div>
                </Dropdown>
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
          </div>
        </DropSortableItem>
      </div>
      {
        !!editItem ?
          <div className="flex-box-column ccd-main-box-config-panel">
            <div className="ccd-main-box-config-panel-title">
              窗口属性编辑 - {editItem?.alias || editItem?.name}
            </div>
            <div className="ccd-main-box-config-panel-body">
              <Form form={form} layout="vertical" scrollToFirstError>
                <Divider>窗口属性</Divider>
                <Form.Item
                  name={`x`}
                  label="横坐标"
                  rules={[{ required: true, message: '横坐标' }]}
                >
                  <InputNumber min={0} />
                </Form.Item>
                <Form.Item
                  name={`y`}
                  label="纵坐标"
                  rules={[{ required: true, message: '纵坐标' }]}
                >
                  <InputNumber min={0} />
                </Form.Item>
                <Form.Item
                  name={`width`}
                  label="窗口宽度"
                  rules={[{ required: true, message: '窗口宽度' }]}
                >
                  <InputNumber min={10} />
                </Form.Item>
                <Form.Item
                  name={`height`}
                  label="窗口高度"
                  rules={[{ required: true, message: '窗口高度' }]}
                >
                  <InputNumber min={10} />
                </Form.Item>
                <Form.Item
                  name={`rotate`}
                  label="旋转角度"
                  rules={[{ required: true, message: '旋转角度' }]}
                >
                  <InputNumber />
                </Form.Item>
                <Divider>通用设置</Divider>
                <Form.Item
                  name={`alias`}
                  label="窗口名称"
                  rules={[{ required: true, message: '窗口名称' }]}
                >
                  <Input placeholder="请输入窗口名称" />
                </Form.Item>

                <Divider>私有设置</Divider>
                {/* <Form.Item
                  name={`pushData`}
                  label="数据推送"
                  valuePropName="checked"
                  rules={[{ required: false, message: '数据推送' }]}
                >
                  <Switch />
                </Form.Item> */}
              </Form>
            </div>
            <div className="flex-box ccd-main-box-config-panel-footer">
              <Button
                block
                onClick={() => {
                  setEditItem(null);
                }}
              >
                取消
              </Button>
              <Button
                type="primary" block
                onClick={() => {
                  onConfigSave()
                }}
              >保存</Button>
            </div>
          </div>
          : null
      }
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
    loading, setLoadingAction,
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
