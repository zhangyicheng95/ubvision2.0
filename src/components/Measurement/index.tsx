import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Input, InputNumber, Switch } from 'antd';
import * as _ from 'lodash';
import styles from './index.module.less';

interface Props {
  disabled?: Boolean;
  value?: string;
  className?: any;
  onChange?: any;
  titleColor?: Boolean;
  precision?: number;
  step?: number;
  max?: number;
  min?: number;
  type?: any;
}

const Measurement: React.FC<Props> = (props: any) => {
  const {
    onChange = null,
    value = '',
    disabled,
    className = '',
    titleColor,
    precision = 2,
    step = 0.01,
    max = 100000,
    min = -100000,
    type = 'float',
  } = props;

  const refnum_0 = useRef();
  const refnum_1 = useRef();
  const refnum_2 = useRef();
  const refnum_3 = useRef();
  const refList: any = [refnum_0, refnum_1, refnum_2, refnum_3];
  const [selfValue, setSelfValue] = useState<any>({});
  const [focus, setFocus] = useState<any>({
    refnum_0: false,
    refnum_1: false,
    refnum_2: false,
    refnum_3: false,
  });

  useEffect(() => {
    if (!!value && !_.isEmpty(value)) {
      if (_.isArray(value)) {
        const result = value?.reduce((pre: any, cen: any) => {
          return {
            ...pre,
            [cen.alias]: cen,
          };
        }, {});
        setSelfValue(result);
        setFocus(() => {
          return Object.entries(result).reduce(
            (pre: any, cen: any, index: number) => {
              return Object.assign({}, pre, {
                [`refnum_${index}`]: !!cen[1]?.value || cen[1]?.value == 0,
              });
            },
            {}
          );
        });
      } else {
        setSelfValue(value);
        setFocus(() => {
          return Object.entries(value).reduce(
            (pre: any, cen: any, index: number) => {
              return Object.assign({}, pre, {
                [`refnum_${index}`]: !!cen[1]?.value || cen[1]?.value == 0,
              });
            },
            {}
          );
        });
      }
    }
  }, [value]);
  const handleNumberChange = (number: any, name: any, index: number) => {
    let Obj: any = selfValue;
    Obj[`${name}`] = {
      ...Obj[`${name}`],
      value:
        type === 'string'
          ? number
          : type === 'bool'
            ? !!number
            : type === 'float'
              ? Number(number || '0.0')
              : type === 'int'
                ? parseInt(number || 0)
                : number,
    };
    setSelfValue(Obj);
    triggerChange(Obj);
  };
  const triggerChange = (changedValue: any) => {
    if (onChange) {
      onChange(changedValue);
    }
  };

  return (
    <div className={`flex-box ${styles.measurement}`}>
      {Object.entries(selfValue)?.map?.((item: any, index: number) => {
        const { alias, value } = item[1];
        return (
          <div key={index} className="flex-box-center item-input-box">
            <div
              className={`input-name ${focus[`refnum_${index}`] ? 'focus' : ''
                } ${titleColor ? 'bgColor' : ''}`}
              onClick={() => refList[index]?.current?.focus()}
            >
              {alias}
            </div>
            {type === 'string' ? (
              <Input
                disabled={disabled}
                className={`self_input ${className}`}
                ref={refList[index]}
                defaultValue={!!value ? value : ''}
                onFocus={() =>
                  setFocus((prev: any) =>
                    Object.assign({}, prev, { [`refnum_${index}`]: true })
                  )
                }
                onChange={(e) => {
                  const val = e?.target?.value;
                  setFocus((prev: any) =>
                    Object.assign({}, prev, {
                      [`refnum_${index}`]: !(
                        _.isUndefined(val) || _.isNull(val)
                      ),
                    })
                  );
                  handleNumberChange(val, item[0], index);
                }}
              />
            ) : type === 'bool' ? (
              <Switch
                disabled={disabled}
                className={`self_input ${className}`}
                ref={refList[index]}
                defaultChecked={!!value}
                onChange={(checked) => {
                  const val = checked;
                  setFocus((prev: any) =>
                    Object.assign({}, prev, {
                      [`refnum_${index}`]: !(
                        _.isUndefined(val) || _.isNull(val)
                      ),
                    })
                  );
                  handleNumberChange(val, item[0], index);
                }}
              />
            ) : (
              <InputNumber
                disabled={disabled}
                className={`self_input ${className}`}
                ref={refList[index]}
                defaultValue={value}
                precision={type === 'float' ? precision : 0}
                step={step}
                max={max}
                min={min}
                onFocus={() =>
                  setFocus((prev: any) =>
                    Object.assign({}, prev, { [`refnum_${index}`]: true })
                  )
                }
                onChange={(valu: any) => {
                  if (!_.isNaN(valu)) {
                    const val =
                      type === 'float'
                        ? parseFloat(valu)
                        : parseInt(valu);
                    setFocus((prev: any) =>
                      Object.assign({}, prev, {
                        [`refnum_${index}`]: !(
                          _.isUndefined(val) || _.isNull(val)
                        ),
                      })
                    );
                    handleNumberChange(val, item[0], index);
                  }
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Measurement;
