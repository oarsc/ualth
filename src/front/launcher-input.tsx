import React from 'react';
import { Command } from '../shared-models/models';
import './launcher-input.css';

const ipcRenderer = window.ipcRenderer;

interface InputLauncherProperties {
  hideApp: () => void,
  loadItems: (text: string, select?: number) => Command | undefined,
  clearItems: (hide?: boolean) => void,
  findAndSelectNextItem: () => Command | undefined,
  findAndSelectPrevItem: () => Command | undefined,
  onSubmitForm: (inputText: string, ev: Event) => void,
}

interface InputLauncherState { }

export default class InputLauncher extends React.Component<InputLauncherProperties, InputLauncherState> {

  input!: HTMLInputElement;

  onSubmit = (ev: React.FormEvent) => {
    this.props.onSubmitForm(this.input.value, ev.nativeEvent);
  }

  onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.code === 'Escape') {
      ev.preventDefault();
      this.props.hideApp();

    } else if (ev.code === 'Tab') {
      ev.preventDefault();

      const words = this.input.value.split(' ');
      const lastWord = ipcRenderer.sendSync<string>('resolve', words.splice(-1)[0]);
      words.push(lastWord);

      this.input.value = words.join(' ');
      this.input.selectionStart = this.input.selectionEnd;
      this.onKeyPress(ev);

    } else {
      const selectFunction = (() => 
        ev.code === 'ArrowUp'
          ? this.props.findAndSelectPrevItem
          : ev.code === 'ArrowDown'
            ? this.props.findAndSelectNextItem
            : undefined
        )();

      if (selectFunction) {
        ev.preventDefault();
        const item = selectFunction();
        if (item) {

          const value = (({ selectionStart, selectionEnd, value }) =>
            selectionStart === selectionEnd
              ? value
              : value.substring(0, selectionStart ?? 0)
          )(this.input);

          this.loadAutocomplete(value, item.keyWord);
        }
      } else if (ev.key.length === 1 && !ev.ctrlKey) {
        const { selectionStart, selectionEnd, value } = this.input;
        this.input.value = value.substring(0, selectionStart ?? 0) + value.substring(selectionEnd ?? 0);
        this.input.selectionStart = this.input.selectionEnd = selectionStart;
      }
    }
  }

  onKeyPress = (ev: React.SyntheticEvent) => {
    const { selectionStart, value } = this.input;
    if (value) {
      if (selectionStart !== value.length) {
        this.props.loadItems(value, 0);

      } else {
        const firstItem = this.props.loadItems(value, 0);
        const nativeInputEvent = ev.nativeEvent as InputEvent;
        if (firstItem && nativeInputEvent.inputType !== 'deleteContentBackward') {
          this.loadAutocomplete(value, firstItem.keyWord);
        }
      }
    } else {
      this.props.clearItems();
    }
  }

  private loadAutocomplete(nonSelectedText: string, fullText: string) {
    if (this.canAutocomplete(nonSelectedText, fullText)) {
      this.input.value = nonSelectedText + fullText.substr(nonSelectedText.length);
      this.input.setSelectionRange(nonSelectedText.length, fullText.length);
    } else {
      this.input.value = nonSelectedText;
    }
  }

  private canAutocomplete(nonSelectedText: string, fullText: string) {
    return fullText.toLowerCase().indexOf(nonSelectedText.toLowerCase()) === 0;
  }

  override render(): JSX.Element {
    return (
      <form id="launcher-input" onSubmit={ this.onSubmit }>
        <input autoFocus
          id="input"
          type="text"
          name="action"
          onChange={ this.onKeyPress }
          onKeyDown={ this.onKeyDown }
          ref={ input => this.input = input! } />
      </form>
      );
  }
}
