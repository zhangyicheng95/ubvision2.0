import React, { } from 'react';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { GetQueryObj, getUserAuthList } from '@/utils/utils';

interface Props { }

const SoftwareOpenRouter: React.FC<Props> = (props: any) => {
  const userAuthList = getUserAuthList();
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const url = params?.['url'];

  return (
    <div className={`${styles.softwareOpenPage}`}>
      {!!url ? <iframe src={url} frameBorder="0" /> : null}
    </div >
  );
};

export default SoftwareOpenRouter;
