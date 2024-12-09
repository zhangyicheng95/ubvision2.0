import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete } from 'antd';
import {
    SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { GetQueryObj, guid } from '@/utils/utils';
import { getParams, updateParams } from '@/services/flowEditor';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DropSortableItem from '@/components/DragComponents/DropSortableItem';
import Moveable from 'react-moveable';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasData, setLoading, setSelectedNode } from '@/redux/actions';
import { useCallback } from 'react';

interface Props {
    dataList: any;
}

const CCDHeaderPage: React.FC<Props> = (props: any) => {
    const { dataList } = props;
    const { canvasData, selectedNode } = useSelector((state: IRootActions) => state);
    const dispatch = useDispatch();

    // 保存布局
    const onSave = useCallback(() => {
        dispatch(setLoading(true));
        const param = {
            ...canvasData,
            contentData: {
                ..._.omit(_.omit(_.omit(canvasData?.contentData || {}, 'contentHeader'), 'homeSetting'), 'home'),
                content: dataList
            }
        };
        updateParams(canvasData?.id, param).then((res) => {
            if (!!res && res.code === 'SUCCESS') {
                message.success('保存成功');
                // 保存完跳到展示页
                setTimeout(() => {
                    let hash = '';
                    if (location.href?.indexOf('?') > -1) {
                        hash = location.href.split('?')[1];
                    }
                    location.href = `${location.href?.split('#/')?.[0]}#/ccd${!!hash ? `?${hash}` : ''}`;
                    window.location.reload();
                }, 500);
            } else {
                message.error(res?.message || '接口异常');
            }
            dispatch(setLoading(false));
        });
    }, [dataList, canvasData]);

    return (
        <div className="flex-box ccd-page-header-box">
            <Button
                icon={<SaveOutlined />}
                size='small'
                type="primary" onClick={onSave}>保存</Button>
        </div>
    );
};

export default CCDHeaderPage;
