import React, {  } from 'react';
import { Button, message } from 'antd';
import {
    SaveOutlined,
} from '@ant-design/icons';
import * as _ from 'lodash-es';
import { updateParamsService } from '@/services/flowEditor';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setLoadingAction } from '@/redux/actions';
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
        dispatch(setLoadingAction(true));
        const param = {
            ...canvasData,
            contentData: {
                ..._.omit(_.omit(_.omit(canvasData?.contentData || {}, 'contentHeader'), 'homeSetting'), 'home'),
                content: dataList
            }
        };
        updateParamsService(canvasData?.id, param).then((res) => {
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
            dispatch(setLoadingAction(false));
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
