import { Fragment, useEffect, useState } from 'react';
import TooltipDiv from '@/components/TooltipDiv';
import {
  Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Popconfirm, Radio, Row, Select, Switch,
} from 'antd';
import {
  EditOutlined, MinusCircleOutlined, QuestionCircleOutlined, PlusOutlined, MinusOutlined
} from '@ant-design/icons';
import * as _ from 'lodash-es';
import IpInput from '@/components/IpInputGroup';
import SliderGroup from '@/components/SliderGroup';
import { chooseFile, chooseFolder, openFolder } from '@/api/native-path';
import { formatJson, guid } from '@/utils/utils';
import Measurement from '@/components/Measurement';
import MonacoEditor from '@/components/MonacoEditor';
import moment from 'moment';

export const initParamsKeys: any = {
  'Input': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'Input' }
  },
  'IpInput': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'IpInput' }
  },
  'codeEditor': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'codeEditor' }
  },
  'InputNumber': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'InputNumber', max: undefined, min: undefined, step: undefined, precision: undefined }
  },
  'Slider': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'Slider', max: undefined, min: undefined, step: undefined, precision: undefined }
  },
  'DatePicker': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'DatePicker', }
  },
  'Measurement': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'Measurement', options: [] }
  },
  'Switch': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'Switch', }
  },
  'Radio': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'Radio', options: [] }
  },
  'Select': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'Select', options: [] }
  },
  'TagRadio': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'TagRadio', options: [] }
  },
  'MultiSelect': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'MultiSelect', options: [] }
  },
  'Checkbox': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'Checkbox', options: [] }
  },
  'DataMap': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'DataMap', options: [] }
  },
  'File': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'File', suffix: [], }
  },
  'ImageLabelField': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'ImageLabelField', suffix: [], }
  },
  'Dir': {
    alias: '',
    default: undefined,
    description: undefined,
    name: '',
    require: true,
    sort: 0,
    type: '',
    value: undefined,
    widget: { type: 'Dir' }
  }
};
export const InitParamsShow = (props: any) => {
  const {
    item = {},
    ifCanModify = false,
    onlyShowPanel = false,
    className = '',
    onEdit,
    onRemove,
    span = 18,
  } = props;
  const {
    name,
    alias,
    type: inputType,
    widget = {},
    default: defaultValue,
    description = '',
    value,
    language,
    localPath,
    require,
  } = item;
  let {
    max,
    min,
    options = [],
    precision,
    step,
    suffix,
    type,
    length,
  } = widget;
  if (_.isArray(options) && _.isString(options[0])) {
    options = (options || [])?.map?.((option: string) => ({
      label: option,
      value: option,
    }));
  }
  const required = require ? '是' : '否';
  switch (type) {
    case 'Input':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <Input
                  disabled
                  value={value || defaultValue}
                  className="plugin-style"
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{defaultValue}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'IpInput':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <IpInput
                  disabled
                  value={value || defaultValue}
                  className="plugin-style"
                  length={length}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{defaultValue}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'InputNumber':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <InputNumber
                  disabled
                  className="plugin-style"
                  precision={precision}
                  step={step}
                  max={max}
                  min={min}
                  value={value || value == 0 ? value : defaultValue}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>步长：{step}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>小数点后几位：{precision}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>最大值：{max}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>最小值：{min}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{defaultValue}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Slider':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <SliderGroup
                  disabled
                  className="plugin-style"
                  step={step}
                  max={max}
                  min={min}
                  precision={precision}
                  value={value || value == 0 ? value : defaultValue}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>步长：{step}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>最大值：{max}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>最小值：{min}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>初始值：{defaultValue}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>默认值：{value}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style"></Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'DatePicker':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <TooltipDiv className="plugin-style">
                  <DatePicker showTime value={!!value ? moment(new Date(value)) : undefined} disabled style={{ width: '100%' }} />
                </TooltipDiv>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{!!defaultValue ? moment(new Date(defaultValue)).format("YYYY-MM-DD HH:mm:ss") : undefined}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{!!value ? moment(new Date(value)).format("YYYY-MM-DD HH:mm:ss") : undefined}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Radio':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <div className="plugin-style">
                  <Radio.Group
                    disabled
                    value={
                      _.isArray(value)
                        ? value[0]
                        : _.isArray(defaultValue)
                          ? defaultValue[0]
                          : defaultValue
                    }
                    options={(options || [])?.map?.((option: any) => {
                      const { id, label, value } = option;
                      return {
                        key: id,
                        value, label
                      }
                    })}
                  />
                </div>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>
                        初始值：
                        {_.isArray(defaultValue) ? defaultValue[0] : defaultValue}
                      </TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{_.isArray(value) ? value[0] : value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'TagRadio':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <div className="plugin-style">
                  <Select
                    disabled
                    value={value || defaultValue}
                    className="plugin-style"
                    options={options?.map((item: any) => item.name)}
                  />
                </div>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>
                        初始值：
                        {_.isArray(defaultValue) ? defaultValue[0] : defaultValue}
                      </TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{_.isArray(value) ? value[0] : value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'AlgoList':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <Select
                  disabled
                  value={value || defaultValue}
                  className="plugin-style"
                  options={(options || [])?.map?.((option: any) => {
                    const { id, label, value } = option;
                    return {
                      key: id,
                      value,
                      label
                    }
                  })}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>
                        初始值：
                        {_.isArray(defaultValue) ? defaultValue[0] : defaultValue}
                      </TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{_.isArray(value) ? value[0] : value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Select':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <Select
                  disabled
                  value={value || defaultValue}
                  className="plugin-style"
                  options={(options || [])?.map?.((option: any) => {
                    const { id, label, value } = option;
                    return {
                      key: id,
                      value,
                      label
                    }
                  })}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>
                        初始值：
                        {_.isArray(defaultValue) ? defaultValue[0] : defaultValue}
                      </TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{_.isArray(value) ? value[0] : value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'MultiSelect':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <Select
                  disabled
                  mode="multiple"
                  value={value || defaultValue}
                  className="plugin-style"
                  options={(options || [])?.map?.((option: any) => {
                    const { id, label, value } = option;
                    return {
                      key: id,
                      value,
                      label
                    }
                  })}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>
                        初始值：
                        {_.isArray(defaultValue)
                          ? defaultValue.join('，')
                          : defaultValue}
                      </TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{_.isArray(value) ? value.join('，') : value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Checkbox':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <div className="plugin-style">
                  <Checkbox.Group
                    disabled
                    options={options}
                    value={value || defaultValue}
                  />
                </div>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>
                        初始值：
                        {_.isArray(defaultValue)
                          ? defaultValue.join('，')
                          : defaultValue}
                      </TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{_.isArray(value) ? value.join('，') : value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Switch':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <div className="plugin-style">
                  <Switch
                    disabled
                    checked={_.isBoolean(value) ? value : !!defaultValue}
                  />
                </div>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{defaultValue ? 'true' : 'false'}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{value ? 'true' : 'false'}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'File':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <TooltipDiv
                  className="plugin-style"
                  content={value || defaultValue}
                  onClick={() =>
                    value || defaultValue
                      ? openFolder(value || defaultValue, true)
                      : null
                  }
                >
                  {value || defaultValue || '暂无默认值'}
                </TooltipDiv>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{defaultValue}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>可选后缀类型：{_.isArray(suffix) && suffix.join('，')}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style"></Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Dir':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <TooltipDiv
                  className="plugin-style only-show-one-line"
                  content={value}
                  onClick={() =>
                    value || defaultValue
                      ? openFolder(value || defaultValue)
                      : null
                  }
                >
                  {value || defaultValue || '暂无默认值'}
                </TooltipDiv>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{defaultValue}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'codeEditor':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <div className="plugin-style">
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
                </div>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => onEdit()}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => onRemove()}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>
                        初始值：
                        {_.isString(defaultValue)
                          ? defaultValue
                          : JSON.stringify(defaultValue)}
                      </TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>
                        默认值：
                        {_.isString(value) ? value : JSON.stringify(value)}
                      </TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'ImageLabelField':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <TooltipDiv
                  className="plugin-style"
                  content={localPath || value || defaultValue}
                  onClick={() =>
                    localPath || value || defaultValue
                      ? openFolder(value || defaultValue, true)
                      : null
                  }
                >
                  {localPath || value || defaultValue || '暂无默认值'}
                </TooltipDiv>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{localPath || defaultValue}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{localPath || value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'Measurement':
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <Measurement
                  className="plugin-style"
                  disabled
                  value={value || defaultValue}
                  precision={precision}
                  step={step}
                  max={max}
                  min={min}
                  type={inputType}
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{JSON.stringify(defaultValue)}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{JSON.stringify(value)}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    case 'DataMap':
      const valueDataMap = value || defaultValue || options?.reduce((pre: any, cen: any) => {
        const { label, value } = cen;
        return { ...pre, [label]: value };
      }, {});
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <Input.TextArea
                  autoSize={{ minRows: 5, maxRows: 5 }}
                  value={_.isObject(valueDataMap) ? formatJson(valueDataMap) : valueDataMap}
                  style={{ marginBottom: 8 }}
                  disabled
                />
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{JSON.stringify(defaultValue)}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{JSON.stringify(value)}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
    default:
      return (
        <Row className={`flex-box-start ${className}`}>
          {!onlyShowPanel ? (
            <Col span={6} className="label-style flex-box">
              {alias || name}
              {description ? (
                <TooltipDiv title={description} >
                  <QuestionCircleOutlined />
                </TooltipDiv>
              ) : null}
            </Col>
          ) : null}
          <Col span={span || 18} className="wrapper-style flex-box-start">
            <div
              className="top-content"
              style={onlyShowPanel ? { marginBottom: 0 } : {}}
            >
              <div className="flex-box top-content-plugin-operation">
                <TooltipDiv className="plugin-style">暂无面板类型，请配置</TooltipDiv>
                {ifCanModify ? (
                  <div className="flex-box">
                    <EditOutlined
                      className="plugin-icon"
                      onClick={() => {
                        return onEdit();
                      }}
                    />
                    <Popconfirm
                      title="确定删除当前属性?"
                      onConfirm={() => {
                        onRemove();
                      }}
                    >
                      <MinusCircleOutlined className="plugin-icon" />
                    </Popconfirm>
                  </div>
                ) : null}
              </div>
              {!onlyShowPanel ? (
                <Fragment>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>类型：{type}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>初始值：{defaultValue}</TooltipDiv>
                    </Col>
                  </Row>
                  <Row className="flex-box-justify-between">
                    <Col span={12} className="text-style">
                      <TooltipDiv>默认值：{value}</TooltipDiv>
                    </Col>
                    <Col span={11} offset={1} className="text-style">
                      <TooltipDiv>是否必填项：{required}</TooltipDiv>
                    </Col>
                  </Row>
                </Fragment>
              ) : null}
            </div>
          </Col>
        </Row>
      );
  }
};

export const InitParamsEdit = (props: any) => {
  const { data, form } = props;
  const { widget, language } = data || {};
  const {
    type, suffix, max, min, step, precision
  } = widget || {};
  const [options, setOptions] = useState<any>([]);
  const [uploadValue, setUploadValue] = useState<any>(undefined);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (_.isArray(suffix)) {
      setOptions(suffix);
    } else {
      setOptions(_.isArray(widget?.options) ? widget?.options?.map((i: any) => ({ id: guid(), ...i })) : []);
    }
  }, [widget?.options, suffix]);
  useEffect(() => {
    if (type === 'codeEditor') {
      try {
        setUploadValue({
          value: formatJson(data.value),
          language
        });
      } catch (err) {
        setUploadValue({
          value: data.value,
          language
        });
      };
    } else if (type === 'ImageLabelField') {
      setUploadValue(data.localPath);
    } else {
      setUploadValue(data.value);
    }
  }, [data.value, data.localPath]);

  switch (type) {
    case 'Input':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: 'value' }]}
        >
          <Input placeholder="请输入默认值" />
        </Form.Item>
      </Fragment>;
    case 'DatePicker':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: '默认值' }]}
        >
          {
            <DatePicker showTime style={{ width: '100%' }} />
          }
        </Form.Item>
      </Fragment>;
    case 'IpInput':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: 'value' }]}
        >
          <IpInput />
        </Form.Item>
      </Fragment>;
    case 'InputNumber':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: 'value' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="max"
          label="最大值"
          rules={[{ required: true, message: '最大值' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="min"
          label="最小值"
          rules={[{ required: true, message: '最小值' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="step"
          label="步长"
          rules={[{ required: true, message: '步长' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="precision"
          label="保留小数点后几位"
          rules={[{ required: true, message: '保留小数点后几位' }]}
        >
          <InputNumber min={0} precision={0} step={1} />
        </Form.Item>
      </Fragment>;
    case 'Slider':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: 'value' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="max"
          label="最大值"
          rules={[{ required: true, message: '最大值' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="min"
          label="最小值"
          rules={[{ required: true, message: '最小值' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="step"
          label="步长"
          rules={[{ required: true, message: '步长' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="precision"
          label="保留小数点后几位"
          rules={[{ required: true, message: '保留小数点后几位' }]}
        >
          <InputNumber min={0} precision={0} step={1} />
        </Form.Item>
      </Fragment>;
    case 'Radio':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: '默认值' }]}
        >
          <Radio.Group block options={options} />
        </Form.Item>
        {
          !!options ?
            (options || [])?.map((item: any, index: number) => {
              const { id, label, value } = item;
              return <div className="flex-box" style={{ gap: 8 }}>
                <Form.Item
                  name={`options$%$${id}$%$label`}
                  label="label"
                  initialValue={label}
                  rules={[{ required: false, message: 'label' }]}
                >
                  <Input placeholder='label' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            label: value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Form.Item
                  name={`options$%$${id}$%$value`}
                  label="value"
                  initialValue={value}
                  rules={[{ required: false, message: 'value' }]}
                >
                  <Input placeholder='value' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Button
                  icon={<MinusOutlined />}
                  style={{ marginTop: 6 }}
                  onClick={() => {
                    setOptions((prev: any) => prev?.filter((pre: any) => pre.id !== id));
                  }}
                />
              </div>
            })
            : null
        }
        <Button
          block
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOptions((prev: any) => prev.concat({ id: guid(), label: '', value: '' }))}
        >
          添加
        </Button>
      </Fragment>;
    case 'TagRadio':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: '默认值' }]}
        >
          <Select options={options} />
        </Form.Item>
        {
          !!options ?
            (options || [])?.map((item: any, index: number) => {
              const { id, label, value } = item;
              return <div className="flex-box" style={{ gap: 8 }}>
                <Form.Item
                  name={`options$%$${id}$%$label`}
                  label="label"
                  initialValue={label}
                  rules={[{ required: false, message: 'label' }]}
                >
                  <Input placeholder='label' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            label: value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Form.Item
                  name={`options$%$${id}$%$value`}
                  label="value"
                  initialValue={value}
                  rules={[{ required: false, message: 'value' }]}
                >
                  <Input placeholder='value' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Button
                  icon={<MinusOutlined />}
                  style={{ marginTop: 6 }}
                  onClick={() => {
                    setOptions((prev: any) => prev?.filter((pre: any) => pre.id !== id));
                  }}
                />
              </div>
            })
            : null
        }
        <Button
          block
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOptions((prev: any) => prev.concat({ id: guid(), label: '', value: '' }))}
        >
          添加
        </Button>
      </Fragment>;
    case 'Select':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: '默认值' }]}
        >
          <Select options={options} />
        </Form.Item>
        {
          !!options ?
            (options || [])?.map((item: any, index: number) => {
              const { id, label, value } = item;
              return <div className="flex-box" style={{ gap: 8 }}>
                <Form.Item
                  name={`options$%$${id}$%$label`}
                  label="label"
                  initialValue={label}
                  rules={[{ required: false, message: 'label' }]}
                >
                  <Input placeholder='label' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            label: value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Form.Item
                  name={`options$%$${id}$%$value`}
                  label="value"
                  initialValue={value}
                  rules={[{ required: false, message: 'value' }]}
                >
                  <Input placeholder='value' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Button
                  icon={<MinusOutlined />}
                  style={{ marginTop: 6 }}
                  onClick={() => {
                    setOptions((prev: any) => prev?.filter((pre: any) => pre.id !== id));
                  }}
                />
              </div>
            })
            : null
        }
        <Button
          block
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOptions((prev: any) => prev.concat({ id: guid(), label: '', value: '' }))}
        >
          添加
        </Button>
      </Fragment>;
    case 'MultiSelect':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: '默认值' }]}
        >
          <Select mode="multiple" options={options} />
        </Form.Item>
        {
          !!options ?
            (options || [])?.map((item: any, index: number) => {
              const { id, label, value } = item;
              return <div className="flex-box" style={{ gap: 8 }}>
                <Form.Item
                  name={`options$%$${id}$%$label`}
                  label="label"
                  initialValue={label}
                  rules={[{ required: false, message: 'label' }]}
                >
                  <Input placeholder='label' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            label: value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Form.Item
                  name={`options$%$${id}$%$value`}
                  label="value"
                  initialValue={value}
                  rules={[{ required: false, message: 'value' }]}
                >
                  <Input placeholder='value' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Button
                  icon={<MinusOutlined />}
                  style={{ marginTop: 6 }}
                  onClick={() => {
                    setOptions((prev: any) => prev?.filter((pre: any) => pre.id !== id));
                  }}
                />
              </div>
            })
            : null
        }
        <Button
          block
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOptions((prev: any) => prev.concat({ id: guid(), label: '', value: '' }))}
        >
          添加
        </Button>
      </Fragment>;
    case 'Checkbox':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: '默认值' }]}
        >
          <Checkbox.Group options={options} />
        </Form.Item>
        {
          !!options ?
            (options || [])?.map((item: any, index: number) => {
              const { id, label, value } = item;
              return <div className="flex-box" style={{ gap: 8 }}>
                <Form.Item
                  name={`options$%$${id}$%$label`}
                  label="label"
                  initialValue={label}
                  rules={[{ required: false, message: 'label' }]}
                >
                  <Input placeholder='label' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            label: value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Form.Item
                  name={`options$%$${id}$%$value`}
                  label="value"
                  initialValue={value}
                  rules={[{ required: false, message: 'value' }]}
                >
                  <Input placeholder='value' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Button
                  icon={<MinusOutlined />}
                  style={{ marginTop: 6 }}
                  onClick={() => {
                    setOptions((prev: any) => prev?.filter((pre: any) => pre.id !== id));
                  }}
                />
              </div>
            })
            : null
        }
        <Button
          block
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOptions((prev: any) => prev.concat({ id: guid(), label: '', value: '' }))}
        >
          添加
        </Button>
      </Fragment>;
    case 'Switch':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          valuePropName="checked"
          rules={[{ required: false, message: '默认值' }]}
        >
          <Switch />
        </Form.Item>
      </Fragment>;
    case 'File':
      return <Fragment>
        <Form.Item
          name="suffix"
          label="允许类型"
          rules={[{ required: true, message: '允许选择的类型' }]}
        >
          <Checkbox.Group
            options={[
              { label: 'jpg', value: 'jpg' },
              { label: 'jpeg', value: 'jpeg' },
              { label: 'png', value: 'png' },
              { label: 'svg', value: 'svg' },
              { label: 'pdf', value: 'pdf' },
              { label: 'pt', value: 'pt' },
              { label: 'py', value: 'py' },
              { label: 'doc', value: 'doc' },
              { label: 'docx', value: 'docx' },
              { label: 'csv', value: 'csv' },
              { label: 'bmp', value: 'bmp' },
              { label: 'json', value: 'json' },
              { label: '不限类型', value: 'all' },
            ]}
            onChange={(val: any) => {
              if (val?.includes('all') || val.length === 13) {
                const result = ['jpg', 'jpeg', 'png', 'svg', 'pdf', 'pt', 'py', 'doc', 'docx', 'csv', 'bmp', 'json', 'all',];
                form.setFieldsValue({
                  suffix: result
                });
                setOptions(result);
              } else if (val.length === 12 && !val.includes('all')) {
                form.setFieldsValue({
                  suffix: []
                });
                setOptions([]);
              } else {
                setOptions(val);
              }
            }}
          />
        </Form.Item>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: '默认值' }]}
        >
          <code className="flex-box-justify-between">
            <div className="flex-box" style={{ width: `calc(100% - 88px)` }}>
              {
                uploadValue ?
                  <TooltipDiv title={uploadValue} style={{ flex: 1 }}>
                    <TooltipDiv onClick={() => openFolder(`${uploadValue}\\`)}>{uploadValue}</TooltipDiv>
                  </TooltipDiv>
                  : null
              }
              <a
                style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                onClick={() => {
                  setUploadValue('');
                  form.setFieldsValue({ value: undefined });
                }}
              >
                移除
              </a>
            </div>
            <Button
              size='small'
              onClick={() => {
                chooseFile(
                  (res: any) => {
                    const result = _.isArray(res) && res.length === 1 ? res[0] : res;
                    setUploadValue(result);
                    form.setFieldsValue({ value: result });
                  },
                  false,
                  (options?.includes('all') || options?.length === 0)
                    ? { name: 'All Files', extensions: ['*'] }
                    : {
                      name: 'File',
                      extensions: options,
                    }
                );
              }}
            >
              选择文件
            </Button>
          </code>
        </Form.Item>
      </Fragment>;
    case 'Dir':
      return <Fragment>
        <Form.Item
          name="value"
          label="默认值"
          rules={[{ required: false, message: '默认值' }]}
        >
          <code className="flex-box-justify-between">
            <div className="flex-box" style={{ width: `calc(100% - 88px)` }}>
              {
                uploadValue ?
                  <TooltipDiv title={uploadValue} style={{ flex: 1 }}>
                    <TooltipDiv onClick={() => openFolder(`${uploadValue}\\`)}>{uploadValue}</TooltipDiv>
                  </TooltipDiv>
                  : null
              }
              <a
                style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                onClick={() => {
                  setUploadValue('');
                  form.setFieldsValue({ value: undefined });
                }}
              >
                移除
              </a>
            </div>
            <Button
              size='small'
              onClick={() => {
                chooseFolder((res, err) => {
                  const result =
                    _.isArray(res) && res.length === 1 ? res[0] : res;
                  setUploadValue(result);
                  form.setFieldsValue({ value: result });
                });
              }}
            >
              选择文件夹
            </Button>
          </code>
        </Form.Item>
      </Fragment>;
    case 'codeEditor':
      return <Fragment>
        <Form.Item
          name="language"
          label="编码语言"
          rules={[{ required: false, message: '编码语言' }]}
        >
          <Select
            options={[
              { value: 'javascript', label: 'javascript' },
              { value: 'python', label: 'python' },
              { value: 'json', label: 'json' },
              { value: 'sql', label: 'sql' },
            ]}
            onChange={(val) => {
              setUploadValue((prev: any) => ({ ...prev, language: val }));
            }}
          />
        </Form.Item>
        <Form.Item
          name="value"
          label="默认值"
          style={{ marginBottom: 8 }}
          rules={[{ required: false, message: '默认值' }]}
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            disabled
          />
        </Form.Item>
        <Button
          style={{ marginBottom: 24 }}
          onClick={() => {
            setModalVisible(true);
          }}
        >
          编辑
        </Button>
        {modalVisible ?
          <MonacoEditor
            defaultValue={uploadValue.value}
            language={uploadValue.language}
            visible={modalVisible}
            onOk={(val: any) => {
              setUploadValue(val);
              form.setFieldsValue({ value: val?.value || '', language: val?.language });
              setModalVisible(false);
            }}
            onCancel={() => {
              setModalVisible(false);
            }}
          />
          : null}
      </Fragment>;
    case 'ImageLabelField':
      return <Fragment>
        <Form.Item
          name="localPath"
          label="默认值"
          rules={[{ required: false, message: '默认值' }]}
        >
          <code className="flex-box-justify-between">
            <div className="flex-box" style={{ width: `calc(100% - 104px)` }}>
              {
                uploadValue ?
                  <TooltipDiv title={uploadValue} style={{ flex: 1 }}>
                    <TooltipDiv onClick={() => openFolder(`${uploadValue}\\`)}>{uploadValue}</TooltipDiv>
                  </TooltipDiv>
                  : null
              }
              <a
                style={{ whiteSpace: 'nowrap', padding: '0 4px' }}
                onClick={() => {
                  setUploadValue('');
                  form.setFieldsValue({ localPath: undefined });
                }}
              >
                移除
              </a>
            </div>
            <Button
              size='small'
              onClick={() => {
                chooseFile(
                  (res: any) => {
                    const result = _.isArray(res) && res.length === 1 ? res[0] : res;
                    setUploadValue(result);
                    form.setFieldsValue({ localPath: result });
                  },
                  false,
                  {
                    name: 'File',
                    extensions: ['jpg', 'jpeg', 'png', 'svg'],
                  }
                );
              }}
            >
              选择图片文件
            </Button>
          </code>
        </Form.Item>
      </Fragment>;
    case 'Measurement':
      return <Fragment>
        {
          ['float'].includes(form.getFieldValue('type') || data.type) ?
            <Form.Item
              name={`precision`}
              label="保留小数点后几位数"
              rules={[{ required: false, message: 'value' }]}
            >
              <InputNumber min={0} precision={0} step={1} />
            </Form.Item>
            : null
        }
        {
          !!options ?
            (options || [])?.map((item: any, index: number) => {
              const { id, alias, value } = item;
              return <div className="flex-box" style={{ gap: 8 }}>
                <Form.Item
                  name={`options$%$${id}$%$alias`}
                  label="label"
                  initialValue={alias}
                  rules={[{ required: false, message: 'label' }]}
                >
                  <Input placeholder='label' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            alias: value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Form.Item
                  name={`options$%$${id}$%$value`}
                  label="value"
                  initialValue={value}
                  rules={[{ required: false, message: 'value' }]}
                >
                  {
                    ['int', 'float'].includes(form.getFieldValue('type')) ?
                      <InputNumber onChange={(value) => {
                        setOptions((prev: any) => {
                          return prev?.map((pre: any) => {
                            if (pre.id === id) {
                              return {
                                ...pre,
                                value
                              };
                            } else {
                              return pre;
                            };
                          });
                        });
                      }} />
                      :
                      <Input placeholder='value' onChange={(e) => {
                        const { value } = e.target;
                        setOptions((prev: any) => {
                          return prev?.map((pre: any) => {
                            if (pre.id === id) {
                              return {
                                ...pre,
                                value
                              };
                            } else {
                              return pre;
                            };
                          });
                        });
                      }} />
                  }
                </Form.Item>
                <Button
                  icon={<MinusOutlined />}
                  style={{ marginTop: 6 }}
                  onClick={() => {
                    setOptions((prev: any) => prev?.filter((pre: any) => pre.id !== id));
                  }}
                />
              </div>
            })
            : null
        }
        <Button
          block
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOptions((prev: any) => prev.concat({ id: guid(), alias: '', value: '' }))}
        >
          添加
        </Button>
      </Fragment>;
    case 'DataMap':
      return <Fragment>
        {
          !!options ?
            (options || [])?.map((item: any, index: number) => {
              const { id, label, value } = item;
              return <div className="flex-box" style={{ gap: 8 }}>
                <Form.Item
                  name={`options$%$${id}$%$label`}
                  label="原始值"
                  initialValue={label}
                  rules={[{ required: false, message: '原始值' }]}
                >
                  <Input placeholder='原始值' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            label: value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Form.Item
                  name={`options$%$${id}$%$value`}
                  label="映射值"
                  initialValue={value}
                  rules={[{ required: false, message: '映射值' }]}
                >
                  <Input placeholder='映射值' onChange={(e) => {
                    const { value } = e.target;
                    setOptions((prev: any) => {
                      return prev?.map((pre: any) => {
                        if (pre.id === id) {
                          return {
                            ...pre,
                            value
                          };
                        } else {
                          return pre;
                        };
                      });
                    });
                  }} />
                </Form.Item>
                <Button
                  icon={<MinusOutlined />}
                  style={{ marginTop: 6 }}
                  onClick={() => {
                    setOptions((prev: any) => prev?.filter((pre: any) => pre.id !== id));
                  }}
                />
              </div>
            })
            : null
        }
        <Button
          block
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOptions((prev: any) => prev.concat({ id: guid(), label: '', value: '' }))}
        >
          添加
        </Button>
      </Fragment>;
    default:
      return null;
  }
};