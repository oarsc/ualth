import React from 'react';
import './launcher-input.css';

const ipcRenderer = window.ipcRenderer;

class InputLauncher extends React.Component {
	onSubmit = ev => {
		this.props.onSubmitForm(ev.target.action.value, ev);
	}

	onKeyDown = ev => {
		if (ev.code === 'Escape') {
			ev.preventDefault();
			this.props.hideApp();

		} else if (ev.code === 'Tab') {
			ev.preventDefault();

			const words = ev.target.value.split(' ');
			const lastWord = ipcRenderer.sendSync('autocomplete', words.splice(-1)[0]);
			words.push(lastWord);

			ev.target.value = words.join(' ');
			ev.target.selectionStart = ev.target.selectionEnd;
			this.onKeyPress(ev);

		} else {
			const funcName = (code =>
				code === 'ArrowUp'
					? 'findAndSelectPrevItem'
					: code === 'ArrowDown'
						? 'findAndSelectNextItem'
						: false
				)(ev.code);

			if (funcName) {
				ev.preventDefault();
				const item = this.props[funcName]();
				if (item) {

					const value = (({ selectionStart, selectionEnd, value }) =>
						selectionStart === selectionEnd
							? value
							: value.substr(0,selectionStart)
					)(ev.target);

					this.loadAutocomplete(value, item.keyword);
				}
			} else if (ev.key.length === 1 && !ev.ctrlKey) {
				const { selectionStart, selectionEnd, value } = ev.target;
				ev.target.value = value.substr(0,selectionStart) + value.substr(selectionEnd);
				ev.target.selectionStart = ev.target.selectionEnd = selectionStart;
			}
		}
	}

	onKeyPress = ev => {
		const { selectionStart, value } = ev.target;
		if (value) {
			if (selectionStart !== value.length) {
				this.props.loadItems(value);

			} else {
				const firstItem = this.props.loadItems(value, 0);
				if (firstItem && ev.nativeEvent.inputType !== 'deleteContentBackward') {
					this.loadAutocomplete(value, firstItem.keyword);
				}
			}
		} else {
			this.props.clearItems();
		}
	}

	loadAutocomplete(nonSelected, fullText) {
		if (this.canAutocomplete(nonSelected, fullText)) {
			this.input.value = nonSelected + fullText.substr(nonSelected.length);
			this.input.setSelectionRange(nonSelected.length, fullText.length);
		} else {
			this.input.value = nonSelected;
		}
	}

	canAutocomplete(nonSelected, fullText) {
		return fullText.toLowerCase().indexOf(nonSelected.toLowerCase()) === 0;
	}

	render() {
		return (
			<form id="launcher-input" onSubmit={ this.onSubmit }>
				<input autoFocus
					id="input"
					type="text"
					name="action"
					onChange={ this.onKeyPress }
					onKeyDown={ this.onKeyDown }
					ref={ input => this.input = input } />
			</form>
	    );
	}
}

export default InputLauncher;
