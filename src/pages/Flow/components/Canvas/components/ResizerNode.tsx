import { memo } from 'react';
import { Position, NodeResizer, Handle } from '@xyflow/react';

function ResizerNode({ data }: any) {
    return (
        <>
            <NodeResizer minWidth={50} minHeight={50} />
            { // @ts-ignore
                <Handle type="target" position={Position.Left} />
            }
            <div style={{ padding: 10 }}>{data.label}</div>
            <div
                style={{
                    display: 'flex',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    justifyContent: 'space-evenly',
                    left: 0,
                }}
            >
                { // @ts-ignore
                    <Handle
                        style={{ position: 'relative', left: 0, transform: 'none' }}
                        id="a"
                        type="source"
                        position={Position.Bottom}
                    />
                }
                { // @ts-ignore
                    <Handle
                        style={{ position: 'relative', left: 0, transform: 'none' }}
                        id="b"
                        type="source"
                        position={Position.Bottom}
                    />
                }
            </div>
        </>
    );
}

export default memo(ResizerNode);