const customNode = (X6: any) => {
  const { Graph, Markup } = X6;
  return Graph.registerNode(
    'dag-node',
    {
      // 继承自官方给的框架
      inherit: 'react-shape',
      // width: archSize.nodeWidth,
      // height: archSize.nodeHeight,
      portMarkup: [Markup.getForeignObjectMarkup()],
      attr: {},
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              fo: {
                r: 6,
                magnet: true,
                // stroke: '#C2C8D5',
                strokeWidth: 1,
                fill: '#fff'
              }
            }
          },
          bottom: {
            position: 'bottom',
            attrs: {
              fo: {
                r: 6,
                magnet: true,
                // stroke: '#C2C8D5',
                strokeWidth: 1,
                fill: '#fff'
              }
            }
          }
        }
      }
    },
    true
  );
};
export default customNode;
