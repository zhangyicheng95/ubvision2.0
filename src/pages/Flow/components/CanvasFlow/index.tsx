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
  Panel,
  useReactFlow,
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
  const dom = useRef<any>(null);
  const reactFlow = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<any>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 连线
  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds))
  }, []);
  // 左侧拖拽节点进来
  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const nodeData = event.dataTransfer.getData('application/reactflow');
    const data = JSON.parse(nodeData || "{}");
    const position = reactFlow?.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const group = {
      id: guid(),
      type: 'group',
      resizable: true,
      position: {
        x: -170,
        y: 250,
      },
      style: {
        width: 380,
        height: 180,
        backgroundColor: 'rgba(208, 192, 247, 0.2)',
      },
    };
    const newNode = {
      id: guid(),
      type: 'custom',
      position,
      data,
      extent: 'parent',
    };
    setNodes((nds) => nds.concat([group, newNode]));
  }, []);
  // 节点单击
  const nodeClick = useCallback((event: any, node: any) => {
    event.preventDefault(); // 阻止默认的关闭行为
    event?.stopPropagation();

    console.log(event, node);
  }, []);
  // 节点双击
  const nodeDoubleClick = useCallback((event: any, node: any) => {
    event.preventDefault(); // 阻止默认的关闭行为
    event?.stopPropagation();

    console.log(event, node);
  }, []);
  // 空白处单击
  const canvasClick = useCallback((event: any) => {
    event.preventDefault(); // 阻止默认的关闭行为
    event?.stopPropagation();

    console.log(event);
  }, []);
  useEffect(() => {
    console.log(canvasData);

  }, [JSON.stringify(canvasData)]);

  return (
    <div className={`flex-box-column ${styles.canvasPage}`} ref={dom}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        minZoom={0.1}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={canvasClick}
        onNodeClick={nodeClick}
        onNodeDoubleClick={nodeDoubleClick}
        onNodeContextMenu={(event: any, node: any) => {
          console.log(event, node);
        }}
        fitView
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        className="overview"
      >
        <MiniMap zoomable pannable nodeClassName={nodeClassName} />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default memo(CanvasFlow);
