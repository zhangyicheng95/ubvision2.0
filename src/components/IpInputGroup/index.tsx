import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Input, InputNumber } from 'antd';
import styles from './index.module.less'

interface Props {
  disabled?: Boolean,
  value?: string,
  className?: any,
  onChange?: any,
  length?: number,
};

const IpInput: React.FC<Props> = (props: any) => {
  const { length = 4, onChange = null, value = '', disabled, className } = props;
  const refip_0 = useRef();
  const refip_1 = useRef();
  const refip_2 = useRef();
  const refip_3 = useRef();
  const refip_4 = useRef();
  const refip_5 = useRef();
  const refip_6 = useRef();
  const refip_7 = useRef();
  const refList: any = [refip_0, refip_1, refip_2, refip_3, refip_4, refip_5, refip_6, refip_7];
  const [selfValue, setSelfValue] = useState<any>({
    ip_0: undefined,
    ip_1: undefined,
    ip_2: undefined,
    ip_3: undefined,
  });

  useEffect(() => {
    const res = value?.split('.') || [];
    let result: any = {};
    for (let i = 0; i < length; i++) {
      result[`ip_${i}`] = res?.[i] || undefined;
    }
    setSelfValue(result);
  }, [value, length])
  const handleNumberChange = (value: any, type: any) => {
    //确保最小值为0；
    const number = parseInt(value || 0, 10);
    if (isNaN(number)) {
      return;
    };
    setSelfValue((prev: any) => {
      return Object.assign({}, prev, {
        [type]: number
      });
    });
    let Obj: any = selfValue;
    Obj[`${type}`] = number;
    triggerChange(Object.values(Obj).join('.'));
  };

  const triggerChange = (changedValue: any) => {
    if (onChange) {
      onChange(changedValue);
    }
  };
  const turnIpPOS = (e: any, type: number) => {
    if (e.keyCode === 9) {
      if (type === 3) {
        return;
      } else {
        refList[type + 1]?.current?.focus();
      }
    }
  }

  return (
    <div className={`flex-box-center ${styles.inputGroup}`} style={Object.assign({},
      { height: '100%' },
      disabled ? { backgroundColor: 'rgba(255, 255, 255, 0.08)' } : {}
    )}>
      {
        Object.entries(selfValue)?.map?.((item: any, index: number) => {
          return <Fragment key={index}>
            <InputNumber
              key={index}
              disabled={disabled}
              className={`self_input ${className}`}
              ref={refList[index]}
              value={item[1]}
              maxLength={3}
              onChange={(e) => { handleNumberChange(e, item[0]) }}
            // onKeyUp={(e) => turnIpPOS(e, index)}
            />
            {
              index !== (Object.entries(selfValue)?.length - 1) ?
                <span className={'dot'} />
                : null
            }
          </Fragment>
        })
      }
    </div>
  )
};

export default IpInput;