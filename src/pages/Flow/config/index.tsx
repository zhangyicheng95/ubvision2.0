import customEdge from './dataEdge';
import customNode from './dataNode';
import customGroup from './dataGroup';
import customDndNode from './dndNode';
import edgeConnector from './edgeConnector';

export default (X6: any) => {
  customNode(X6);
  customEdge(X6);
  customDndNode(X6);
  edgeConnector(X6);
  customGroup(X6);
};
