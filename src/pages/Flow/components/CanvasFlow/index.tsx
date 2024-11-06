import React, { useEffect, useCallback, useRef, useState, useMemo, memo } from 'react';
import { Button, Form, message, Input, AutoComplete } from 'antd';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import {
  ReactFlowProvider,
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  nodes as initialNodes,
  edges as initialEdges,
} from './components/initial-elements';
import AnnotationNode from './components/AnnotationNode';
import ToolbarNode from './components/ToolbarNode';
import ResizerNode from './components/ResizerNode';
import CircleNode from './components/CircleNode';
import TextNode from './components/TextNode';
import CustomNode from './components/CustomNode';
import ButtonEdge from './components/ButtonEdge';
import { guid } from '@/utils/utils';
import { useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';

const nodeTypes = {
  annotation: AnnotationNode,
  tools: ToolbarNode,
  resizer: ResizerNode,
  circle: CircleNode,
  textinput: TextNode,
  custom: CustomNode,
};

const edgeTypes = {
  button: ButtonEdge,
};

const nodeClassName = (node: any) => node.type;

interface Props { }

const CanvasFlow: React.FC<Props> = (props: any) => {
  const { canvasData, canvasStart } = useSelector((state: IRootActions) => state);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  // const [elements, setElements] = useState(initialElements);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds))
  }, []);

  const onDragOver = (event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: any) => {
    event.preventDefault();
    const reactFlowBounds = event.target.getBoundingClientRect();
    const nodeData = event.dataTransfer.getData('application/reactflow');
    console.log(event);

    console.log(reactFlowBounds);

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };
    const newNode = {
      id: guid(),
      type: 'custom',
      position,
      data: JSON.parse(nodeData || "{}"),
    };

    setNodes((nds) => nds.concat(newNode));
  };

  useEffect(() => {
    console.log(canvasData);

  }, [JSON.stringify(canvasData)]);

  return (
    <div className={`flex-box-column ${styles.canvasPage}`}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={(event: any, node: any) => {
            console.log(event, node);

          }}
          onNodeDoubleClick={() => { }}
          onNodeContextMenu={() => { }}
          onNodeMouseMove={() => { }}
          // fitView
          attributionPosition="top-right"
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          className="overview"
        >
          <MiniMap zoomable pannable nodeClassName={nodeClassName} />
          <Controls />
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default memo(CanvasFlow);
