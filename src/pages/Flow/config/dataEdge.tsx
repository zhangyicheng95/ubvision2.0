const customEdge = (X6: any) => {
  const { Graph, Markup } = X6;
  return Graph.registerEdge(
    'dag-edge',
    {
      inherit: 'edge',
      // connector: {
      //   name: 'jumpover',  // normal:简单连接器; smooth:平滑连接器; rounded:圆角连接器; jumpover:跳线连接器
      //   args: {
      //     // type: 'cubic',
      //     size: 10,
      //   },
      // },
      attrs: {
        line: {
          stroke: '#1c5050',
          strokeWidth: 3,
          sourceMarker: 'block',
          targetMarker: {
            name: 'classic',
          },
        },
      },
      zIndex: 0,
    },
    true
  );
};
export default customEdge;
