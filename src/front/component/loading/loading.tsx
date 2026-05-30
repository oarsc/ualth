import React from 'react';
import './loading.scss';

interface LoadingProperties {}

interface LoadingState {
    hidden: boolean,
}

export default class Loading extends React.Component<LoadingProperties, LoadingState> {
  constructor(props: LoadingProperties) {
    super(props);
    this.state = {
      hidden: true,
    };

    // ignore mouse events:
    window.ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });

    window.ipcRenderer.receive('stop-loading', () => {
      this.setState({ hidden: true });
      setTimeout(() => window.ipcRenderer.send('close-window'), 500)
    });
  }

  override componentDidMount() {
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        this.setState({ hidden: false })
      )
    );
  }

  override render() {
    return (
      <div id="loading-container" className={ this.state.hidden? 'hidden': '' }>
        <div id="centered">
          <span className="loader"></span>
        </div>
      </div>
    );
  }
}
