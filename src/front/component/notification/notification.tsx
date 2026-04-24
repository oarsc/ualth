import React from 'react';
import './notification.scss';
import { NotificationPayload } from '../../../shared-models/models';

interface NotificationProperties {}

interface NotificationState {
  title: string,
  body: string,
  severity: 'info' | 'success' | 'warning' | 'error',
  duration: number,
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
    };

    window.ipcRenderer.receive('show-notification', (payload: NotificationPayload) => {
      this.setState({
        title: payload.title,
        body: payload.body,
        severity: payload.severity ?? 'info',
        duration: payload.duration ?? 3000,
      });
    });
  }

  override componentDidUpdate(_prevProps: NotificationProperties, prevState: NotificationState) {
    if (!prevState.body && this.state.body) {
      this.dismissTimer = setTimeout(() => this.dismiss(), this.state.duration);
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
    window.ipcRenderer.send('close-notification');
  };

  override render() {
    const body = this.state.body;
    if (!body) return null;

    return (
      <div
        className={`notification notification--${ this.state.severity }`}
        onClick={this.dismiss}
      >
        <div className="notification__title">{ this.state.title }</div>
        <div className="notification__body">{ body }</div>
      </div>
    );
  }
}
