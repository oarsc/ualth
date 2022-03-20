import React from 'react';
import './launcher-input.css';

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
			ev.target.selectionStart = ev.target.selectionEnd;
			this.onKeyPress(ev);

		} else {
			let funcName = false;
			if (ev.code === 'ArrowUp')
				funcName = 'findAndSelectPrevItem';
			else if (ev.code === 'ArrowDown')
				funcName = 'findAndSelectNextItem';

			if (funcName) {
				ev.preventDefault();
				const item = this.props[funcName]();
				if (item) {

					const value = (({ selectionStart, selectionEnd, value }) =>
						selectionStart === selectionEnd
							? value
							: value.substr(0,selectionStart)
					)(ev.target);

					this.loadAutocomplete(value, item.key);
				}
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
					this.loadAutocomplete(value, firstItem.key);
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
