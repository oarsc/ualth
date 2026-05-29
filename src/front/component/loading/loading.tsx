import React from 'react';
import './loading.scss';

interface LoadingProperties {}

interface LoadingState {}

export default class Loading extends React.Component<LoadingProperties, LoadingState> {
  constructor(props: LoadingProperties) {
    super(props);
    this.state = {};

    // ignore mouse events:
    window.ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });
  }


  override render() {
    return (
      <div id="loading-container">
        <div id="element-1" className="block"></div>
        <div id="element-2" className="block"></div>
        <div id="element-3" className="block"></div>
      </div>
    );
  }
}
