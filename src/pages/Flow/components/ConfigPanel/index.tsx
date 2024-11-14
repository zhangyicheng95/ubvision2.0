import React, { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasData } from '@/redux/actions';
import { Button, Checkbox, Divider, Form, Input, InputNumber, message, Modal, Radio, Select, Splitter, Switch, Tabs, TabsProps, Upload } from 'antd';
import {
  CaretDownOutlined, CloudUploadOutlined, MinusCircleOutlined, PlusOutlined, ExclamationCircleOutlined,

} from '@ant-design/icons';
import TooltipDiv from '@/components/TooltipDiv';
import { chooseFile, chooseFolder, openFolder } from '@/api/native-path';
import moment from 'moment';
import IpInput from '@/components/IpInputGroup';
import SliderGroup from '@/components/SliderGroup';
import { formatJson, guid } from '@/utils/utils';
import Measurement from '@/components/Measurement';

const { confirm } = Modal;
interface Props { }

const ConfigPanel: React.FC<Props> = (props: any) => {
  const { graphData, selectedNode, canvasData, canvasStart } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { validateFields, getFieldsValue, setFieldsValue } = form;
  const [selectedTab, setSelectedTab] = useState('1');

  useEffect(() => {
    form?.resetFields?.();
    if (selectedNode?.indexOf('node_') > -1) {
      form.setFieldsValue({
        alias: nodeConfig?.alias,
        description: nodeConfig?.description
      });
    } else {
      form.setFieldsValue({ ...canvasData });
    }
  }, [canvasData.id, selectedNode]);
  // 选中的节点
  const nodeConfig = useMemo<any>(() => {
    const { nodes } = canvasData?.flowData || {};
    const selected = nodes?.filter((i: any) => selectedNode?.indexOf(i?.customId) > -1);
    return selected?.[0] || null;
  }, [JSON.stringify(canvasData?.flowData?.nodes), selectedNode])
  // 节点不同的配置信息
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '参数',
    },
    {
      key: '2',
      label: '输入',
    },
    {
      key: '3',
      label: '输出',
    },
    {
      key: '4',
      label: '基本信息'
    },
  ];
  // 节点保存
  const onSave = useCallback(() => {
    validateFields()
      .then((values) => {
        console.log(values);
        if (selectedNode?.indexOf('node_') > -1 && !!nodeConfig) {
          // 节点
          const {
            alias, description,
            // 高级设置相关
            start_delay_time, input_check, output_check, cost_record, show_update_time,
          } = values;
          const nodeId = selectedNode?.split('$%$')?.[1];
          const node = graphData.getCellById(nodeId);
          node.setData({ ...node?.getData?.(), alias, description, input_check, initParams_check: true });
          const result = {
            ...nodeConfig,
            alias, description,
            config: {
              ...nodeConfig?.config || {},
              generalConfig: Object.entries(nodeConfig?.config?.generalConfig || {})?.reduce((pre: any, cen: any) => {
                return {
                  ...pre,
                  [cen[0]]: {
                    ...cen[1],
                    value: values[cen[0]]
                  }
                }
              }, {}),
              initParams: Object.entries(nodeConfig?.config?.initParams || {})?.reduce((pre: any, cen: any) => {
                return {
                  ...pre,
                  [cen[0]]: {
                    ...cen[1],
                    value: values[cen[0]]
                  }
                }
              }, {}),
            }
          };
          const params = {
            ...canvasData || {},
            flowData: {
              ...canvasData?.flowData || {},
              nodes: (canvasData?.flowData?.nodes || [])
                ?.map((item: any) => {
                  if (selectedNode?.indexOf(item.customId) > -1) {
                    return {
                      ...result
                    };
                  } else {
                    return item;
                  }
                })
            }
          };
          console.log(params);
          dispatch(setCanvasData(params));
        } else {
          // 方案
          const result = {
            ...canvasData,
            ...values
          };
          dispatch(setCanvasData(result));
        }
      })
      .catch((err) => {
        console.log(err);
        const { errorFields } = err;
        errorFields?.length && message.error(`${errorFields[0]?.errors[0]} 是必填项`);
      });
  }, [graphData, canvasData, selectedNode]);

  return (
    <div className={`flex-box-column ${styles.configPanel}`}>
      <Splitter>
        <Splitter.Panel defaultSize="40%" min="20%" max="50%">
          <div className="config-panel-left">
            {
              useMemo(() => {
                console.log('config', nodeConfig);
                return <Fragment>
                  <TooltipDiv className="config-panel-left-title boxShadow">
                    {nodeConfig?.name || '方案通用配置'}
                  </TooltipDiv>
                  <div className="config-panel-left-body">
                    {
                      (selectedNode?.indexOf('node_') > -1 && !!nodeConfig) ?
                        // 选中节点
                        <Form form={form} layout="vertical" scrollToFirstError>
                          <Tabs items={items} onChange={(e) => { setSelectedTab(e) }} />
                          <div className="config-panel-left-body-panel">
                            <div style={selectedTab === '1' ? {} : { display: 'none' }}>
                              {
                                Object.entries(nodeConfig?.config?.initParams || {})?.map((res: any, index: number) => {
                                  return <FormatWidgetToDom
                                    key={res[0]}
                                    config={res}
                                    form={form}
                                    disabled={canvasStart || res[1]?.disabled}
                                  />
                                })
                              }
                              <Divider>高级设置</Divider>
                              {
                                Object.entries(nodeConfig?.config?.generalConfig || {})?.map((res: any, index: number) => {
                                  return <FormatWidgetToDom
                                    key={res[0]}
                                    config={res}
                                    form={form}
                                    disabled={canvasStart || res[1]?.disabled}
                                  />
                                })
                              }
                            </div>
                            <div style={selectedTab === '2' ? {} : { display: 'none' }}>
                              Content of Tab Pane 2
                            </div>
                            <div style={selectedTab === '3' ? {} : { display: 'none' }}>
                              Content of Tab Pane 3
                            </div>
                            <div style={selectedTab === '4' ? {} : { display: 'none' }}>
                              <div className='config-panel-left-body-info-box'>
                                <p><span>节点ID:</span> {nodeConfig?.customId}</p>
                                <p><span>版本号:</span> {nodeConfig?.version}</p>
                                <p><span>模块:</span> {nodeConfig?.config?.module}</p>
                              </div>
                              <Form.Item
                                name={`alias`}
                                label="节点别名:"
                                initialValue={nodeConfig?.alias}
                                rules={[{ required: false, message: '节点别名' }]}
                              >
                                <Input disabled={canvasStart} />
                              </Form.Item>
                              <Form.Item
                                name={`description`}
                                label="描述:"
                                initialValue={nodeConfig?.description}
                                rules={[{ required: false, message: '插件描述' }]}
                              >
                                <Input.TextArea
                                  autoSize={{ minRows: 3, maxRows: 6 }}
                                  maxLength={200}
                                  placeholder="请输入插件描述"
                                  disabled={canvasStart}
                                />
                              </Form.Item>
                            </div>
                          </div>
                        </Form>
                        :
                        // 通用设置
                        <Form form={form} layout="vertical" scrollToFirstError>
                          <div className="config-panel-left-body-panel">
                            <Form.Item
                              name={`name`}
                              label="方案名称:"
                              initialValue={canvasData?.name}
                              rules={[{ required: true, message: 'name' }]}
                            >
                              <Input
                                placeholder="请输入方案名称"
                                disabled={canvasStart}
                              />
                            </Form.Item>
                            <Form.Item
                              name={`description`}
                              label="方案描述:"
                              initialValue={canvasData?.description}
                              rules={[{ required: false, message: '方案描述' }]}
                            >
                              <Input.TextArea
                                autoSize={{ minRows: 1, maxRows: 6 }}
                                maxLength={200}
                                placeholder="请输入方案描述"
                                disabled={canvasStart}
                              />
                            </Form.Item>
                            <Form.Item
                              name={`plugin_dir`}
                              label="方案路径:"
                              tooltip="插件本地路径，不填无法获取插件"
                              initialValue={canvasData?.plugin_dir}
                              rules={[{ required: false, message: '方案路径' }]}
                            >
                              <code className="flex-box-justify-between">
                                {
                                  !!canvasData?.plugin_dir ?
                                    <Fragment>
                                      <TooltipDiv title={canvasData?.plugin_dir} onClick={() =>
                                        openFolder(`${canvasData?.plugin_dir}\\plugins`)
                                      }>
                                        {canvasData?.plugin_dir}
                                      </TooltipDiv>
                                      <a
                                        style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                                        onClick={() => {
                                          if (canvasStart) return;
                                          form.setFieldsValue({ plugin_dir: '' })
                                          dispatch(setCanvasData({
                                            ...canvasData,
                                            plugin_dir: ''
                                          }));
                                        }}
                                      >
                                        移除
                                      </a>
                                    </Fragment>
                                    : null
                                }
                                <Button
                                  icon={<CloudUploadOutlined />}
                                  disabled={canvasStart}
                                  onClick={() => {
                                    chooseFolder((res: any) => {
                                      const path = _.isArray(res) ? res[0] : res;
                                      form.setFieldsValue({ plugin_dir: path })
                                      dispatch(setCanvasData({
                                        ...canvasData,
                                        plugin_dir: path
                                      }));
                                    });
                                  }}
                                >
                                  选择文件
                                </Button>
                              </code>
                            </Form.Item>
                            <Form.Item
                              name={`pushData`}
                              label="数据推送:"
                              tooltip="节点数据推送的总开关"
                              initialValue={canvasData?.pushData}
                              valuePropName="checked"
                              rules={[{ required: false, message: '数据推送' }]}
                            >
                              <Switch />
                            </Form.Item>
                          </div>
                        </Form>
                    }
                  </div>
                  <div className="flex-box-center config-panel-left-footer">
                    <Button type="primary" disabled={canvasStart} onClick={onSave}>保存</Button>
                  </div>
                </Fragment>
              }, [graphData, canvasData, nodeConfig, selectedNode, canvasStart, selectedTab])
            }
          </div>
        </Splitter.Panel>
        <Splitter.Panel>

        </Splitter.Panel>
      </Splitter>
    </div >
  );
};

