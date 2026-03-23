import React from 'react';
import ReactDOM from 'react-dom';
import { StyleConfig } from './shared-models/models';
import { INPUT_HEIGHT, ITEM_HEIGHT, setNumVisibleItems } from './front/constants-conf';

const mode = window.init.getMode();

initialize(mode);

async function initialize(mode: string) {
  switch (mode) {
    case 'capture':
      const { default: CaptureOverlay } = await import('./front/component/capture/CaptureOverlay');

      window.ipcRenderer.receive('set-image', (imageUrl: string) => {
        ReactDOM.render(<CaptureOverlay imageUrl={imageUrl} />, document.getElementById('root'));
      });
      break;

    default:
      const { default: App } = await import('./front/app');
      
      ReactDOM.render(
        <App />,
        document.getElementById('root')
      );

      const setStyle = (key: string, value: string) => document.documentElement.style.setProperty(`--${key}`, value);
      const styles = window.ipcRenderer.sendSync<StyleConfig>('styleConfig');
      if (styles.radius !== undefined) setStyle('radius', `${styles.radius}px`);
      if (styles.background)           setStyle('background', styles.background);
      if (styles.iconColor)            setStyle('icon-color', styles.iconColor);
      if (styles.selected)             setStyle('selected', styles.selected);

      if (styles.results)              setNumVisibleItems(styles.results);

      setStyle('item-height', `${ITEM_HEIGHT}px`);
      setStyle('input-height', `${INPUT_HEIGHT}px`);
      break;
  }
}
