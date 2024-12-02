import React, { memo, useEffect, useMemo, useState } from 'react';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';
import { Form, Modal, Splitter, Image } from 'antd';
import { errorColor } from '../../common/constants';
import { isImgFun } from '@/common/globalConstants';
import TooltipDiv from '@/components/TooltipDiv';
import Editor from '@/components/MonacoEditor/editor';
import { copyUrlToClipBoard, formatJson } from '@/utils/utils';
import moment from 'moment';

const { confirm } = Modal;
interface Props { }

const ShowDataPanel: React.FC<Props> = (props: any) => {
  const {
    graphData, canvasData, selectedNode, errorList, flowRunningData, flowRunningDataHistory
  } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [dataViewType, setDataViewType] = useState('output');
  const [showItem, setShowItem] = useState<any>({
    language: 'json',
    value: { "name": "zyc" }
  });

  // 监听errorList
  useEffect(() => {
    (errorList || [])?.forEach((error: any) => {
      const { level, uid } = error;
      if (errorColor.includes(_.toUpper(level)) && !!uid) {
        const node = graphData.getCellById(uid);
        node.updateData({ status: level })
      }
    })
  }, [graphData, errorList]);
  // 当前监听的节点
  const inputNodes = useMemo(() => {
    if (!graphData || !selectedNode) return null;
    const nodeId = selectedNode?.split('$%$')?.[1];
    if (!nodeId) return;
    // 选中的节点实例
    const node = graphData.getCellById(nodeId);
    const inputs = (graphData.getIncomingEdges(node) || [])?.map((line: any) => line?.store?.data?.source?.cell);
    return _.uniq(inputs);
  }, [graphData, selectedNode]);
  // 当前监听的节点ID
  const nodeId = useMemo(() => {
    setShowItem(null);
    return selectedNode?.split('$%$')?.[1];
  }, [selectedNode]);

  return (
    <div className={styles.showDataPanel}>
      <div className="config-panel-right">
        <Splitter layout="vertical">
          <Splitter.Panel>
            <div className="config-panel-right-title boxShadow">
              {`数据查看器`}
            </div>
            <div className="flex-box-column config-panel-right-body">
              {
                useMemo(() => {
                  return (_.isString(showItem) && isImgFun(showItem)) ?
                    <Image src={showItem} />
                    :
                    (_.hasIn(showItem, 'value') && !!showItem?.value) ?
                      <Editor
                        editorValue={formatJson(showItem?.value)}
                        editorLanguage={showItem?.language || 'json'}
                        readonly
                      />
                      : null
                }, [showItem])
              }
            </div>
          </Splitter.Panel>
          <Splitter.Panel defaultSize="20%" min="5%" max="50%">
            <div className="flex-box config-panel-right-footer-toolbar">
              {
                buttonList?.map((item: any) => {
                  const { key, title, icon, hover } = item;
                  return <div
                    className={`flex-box config-panel-right-footer-toolbar-item ${dataViewType === key ? 'primaryBackgroundColor' : ''}`}
                    key={`config-panel-right-footer-toolbar-item-${key}`}
                    onClick={() => setDataViewType(key)}
                  >
                    <span className="item-title">{title}</span>
                  </div>
                })
              }
            </div>
            {
              useMemo(() => {
                return <div className="config-panel-right-footer-body">
                  {
                    dataViewType === 'input' ?
                      !!inputNodes?.length ?
                        (inputNodes || [])?.map((id: any, index: number) => {
                          const incommingNode: any = canvasData?.flowData?.nodes?.filter((i: any) => i.id === id)?.[0] || {};
                          return _.isObject(flowRunningData[id]) ?
                            <div
                              className="config-panel-right-footer-body-history-item"
                              key={`config-panel-right-footer-body-history-item-${id}-${index}`}
                            >
                              <div className="config-panel-right-footer-body-history-item-title">
                                {incommingNode.alias || incommingNode.name}
                              </div>
                              <div className="config-panel-right-footer-body-history-item-body">
                                {
                                  <ResultItem
                                    data={flowRunningData[id] || {}}
                                    setShowItem={setShowItem}
                                  />
                                }
                              </div>
                            </div>
                            : null
                        })
                        : <div className='flex-box-center' style={{ height: '100%' }}>该节点无输入数据</div>
                      :
                      dataViewType === 'output' ?
                        <ResultItem
                          data={flowRunningData?.[nodeId] || {}}
                          setShowItem={setShowItem}
                        />
                        :
                        dataViewType === 'history' ?
                          (Object.entries(flowRunningDataHistory) || [])?.map((i: any, index: number) => {
                            if (Object.keys(i[1])?.includes(nodeId)) {
                              return <div
                                className="config-panel-right-footer-body-history-item"
                                key={`config-panel-right-footer-body-history-item-${i[0]}`}
                              >
                                <div className="config-panel-right-footer-body-history-item-title">
                                  {moment(new Date(Number(i[0]))).format('YYYY-MM-DD HH:mm:ss.SSS')}
                                </div>
                                {
                                  _.isObject(i[1][nodeId]) ?
                                    <div className="config-panel-right-footer-body-history-item-body">
                                      {
                                        <ResultItem
                                          data={i[1][nodeId] || {}}
                                          setShowItem={setShowItem}
                                        />
                                      }
                                    </div>
                                    : null
                                }
                              </div>
                            } else {
                              return null;
                            }
                          })
                          : null
                  }
                </div>
              }, [canvasData, dataViewType, selectedNode, flowRunningData, flowRunningDataHistory])
            }
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
};

export default memo(ShowDataPanel);

const buttonList = [
  {
    title: '输入数据',
    key: 'input',
  },
  {
    title: '输出结果',
    key: 'output',
  },
  {
    title: '历史结果',
    key: 'history',
  },
  {
    title: '帮助',
    key: 'help',
  }
];

const formatStatusName = (name: string) => {
  switch (name) {
    case 'uid':
      return '节点ID';
    case 'status':
      return '节点状态';
    case '__cost_time__':
      return '耗时(ms)';
    case '__update_time__':
      return '更新时间';
    case 'customId':
      return '节点ID';
    // case 'url':
    //   return '图片链接';
    // case 'filepath':
    //   return '图片路径';
    default:
      return name;
  }
};

const ResultItem: any = (props: any) => {
  const { data, setShowItem } = props;

  return (Object.entries(data || {}) || [])?.map((res: any) => {
    return <div
      className="flex-box config-panel-right-footer-body-item"
      key={`config-panel-right-footer-body-item-${res[0]}`}
    >
      <div className='config-panel-right-footer-body-item-title'>- {formatStatusName(res[0])}: </div>
      {
        (_.isString(res[1]) && isImgFun(res[1])) ?
          <TooltipDiv
            onClick={() => {
              setShowItem(res[1]);
            }}
            onContextMenu={() => {
              copyUrlToClipBoard(res[1]);
            }}
          >查看图片</TooltipDiv>
          :
          (_.isObject(res[1]) && _.hasIn(res[1], 'value')) ?
            <TooltipDiv
              onClick={() => {
                setShowItem(res[1]);
              }}
            >查看数据</TooltipDiv>
            :
            <TooltipDiv>
              {
                _.isString(res[1]) ? res[1] : JSON.stringify(res[1])
              }
            </TooltipDiv>
      }
    </div>
  })
}