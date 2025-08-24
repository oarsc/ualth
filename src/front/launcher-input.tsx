import React from 'react';
import { Command, HistoryElementReturn, FileBlob} from '../shared-models/models';
import './launcher-input.scss';

const ipcRenderer = window.ipcRenderer;

interface InputLauncherProperties {
  hideApp: () => void,
  loadItems: (text: string, select?: number | string) => Command | undefined,
  clearItems: (hide?: boolean) => void,
  findAndSelectNextItem: () => Command | undefined,
  findAndSelectPrevItem: () => Command | undefined,
  onSubmitForm: (inputText: string, blobs: Record<string, string | FileBlob>, ev: Event, keepHistory: boolean) => void,
}

interface InputLauncherState { }

export default class InputLauncher extends React.Component<InputLauncherProperties, InputLauncherState> {

  input!: HTMLInputElement;
  historyIndex = -1;
  blobs: Record<string, string | FileBlob> = {};

  private onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.code === 'NumpadEnter') {
      this.submit(ev.nativeEvent, false);
    } else if (ev.code === 'Enter') {
      this.submit(ev.nativeEvent, true);
    } else if (ev.code === 'Escape') {
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

    } else if (ev.code === 'ArrowUp' || ev.code === 'ArrowDown') {
      ev.preventDefault();

      if (ev.shiftKey) {

        if (ev.code === 'ArrowUp') {

          let value = this.input.value;
          if (this.input.selectionStart != undefined) {
            value = value.substring(0, this.input.selectionStart);
          }

          const historyString = ipcRenderer.sendSync<HistoryElementReturn | undefined>('history', this.historyIndex, true, value);

          if (historyString) {
            this.historyIndex = historyString.returnedIndex;
            this.blobs = historyString.blobs;
            this.loadAutocomplete(value, historyString.inputText);
            this.props.loadItems(historyString.inputText, historyString.commandId);
          }
        } else if (this.historyIndex >= 0) {

          let value = this.input.value;
          if (this.input.selectionStart != undefined) {
            value = value.substring(0, this.input.selectionStart);
          }

          const historyString = ipcRenderer.sendSync<HistoryElementReturn | undefined>('history', this.historyIndex, false, value);
          if (historyString) {
            this.historyIndex = historyString.returnedIndex;
            this.blobs = historyString.blobs;
            this.loadAutocomplete(value, historyString.inputText);
            this.props.loadItems(historyString.inputText, historyString.commandId);
          } else {
            this.historyIndex = -1;
            this.blobs = {};
            this.input.value = value;
            this.props.clearItems();
          }
        }

      } else {
        const item = ev.code === 'ArrowUp'
          ? this.props.findAndSelectPrevItem()
          : this.props.findAndSelectNextItem();

        if (item) {
          const value = (({ selectionStart, selectionEnd, value }) =>
            selectionStart === selectionEnd
              ? value
              : value.substring(0, selectionStart ?? 0)
          )(this.input);

          this.loadAutocomplete(value, item.keyWord);
        }
      }

    } else if (ev.shiftKey && ev.code === 'Delete') {
      ev.preventDefault();
      if (this.historyIndex >= 0) {
        ipcRenderer.send('removeHistory', this.historyIndex);
        
        const value = (({ selectionStart, selectionEnd, value }) =>
          selectionStart === selectionEnd
            ? value
            : value.substring(0, selectionStart ?? 0)
        )(this.input);

        const historyString = ipcRenderer.sendSync<HistoryElementReturn | undefined>('history', this.historyIndex, false, value);

        if (historyString) {
          this.historyIndex = historyString.returnedIndex;
          this.blobs = historyString.blobs;
          this.loadAutocomplete(value, historyString.inputText);
          this.props.loadItems(historyString.inputText, historyString.commandId);
        } else {
          this.historyIndex = -1;
          this.blobs = {};
          this.input.value = value;
          this.props.clearItems();
        }
      }
    } else if (ev.key.length === 1 && !ev.ctrlKey) {
      this.historyIndex = -1;
      const { selectionStart, selectionEnd, value } = this.input;
      this.input.value = value.substring(0, selectionStart ?? 0) + value.substring(selectionEnd ?? 0);
      this.input.selectionStart = this.input.selectionEnd = selectionStart;
    }
  }

  private onKeyPress = (ev: React.SyntheticEvent) => {
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

  private onPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.kind === "file") {
        event.preventDefault();
        event.stopPropagation();

        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            // reader.result is something like: "data:image/png;base64,iVBORw0KG..."
            const base64Data = (reader.result as string).split(",")[1];

            const key = `[BLOB#${Object.keys(this.blobs).length}: ${file.type}]`;

            this.blobs[key] = {
              filename: file.name,
              path: file.path? file.path : undefined,
              type: file.type,
              base64: base64Data
            };
            this.pasteTextToInput(key);
          };

          reader.readAsDataURL(file);
        }
      } else if (item.kind === "string" && item.type === "text/plain") {
        event.preventDefault();
        event.stopPropagation();

        item.getAsString((str) => {
          if (str.indexOf('\n') >= 0) {
            const key = `[BLOB#${Object.keys(this.blobs).length}: text/plain]`
            this.blobs[key] = str;
            this.pasteTextToInput(key);
          } else {
            this.pasteTextToInput(str);
          }
        });
      }
    }
  }

  private pasteTextToInput(text: string) {
    const { selectionStart, selectionEnd, value } = this.input;
    const newValue = value.substring(0, selectionStart ?? 0) + text + value.substring(selectionEnd ?? 0);
    this.input.value = newValue;
    const cursorPos = (selectionStart ?? 0) + text.length;
    this.input.selectionStart = this.input.selectionEnd = cursorPos;
    this.props.loadItems(newValue, 0);
  }

  private submit(event: Event, keepHistory: boolean) {
    const text = this.input.value;

    const existingBlobs = Object.entries(this.blobs)
      .filter(([key, _]) => text.indexOf(key) >= 0)
      .reduce((obj, [key, val]) => { obj[key] = val; return obj;}, {} as Record<string, string | FileBlob>);

    this.props.onSubmitForm(text, existingBlobs, event, keepHistory);

    this.blobs = {};
  }

  private loadAutocomplete(nonSelectedText: string, fullText: string) {
    if (this.canAutocomplete(nonSelectedText, fullText)) {
      this.input.value = nonSelectedText + fullText.substring(nonSelectedText.length);
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
      <form id="launcher-input">
        <input autoFocus
          id="input"
          type="text"
          name="action"
          onChange={ this.onKeyPress }
          onKeyDown={ this.onKeyDown }
          onPaste={ this.onPaste }
          ref={ input => this.input = input! } />
      </form>
    );
  }
}
