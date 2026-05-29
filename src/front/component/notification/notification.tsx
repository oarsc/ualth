import React from 'react';
import './notification.scss';
import { NotificationPayload } from '../../../shared-models/models';

interface NotificationProperties {}

interface NotificationState {
  title: string,
  body: string,
  severity: 'info' | 'success' | 'warning' | 'error',
  duration: number,
  hidden: boolean,
}

export default class Notification extends React.Component<NotificationProperties, NotificationState> {
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: NotificationProperties) {
    super(props);
    this.state = {
      title: '',
      body: '',
      severity: 'info',
      duration: 3000,
      hidden: true
    };

    window.ipcRenderer.receive('show-notification', (payload: NotificationPayload) => {
      this.setState({
        title: payload.title,
        body: payload.body,
        severity: payload.severity ?? 'info',
        duration: payload.duration ?? 3000 * 1,
      });
    });
  }

  override componentDidUpdate(_prevProps: NotificationProperties, prevState: NotificationState) {
    if (!prevState.body && this.state.body) {
      this.dismissTimer = setTimeout(() => this.dismiss(), this.state.duration);

      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          this.setState({ hidden: false })
        )
      );
    }
  }

  override componentWillUnmount() {
    if (this.dismissTimer !== null) clearTimeout(this.dismissTimer);
  }

  dismiss = () => {
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }

    this.setState({ hidden: true })
    setTimeout(() => window.ipcRenderer.send('close-window'), 400)
  };

  override render() {
    const body = this.state.body;
    if (!body) return null;

    return (
      <div
        className={`notification notification--${ this.state.severity }${ this.state.hidden? ' hidden': '' }`}
        onClick={this.dismiss}
      >
        <div className="notification__title">{ this.state.title }</div>
        <div className="notification__body">{ body }</div>
      </div>
    );
  }
}