export default memo(ConfigPanel);

const FormatWidgetToDom = (props: any) => {
  const {
    config = [],
    form,
    setEditorVisible,
    disabled,
    widgetChange,
    selectedOption,
    setSelectedOption,
    setPlatFormVisible,
    setPlatFormValue,
    setEditorValue,
    setMultiInput,
  } = props;
  const {
    name: aliasDefault,
    alias = '默认输入框',
    require,
    type,
    value,
    optionPath,
    language = 'json',
    localPath,
    description,
    widget = {},
    default: defaultValue,
    parentName,
  } = config[1];
  let {
    max = 9999,
    min,
    options,
    precision,
    step,
    length,
    suffix,
    type: type1,
  } = widget;
  const name = config[0]; //`${config[0]}_$_${guid()}`;
  const [uploadValues, setUploadValues] = useState<any>({});

  useEffect(() => {
    if (['File', 'Dir', 'ImageLabelField'].includes(type1)) {
      setUploadValues({
        [name]: value
      })
    };
  }, [value]);
  switch (type1) {
    case 'Input':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Input
            placeholder={`请输入${alias}`}
            disabled={disabled}
            onBlur={(e) => {
              widgetChange(e.target.id, e.target.value?.trim(), parentName);
            }}
          />
        </Form.Item>
      );
    case 'DatePicker':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={moment(value || undefined)}
          rules={[{ required: require, message: `${alias}` }]}
        >
          {// @ts-ignore
            <DatePicker
              placeholder={`请输入${alias}`}
              disabled={disabled}
              onBlur={(e: any) => {
                widgetChange(
                  e.target.id,
                  new Date(e.target.value).getTime(),
                  parentName
                );
              }}
              showTime
              style={{ width: '100%' }}
            />
          }
        </Form.Item>
      );
    case 'IpInput':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <IpInput
            length={length}
            disabled={disabled}
          />
        </Form.Item>
      );
    case 'Radio':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={(_.isArray(value) ? value[0] : value) || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Radio.Group
            disabled={disabled}
          >
            {options?.map?.((option: any, index: any) => {
              if (_.isString(option)) {
                return (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                );
              } else {
                const { id, label, value } = option;
                return (
                  <Radio key={id || value} value={value}>
                    {label}
                  </Radio>
                );
              }
            })}
          </Radio.Group>
        </Form.Item>
      );
    case 'TagRadio':
      return (
        <>
          <Form.Item
            name={name}
            label={`${alias}:`}
            tooltip={description || aliasDefault}
            initialValue={(_.isArray(value) ? value[0] : value) || undefined}
            rules={[{ required: require, message: `${alias}` }]}
          >
            <Select
              disabled={disabled}
              options={(options || [])?.map?.((option: any) => {
                const { id, name } = option;
                return { key: id || name, value: name, label: name, propsKey: JSON.stringify(option) };
              })}
              onChange={(e: any, option: any) => {
                const { value, propsKey } = option;
                const { children = [] } = JSON.parse(propsKey);

              }}
            />
          </Form.Item>
        </>
      );
    case 'Select':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={(_.isArray(value) ? value[0] : value) || false}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Select
            placeholder={`${alias}`}
            disabled={disabled}
            options={(options || [])?.map?.((option: any) => {
              if (_.isString(option)) {
                return { key: option, label: option, value: option };
              } else {
                const { key, label, value } = option;
                return { key, label, value };
              }
            })}
            onChange={(e) => {
              widgetChange(name, e, parentName);
            }}
          />
        </Form.Item>
      );
    case 'MultiSelect':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Select
            placeholder={`请选择${alias}`}
            mode="tags"
            allowClear={false}
            showSearch={false}
            disabled={disabled}
            options={(options || [])?.map?.((option: any) => {
              if (_.isString(option)) {
                return { key: option, label: option, value: option };
              } else {
                const { key, label, value } = option;
                return { key, label, value };
              }
            })}
          />
        </Form.Item>
      );
    case 'Checkbox':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Checkbox.Group
            options={(options || [])?.map?.((option: any) => {
              if (_.isString(option)) {
                return { key: option, label: option, value: option };
              } else {
                const { key, label, value } = option;
                return { key, label, value };
              }
            })}
            disabled={disabled}
          />
        </Form.Item>
      );
    case 'InputNumber':
      return (
        <Fragment>
          <Form.Item
            name={name}
            label={`${alias}:`}
            tooltip={description || aliasDefault}
            initialValue={
              !_.isNull(value) && !_.isNaN(value) ? value : defaultValue
            }
            rules={[{ required: require, message: `${alias}` }]}
            style={{ marginBottom: 8 }}
          >
            <InputNumber
              placeholder={`请输入${alias}`}
              precision={precision}
              step={step}
              max={max}
              min={min}
              disabled={disabled}
            />
          </Form.Item>
          <div className="flex-box" style={{ marginBottom: 24 }}>
            <div style={{ marginRight: 16 }}>最大值:{max}</div>
            <div>最小值:{min}</div>
          </div>
        </Fragment>
      );
    case 'Slider':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={
            !_.isUndefined(value) || !_.isNull(value)
              ? value
              : defaultValue || 0
          }
          rules={[{ required: require, message: `${alias}` }]}
        >
          <SliderGroup
            step={step}
            max={max}
            min={min}
            precision={precision}
            disabled={disabled}
          />
        </Form.Item>
      );
    case 'Switch':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={value || false}
          valuePropName="checked"
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Switch
            disabled={disabled}
          />
        </Form.Item>
      );
    case 'File':
      const title1 = uploadValues[name];
      return (
        <Form.Item
          shouldUpdate
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          valuePropName="file"
          rules={[{ required: require, message: `${alias}` }]}
        >
          <code className="flex-box-justify-between">
            {title1 ? (
              <div className="flex-box" style={{ width: `calc(100% - 88px)` }}>
                <TooltipDiv title={title1} style={{ flex: 1 }}>
                  <a onClick={() => openFolder(`${title1}\\`)}>{title1}</a>
                </TooltipDiv>
                <a
                  style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                  onClick={() => {
                    setUploadValues((prev: {}) => {
                      return { ...prev, [name]: undefined };
                    });
                    form.setFieldsValue({ [name]: undefined });
                  }}
                >
                  移除
                </a>
              </div>
            ) : null}
            <Button
              size='small'
              onClick={() => {
                chooseFile(
                  (res: any) => {
                    const result =
                      _.isArray(res) && res.length === 1 ? res[0] : res;
                    setUploadValues((prev: {}) => {
                      return { ...prev, [name]: result };
                    });
                    form.setFieldsValue({ [name]: result });
                  },
                  false,
                  suffix?.includes('all')
                    ? { name: 'All Files', extensions: ['*'] }
                    : { name: 'File', extensions: suffix }
                );
              }}
              disabled={disabled}
            >
              选择文件
            </Button>
          </code>
        </Form.Item>
      );
    case 'Dir':
      const title = uploadValues[name] || value;
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          valuePropName="file"
          getValueFromEvent={(e: any) => {
            if (Array.isArray(e)) {
              return e;
            }
            const { file, fileList } = e;
            return [{ ...file, percent: 40 }];
          }}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <code className="flex-box-justify-between">
            {title ? (
              <div className="flex-box" style={{ width: `calc(100% - 88px)` }}>
                <TooltipDiv title={title} style={{ flex: 1 }}>
                  <a onClick={() => openFolder(`${title}\\`)}>{title}</a>
                </TooltipDiv>
                <a
                  style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                  onClick={() => {
                    setUploadValues((prev: {}) => {
                      return { ...prev, [name]: undefined };
                    });
                    form.setFieldsValue({ [name]: undefined });
                  }}
                >
                  移除
                </a>
              </div>
            ) : null}
            <Button
              size='small'
              onClick={() => {
                chooseFolder((res, err) => {
                  const result =
                    _.isArray(res) && res.length === 1 ? res[0] : res;
                  setUploadValues((prev: {}) => {
                    return { ...prev, [name]: result };
                  });
                  form.setFieldsValue({ [name]: result });
                });
              }}
              disabled={disabled}
            >
              选择文件夹
            </Button>
          </code>
        </Form.Item>
      );
    case 'codeEditor':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
        >
          <>
            {!!value ? (
              <Input.TextArea
                rows={5}
                value={
                  language === 'json' && _.isObject(value)
                    ? formatJson(value)
                    : value
                }
                style={{ marginBottom: 8 }}
                disabled
              />
            ) : null}
            <Button
              onClick={() => {
                setEditorValue({
                  name,
                  value:
                    language === 'json' && _.isObject(value)
                      ? formatJson(value)
                      : value,
                  language,
                });
                return setEditorVisible(true);
              }}
              disabled={disabled}
            >
              编辑
            </Button>
          </>
        </Form.Item>
        // <Monaco
        //   width="100%"
        //   height="300"
        //   language="sql"
        //   theme="vs-dark"
        //   value={value}
        //   onChange={(value) => {
        //     return console.log(value);
        //   }}
        // />
      );
    case 'ImageLabelField':
      const title2 = uploadValues[name] || localPath;
      return (
        <>
          <Form.Item
            shouldUpdate
            name={name}
            label={`${alias}:`}
            tooltip={description || aliasDefault}
            initialValue={localPath || undefined}
            valuePropName="file"
            rules={[{ required: require, message: `${alias}` }]}
            style={{ marginBottom: 8 }}
          >
            <code className="flex-box-justify-between">
              {title2 ? (
                <div className="flex-box" style={{ width: `calc(100% - 88px)` }}>
                  <TooltipDiv title={title2} style={{ marginBottom: 8 }}>
                    <a onClick={() => openFolder(title2, true)}>{title2}</a>
                  </TooltipDiv>
                  <a
                    style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                    onClick={() => {
                      setUploadValues((prev: {}) => {
                        return { ...prev, [name]: undefined };
                      });
                      form.setFieldsValue({ [name]: undefined });
                    }}
                  >
                    移除
                  </a>
                </div>
              ) : null}
              <Button
                onClick={() => {
                  chooseFile(
                    (res: any) => {
                      const result = _.isArray(res) && res.length === 1 ? res[0] : res;
                      setUploadValues((prev: {}) => {
                        return { ...prev, [name]: result };
                      });
                      form.setFieldsValue({ [name]: result });
                    },
                    false,
                    suffix?.includes('all')
                      ? { name: 'All Files', extensions: ['*'] }
                      : {
                        name: 'File',
                        extensions: ['jpg', 'jpeg', 'png', 'svg'],
                      }
                  );
                }}
                disabled={disabled}
                style={{ marginRight: 8 }}
              >
                选择文件
              </Button>
            </code>
          </Form.Item>
        </>
      );
    case 'Measurement':
      return (
        <Form.Item
          name={name}
          label={`${alias}:`}
          tooltip={description || aliasDefault}
          initialValue={value || undefined}
          rules={[{ required: require, message: `${alias}` }]}
        >
          <Measurement
            disabled={disabled}
            titleColor
            precision={precision}
            step={step}
            max={max}
            min={min}
            type={type}
          />
        </Form.Item>
      );
    case 'DataMap':
      return (
        <>
          <Form.Item
            name={name}
            label={`${alias}:`}
            tooltip={description || aliasDefault}
          >
            <div>
              {(options || [])?.map?.((item: any, index: number) => {
                const { id, label, value } = item;
                return (
                  <div
                    className="flex-box"
                    key={id || index}
                    style={{
                      marginBottom: index + 1 !== options.length ? 24 : 0,
                    }}
                  >
                    <div style={{ padding: '0 12px', whiteSpace: 'nowrap' }}>
                      原始值 :
                    </div>
                    <Input
                      style={{ width: '50%' }}
                      defaultValue={label}
                    />
                    <div style={{ padding: '0 12px', whiteSpace: 'nowrap' }}>
                      映射值 :
                    </div>
                    <Input
                      style={{ width: '50%' }}
                      defaultValue={value}

                    />
                    <MinusCircleOutlined
                      style={{ marginLeft: 8 }}
                      onClick={() => {

                      }}
                    />
                  </div>
                );
              })}
              <Button
                type="dashed"
                style={{ marginTop: 24 }}
                onClick={() => {
                  const result = (options || []).concat({
                    id: guid(),
                    label: '',
                    value: '',
                  });
                  widgetChange(name, result, parentName);
                }}
                block
                icon={<PlusOutlined />}
              >
                添加可选项
              </Button>
            </div>
          </Form.Item>
        </>
      );
    default:
      return null;
  }
};
