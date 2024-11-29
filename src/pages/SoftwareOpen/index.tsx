import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  message,
  Modal,
  Dropdown,
  Menu,
  Spin,
  Select,
  Button,
  Form,
  Input,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  FormOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import * as _ from 'lodash-es';
import TooltipDiv from '@/components/TooltipDiv';
import PrimaryTitle from '@/components/PrimaryTitle';
import { chooseFile, chooseFolder, openFolder } from '@/api/native-path';
import styles from './index.module.less';
import ProjectApi from '@/api/project';
import { dpmDomain } from '@/utils/fetch';
import { GetQueryObj, getUserAuthList, guid } from '@/utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setLoading } from '@/redux/actions';

const { confirm } = Modal;
const userAuthList = getUserAuthList();

interface Props { }

const SoftwareOpenRouter: React.FC<Props> = (props: any) => {
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const url = params?.['url'];

  return (
    <div className={`${styles.softwareOpenPage}`}>
      <iframe src={url} frameBorder="0" />
    </div >
  );
};

export default SoftwareOpenRouter;
