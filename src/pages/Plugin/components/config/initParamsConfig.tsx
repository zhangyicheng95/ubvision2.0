import { Fragment, useEffect, useState } from 'react';
import TooltipDiv from '@/components/TooltipDiv';
import { Button, Checkbox, Col, Form, Input, InputNumber, Popconfirm, Radio, Row, Select, Switch } from 'antd';
import {
  EditOutlined, MinusCircleOutlined, QuestionCircleOutlined
} from '@ant-design/icons';
import * as _ from 'lodash-es';
import IpInput from '@/components/IpInputGroup';
import SliderGroup from '@/components/SliderGroup';
import { chooseFolder, openFolder } from '@/api/native-path';
import { formatJson } from '@/utils/utils';
import Measurement from '@/components/Measurement';

export const InitParamsObject = (props: any) => {
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
    case ('CodeEditor' || 'codeEditor'):
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
                  rows={5}
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
  const { widget } = data || {};
  const {
    type, max, min, step, precision
  } = widget || {};
  const [options, setOptions] = useState([]);
  const [uploadValue, setUploadValue] = useState('');

  useEffect(() => {
    setOptions(widget?.options || []);
  }, [widget?.options]);
  useEffect(() => {
    setUploadValue(data.value);
  }, [data.value]);

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
          <Radio.Group block options={options} defaultValue="Apple" />
        </Form.Item>
        <Form.Item
          name="options"
          label="默认值"
          rules={[{ required: false, message: '默认值' }]}
        >
          <Radio.Group block options={options} defaultValue="Apple" />
        </Form.Item>
      </Fragment>;
    case 'TagRadio':
      return <Fragment>

      </Fragment>;
    case 'AlgoList':
      return <Fragment>

      </Fragment>;
    case 'Select':
      return <Fragment>

      </Fragment>;
    case 'MultiSelect':
      return <Fragment>

      </Fragment>;
    case 'Checkbox':
      return <Fragment>

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
    case 'CodeEditor':
      return <Fragment>

      </Fragment>;
    case 'ImageLabelField':
      return <Fragment>

      </Fragment>;
    case 'Measurement':
      return <Fragment>

      </Fragment>;
    case 'DataMap':
      return <Fragment>

      </Fragment>;
    default:
      return null;
  }
};