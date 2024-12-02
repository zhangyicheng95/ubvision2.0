import React, { useEffect, useRef } from 'react';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { GetQueryObj, getUserAuthList } from '@/utils/utils';

interface Props { }

const SoftwareOpenRouter: React.FC<Props> = (props: any) => {
  const { ipcRenderer }: any = window || {};
  const domRef = useRef(null);
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const url = params?.['url'];
  const number = params?.['number'];
  useEffect(() => {
    window?.ipcRenderer?.invoke(`maximize-${number}`, number);
  }, []);

  return (
    <div className={`${styles.softwareOpenPage}`}>
      {!!url ? <iframe
        src={url}
        frameBorder="0"
        ref={(element: any) => domRef.current = element}
      /> : null}
    </div >
  );
};

export default SoftwareOpenRouter;
