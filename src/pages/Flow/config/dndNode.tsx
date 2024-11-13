const customDndNode = (X6: any) => {
  const { Graph } = X6;
  return Graph.registerNode(
    'dnd-rect',
    {
      // 继承自官方给的框架
      inherit: 'react-shape',
      width: 80,
      height: 40,
      attr: {}
    },
    true
  );
};
export default customDndNode;
