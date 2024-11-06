import React, { memo } from 'react';
import { Handle, useReactFlow, Position } from '@xyflow/react';
import TooltipDiv from '@/components/TooltipDiv';

const CustomNode = (props: any) => {
    const { id, data } = props;
    console.log(props);

    return (
        <div className='custom-node'>
            <div className="flex-box node-top">
                <TooltipDiv
                    id={`algoNode_${data.id}_name`}
                    title={`${data?.renameInfo || data?.alias || data?.name}`}
                    style={{
                        fontSize: 40,
                        fontWeight: 800,
                        // color: '#fff',
                        // color: pluginsNameIcon[data.category]?.color,
                    }}
                >
                    {`${data?.renameInfo || data?.alias || data?.name}`}
                </TooltipDiv>
            </div>
            <div className="node-content flex-box">
                <div className="flex-box-justify-between center">
                    <TooltipDiv
                        style={{
                            fontSize: 24,
                            opacity: 0.6,
                            marginRight: 16,
                        }}
                    >
                        {name}
                    </TooltipDiv>
                    <div
                        style={{
                            // color: borderColor,
                            marginRight: 4,
                        }}
                    >
                        {data?.customId?.split('node_')[1]}
                    </div>
                </div>
            </div>
            { // @ts-ignore
                <Handle type="target" position={Position.Top} />
            }
        </div>
    );
}

export default memo(CustomNode);