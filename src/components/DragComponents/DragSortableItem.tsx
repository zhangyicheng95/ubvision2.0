import React from 'react';
import { useDrag } from 'react-dnd';

const ItemTypes = {
	BOX: 'box',
};

function DraggableBox(props: any) {
	const { children, onDragStart, item, ...rest } = props
	const [{ isDragging }, drag] = useDrag(() => ({
		type: ItemTypes.BOX,
		item: item,
		collect: (monitor) => {
			!!onDragStart && onDragStart?.(monitor);
			return {
				isDragging: !!monitor.isDragging(),
			}
		},
	}), [onDragStart, item]);

	return (
		<div
			ref={drag}
			{...rest}
		>
			{children}
		</div>
	);
}
export default DraggableBox;
