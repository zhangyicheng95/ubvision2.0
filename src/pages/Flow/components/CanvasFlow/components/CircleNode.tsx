import React, { memo } from 'react';
import { Handle, useStore, Position } from '@xyflow/react';

export default memo(({ id }: any) => {
    const label = useStore((s) => {
        const node: any = s.nodeLookup.get(id);

        if (!node) {
            return null;
        }

        return `position x:${parseInt(node.position.x)} y:${parseInt(
            node.position.y,
        )}`;
    });

    return (
        <>
            <div className="wrapper gradient">
                <div className="inner">{label || 'no node connected'}</div>
            </div>
            {
                // @ts-ignore
                <Handle type="target" position={Position.Left} />
            }
        </>
    );
});
