const customGroup = (X6: any) => {
  const { Graph } = X6;
  return Graph.registerNode(
    'dag-group',
    {
      // 继承自官方给的框架
      inherit: 'react-shape'
    },
    true
  );
};
export default customGroup;
