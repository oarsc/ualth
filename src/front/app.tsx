import React from 'react';
import InputLauncher from './launcher-input';
import ItemList from './item-list';
import { classNames } from './support';
import { getNumVisibleItems, INPUT_HEIGHT, ITEM_HEIGHT } from './constants-conf';
import './app.css';
import { Command, PriorizedSearchResult, FileBlob } from '../shared-models/models';

const ipcRenderer = window.ipcRenderer;

interface AppProperties { }

interface AppState {
  visible: boolean,
  results: PriorizedSearchResult[],
  resultSelected: number,
  pinned: boolean,
}

export default class App extends React.Component<AppProperties, AppState> {
  private altHeldAlone = false;

  constructor(props: AppProperties) {
    super(props);

    this.state = {
      visible: false,
      results: [],
      resultSelected: -1,
      pinned: false,
    };

    ipcRenderer.receive('show', () => {
      if (!this.state.visible) {
        this.setState({
          visible: true,
          results: [],
          resultSelected: -1,
          pinned: false,
        });
        this.resizeWindow(0);
      }
    });

    ipcRenderer.receive('blur', this.onBlur);

    window.addEventListener('keydown', this.onWindowKeyDown);
    window.addEventListener('keyup', this.onWindowKeyUp);
  }

  private onWindowKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Alt') {
      if (!ev.repeat) this.altHeldAlone = true;
    } else {
      this.altHeldAlone = false;
    }
  }

  private onWindowKeyUp = (ev: KeyboardEvent) => {
    if (ev.key === 'Alt' && this.altHeldAlone) {
      this.altHeldAlone = false;
      this.setState(prevState => ({ pinned: !prevState.pinned }));
    }
  }

  private onBlur = () => {
    if (!this.state.pinned) this.hide();
  }

  resizeWindow(numItems: number) {
    const windowHeight = numItems === 0
      ? INPUT_HEIGHT
      : INPUT_HEIGHT + ITEM_HEIGHT * Math.min(numItems, getNumVisibleItems()) + 1; // +1 for border
    ipcRenderer.send('height', windowHeight);
  }

  hide = () => {
    ipcRenderer.send('hide');
    this.clearItems(true);
  }

  clearItems = (hide: boolean = false) => {
    if (hide) {
      this.setState({
        results: [],
        resultSelected: -1,
        visible: false,
        pinned: false,
      });
    } else {
      this.setState({
        results: [],
        resultSelected: -1,
      });
    }
    this.resizeWindow(0);
  }

  loadItems = (text: string, select: number | string = -1): Command | undefined => {
    const results = ipcRenderer.sendSync<Array<PriorizedSearchResult>>('find', text);

    const index = typeof select === 'string'
      ? results.findIndex(item => item.command.id === select) ?? -1
      : select;

    const canSelect = results.length > index;

    this.resizeWindow(results.length);
    this.setState({ results, resultSelected: canSelect? index : -1 });
    if (canSelect && index >= 0) {
      return results[index].command;
    }
  }

  selectNext = (): Command | undefined => {
    const { results, resultSelected } = this.state;
    const nextSelect = resultSelected + 1;
    if (results.length > nextSelect) {
      this.setState({ resultSelected: nextSelect });
      return results[nextSelect].command;
    }
  }

  selectPrev = (): Command | undefined => {
    const { results, resultSelected } = this.state;
    const nextSelect = resultSelected - 1;
    if (nextSelect >= 0) {
      this.setState({ resultSelected: nextSelect });
      return results[nextSelect].command;
    }
  }

  onSubmitForm = (inputText: string, blobs: Record<string, string | FileBlob>, keepHistory: boolean) => {
    const { results, resultSelected } = this.state;
    const result = ipcRenderer.sendSync('perform', results[resultSelected].command.id, inputText, blobs, keepHistory);
    if (result) this.hide();
  }

  hideSelection = () => {
    const { results, resultSelected } = this.state;
    ipcRenderer.send('hideCommand', results[resultSelected].command.id);

    results.splice(resultSelected, 1);
    this.resizeWindow(results.length);
    this.setState({ results, resultSelected: results.length > 0? Math.max(resultSelected - 1, 0) : -1 });
  }

  override render(): JSX.Element {
    if (!this.state.visible)
      return <div/>;

    return (
      <div id="app" className={ classNames(['itemed', 'pinned'], [this.state.results.length > 0, this.state.pinned]) }>
        <InputLauncher
          hideApp={ this.hide }
          loadItems={ this.loadItems }
          clearItems={ this.clearItems }
          findAndSelectNextItem={ this.selectNext }
          findAndSelectPrevItem={ this.selectPrev }
          onSubmitForm={ this.onSubmitForm }
          hideSelection={ this.hideSelection } />

        <ItemList
          hideApp={ this.hide }
          results={ this.state.results }
          resultSelected={ this.state.resultSelected } />
      </div>
    );
  }
}