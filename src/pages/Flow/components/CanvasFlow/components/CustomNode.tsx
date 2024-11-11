import React, { memo, useEffect } from 'react';
import { Handle, useReactFlow, Position, NodeResizer, NodeToolbar } from '@xyflow/react';
import TooltipDiv from '@/components/TooltipDiv';

const nodeBaseStyle = {
    background: "#0FA9CC",
    width: '24px',
    height: '16px',
    borderRadius: 0
};

const nodeLeftTopStyle = {
    ...nodeBaseStyle,

};

const CustomNode = (props: any) => {
    const { id, data, isConnectable } = props;
    useEffect(() => {
        
    }, [JSON.stringify(props)]);

    return (
        <div className='custom-node'>
            <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
                <button>delete</button>
                <button>copy</button>
                <button>expand</button>
            </NodeToolbar>
            <NodeResizer minWidth={140} minHeight={40} />
            { // @ts-ignore
                <Handle type="target" id="a" position={Position.Top} style={{ ...nodeLeftTopStyle, left: 10 }} />
            }
            { // @ts-ignore
                <Handle
                    type="target"
                    position={Position.Left}
                    id="lt"
                    style={{ ...nodeLeftTopStyle, top: 40 }}
                    isConnectable={isConnectable}
                />
            }
            { // @ts-ignore
                <Handle type="target" id="c" position={Position.Top} style={{ ...nodeLeftTopStyle, left: 40 }} />
            }
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
                <Handle
                    style={{ position: 'relative', left: 0, transform: 'none' }}
                    id="d"
                    type="source"
                    position={Position.Bottom}
                />
            }
            { // @ts-ignore
                <Handle
                    style={{ position: 'relative', left: 0, transform: 'none' }}
                    id="e"
                    type="source"
                    position={Position.Bottom}
                />
            }
        </div>
    );
}

export default memo(CustomNode);