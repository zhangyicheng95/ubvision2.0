import React, { Fragment, memo, useCallback, useMemo, useState } from 'react';
import { ApartmentOutlined, ApiOutlined, ClusterOutlined, FileZipOutlined } from '@ant-design/icons';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';
import { Collapse, Input, Menu, Modal, Popover } from 'antd';
import pluginIcon from '@/assets/imgs/icon-plugin.svg';
import TooltipDiv from '@/components/TooltipDiv';
import { useReactFlow } from '@xyflow/react';

interface Props { }

const { confirm } = Modal;

const PluginPanel: React.FC<Props> = (props: any) => {
  const { canvasPlugins } = useSelector((state: IRootActions) => state);
  const reactFlow = useReactFlow();
  const [pluginType, setPluginType] = useState('plugin');
  const [ifBuildIn, setIfBuildIn] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [nodes, setNodes] = useState<any>([]);
  // 开始拖拽
  const onDragStart = (event: any, data: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };
  // 插件列表
  const items: any = useMemo(() => {
    return (Object.entries(canvasPlugins) || [])
      ?.reduce((pre: any, res: any, index: number) => {
        const title = res[0];
        const showList = res[1]?.filter((i: any) => i?.data?.buildIn === ifBuildIn);

        if (!showList?.length) {
          return pre;
        };
        return pre.concat({
          key: '' + pre?.length,
          label: title,
          children: (showList || [])
            ?.reduce((pre: any, panel: any) => {
              const { data = {} } = panel;
              const {
                ifShow = false,
                alias = '',
                name = '',
                category = '',
                description,
                buildIn
              } = data;
              if (alias?.indexOf(searchVal) > -1 || name?.indexOf(searchVal) > -1) {
                return pre.concat({
                  key: `${pre?.length}-${name}`,
                  label: <Popover
                    placement='right'
                    content={
                      <div>
                        {`${alias}（${name}）`}
                        <br />
                        {description}
                      </div>
                    }
                    key={`${category}_${index}`}
                  >
                    <div
                      className="item flex-box"
                      style={(index + 1) === showList.length ? { marginBottom: 0 } : {}}
                      onDragStart={(event) => onDragStart(event, data)}
                      draggable
                      onMouseDown={(e: any) => {

                      }}
                    >
                      <div className="img-box flex-box-center">
                        <img
                          src={pluginIcon}
                          alt="icon"
                          className="img"
                        />
                      </div>
                      <TooltipDiv className="text-content">
                        {alias || name}
                      </TooltipDiv>
                    </div>
                  </Popover>
                });
              } else {
                return pre;
              }
            }, []),
        });
      }, [])
      ?.filter(Boolean);
  }, [canvasPlugins, ifBuildIn, searchVal]);
  // 画布中所有的节点
  const countNodes = useCallback(() => {
    const result = (reactFlow.getNodes() || [])?.filter((i: any) => i?.type === 'custom')?.reduce((pre: any, cen: any, index: number) => {
      if (!cen?.data?.alias && !cen?.data?.name) {
        return pre;
      }
      return pre.concat([
        {
          key: '' + index,
          label: cen?.data?.alias || cen?.data?.name,
          data: cen,
        },
        { type: 'divider' }
      ])
    }, []);
    setNodes(result);
  }, [reactFlow]);

  return (
    <div className={`flex-box ${styles.pluginPanel}`}>
      <div className="plugin-panel-left">
        {
          [
            { label: '插件', key: 'plugin', icon: <ApiOutlined className='plugin-panel-left-item-icon' /> },
            { label: '通信', key: 'communication', icon: <ClusterOutlined className='plugin-panel-left-item-icon' /> },
            { label: '节点', key: 'node', icon: <ApartmentOutlined className='plugin-panel-left-item-icon' /> },
            { label: '资源', key: 'resources', icon: <FileZipOutlined className='plugin-panel-left-item-icon' /> },
            // { label: '案例', key: 'case' }
          ]?.map((item: any, index: number) => {
            const { key, label, icon } = item;
            return <div
              className={`plugin-panel-left-item ${pluginType === key ? 'primaryBackgroundColor' : ''}`}
              key={`plugin-panel-left-item-${key}`}
              onClick={() => {
                setPluginType(key);
                if (key === 'node') {
                  countNodes();
                };
                // reactFlow?.fitView?.({ duration: 500 });
              }}
            >
              {icon}
              {label}
            </div>
          })
        }
      </div>
      <div className="flex-box-column plugin-panel-right">
        <div className="flex-box plugin-panel-right-type">
          <div className={`plugin-panel-right-type-item ${ifBuildIn ? 'nameStyle' : ''}`} onClick={() => { setIfBuildIn(true) }}>内置</div>
          <div className={`plugin-panel-right-type-item ${ifBuildIn ? '' : 'nameStyle'}`} onClick={() => { setIfBuildIn(false) }}>自定义</div>
        </div>
        <div className="plugin-panel-right-search">
          <Input.Search onSearch={(val) => {
            setSearchVal(val);
          }} />
        </div>
        <div className="plugin-panel-right-body">
          {
            pluginType === 'plugin' ?
              <Menu
                defaultOpenKeys={Array.from({ length: 30 })?.map?.(
                  (i, index) => '' + index
                )}
                mode="inline"
                items={items}
                selectable={false}
              />
              :
              pluginType === 'node' ?
                <Fragment>
                  <Menu
                    mode="inline"
                    items={nodes}
                    selectable={false}
                    onClick={(info: any) => {
                      const { position, measured } = info?.item?.props?.data || {};
                      reactFlow?.setCenter?.(position.x + measured.width / 2, position.y + measured.height / 2, { duration: 500, zoom: 2 });
                    }}
                  />
                </Fragment>
                :
                pluginType === 'communication' ?
                  <Fragment>

                  </Fragment>
                  :
                  pluginType === 'resources' ?
                    <Fragment>

                    </Fragment>
                    :
                    null
          }
        </div>
      </div>
    </div>
  );
};

export default memo(PluginPanel);