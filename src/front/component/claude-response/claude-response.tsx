import React from 'react';
import './claude-response.scss';
import { ClaudeResponsePayload } from '../../../shared-models/models';

interface ClaudeResponseProperties {}

interface ClaudeResponseState {
  title: string;
  query: string;
  chunks: string[];
  status: 'loading' | 'done' | 'error';
  errorMessage?: string;
}

export default class ClaudeResponse extends React.Component<ClaudeResponseProperties, ClaudeResponseState> {
  constructor(props: ClaudeResponseProperties) {
    super(props);
    this.state = {
      title: '',
      query: '',
      chunks: [],
      status: 'loading',
    };

    window.ipcRenderer.receive('claude-response-init', (payload: ClaudeResponsePayload) => {
      this.setState({ title: payload.title, query: payload.query });
    });

    window.ipcRenderer.receive('claude-response-chunk', (chunk: string) => {
      this.setState(prev => ({ chunks: [...prev.chunks, chunk] }));
    });

    window.ipcRenderer.receive('claude-response-done', () => {
      this.setState({ status: 'done' });
    });

    window.ipcRenderer.receive('claude-response-error', (message: string) => {
      this.setState({ status: 'error', errorMessage: message });
    });

    document.addEventListener('keydown', this.handleKeyDown);
  }

  override componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.dismiss();
  };

  private dismiss = () => {
    window.ipcRenderer.send('close-window');
  };

  override render() {
    const { title, query, chunks, status, errorMessage } = this.state;
    const text = chunks.join('');

    return (
      <div className="claude-response">
        <div className="claude-response__header">
          <div className="claude-response__header-text">
            <span className="claude-response__title">{title}</span>
            <span className="claude-response__query">{query}</span>
          </div>
          <button className="claude-response__close" onClick={this.dismiss} title="Close">✕</button>
        </div>
        <pre className="claude-response__body">
          {text}
        </pre>
        <div className="claude-response__footer">
          {status === 'loading' && <span className="claude-response__spinner">Loading...</span>}
          {status === 'done' && <span className="claude-response__done">Done — press Esc to dismiss</span>}
          {status === 'error' && <span className="claude-response__error">{errorMessage ?? 'An error occurred'}</span>}
        </div>
      </div>
    );
  }
}
