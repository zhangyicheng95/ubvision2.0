import React, { useMemo, useRef } from 'react';
import { useDrop } from 'react-dnd';

const ItemTypes = {
  BOX: 'box',
};

function DropZone(props: any) {
  const { children, onDragEnd = null, target, style, ...rest } = props

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.BOX,
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop(); // 检查是否已经在嵌套的Drop目标中处理过drop
      if (didDrop) {
        return;
      };
      !!onDragEnd && onDragEnd(item, target); // 调用处理函数并将拖拽的项目和悬停目标传入
    },
    collect: (monitor) => {
      return {
        isOver: !!monitor.isOver(),
      }
    },
  }), [onDragEnd, target]);

  return (
    <div
      ref={drop}
      style={{
        backgroundColor: isOver ? '#88db57' : '',
        ...style
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default DropZone;