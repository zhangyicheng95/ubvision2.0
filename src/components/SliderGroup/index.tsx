import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Col, Input, InputNumber, Row, Slider } from 'antd';
import * as _ from 'lodash-es';
import styles from './index.module.less'

interface Props {
  disabled?: Boolean,
  value?: string,
  className?: any,
  onChange?: any,
  step?: any,
  max?: any,
  min?: any,
  precision?: any,
};

const SliderGroup: React.FC<Props> = (props: any) => {
  const { onChange = null, value = '', disabled, className, step = undefined, max = undefined, min = undefined, precision = undefined } = props;
  const [selfValue, setSelfValue] = useState<any>(0);

  useEffect(() => {
    if (!!value || value == 0) {
      setSelfValue(value)
    }
  }, [value]);

  return (
    <Row className={className}>
      <Col span={16}>
        <Slider
          disabled={disabled}
          step={step}
          max={max}
          min={min}
          value={selfValue}
          onChange={(e) => onChange && onChange(e)}
        />
      </Col>
      <Col offset={1} span={7}>
        <InputNumber
          disabled={disabled}
          step={step}
          max={max}
          min={min}
          precision={precision}
          value={selfValue}
          onChange={(value) => {
            onChange && onChange(value)
          }}
        />
      </Col>
    </Row>
  )
};

export default SliderGroup;