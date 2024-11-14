import { NodeView } from '@antv/x6';

class SimpleNodeView extends NodeView {
  protected renderMarkup () {
    return this.renderJSONMarkup({
      tagName: 'rect',
      selector: 'body',
      textContent: '123123123123',
      attrs: {
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        stroke: '#31d0c6',
        strokeWidth: 3,
      },
    });
  }

  update () {
    super.update({
      body: {
        refWidth: '100%',
        refHeight: '100%',
        fill: '#aaa',
        label: {
          text: 'rect',
          fill: '#333',
          fontSize: 13,
        },
      },
    });
  }
}

export default SimpleNodeView;
