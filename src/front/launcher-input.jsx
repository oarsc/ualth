import React from 'react';
import './launcher-input.css';

class InputLauncher extends React.Component {
	onSubmit = ev => {
		this.props.onSubmit(ev.target.action.value, ev);
	}

	onBlur = () => {
		this.props.hideApp();
	}

	onKeyDown = ev => {
		if (ev.code === 'Escape') {
			this.props.hideApp();
			ev.preventDefault();

		} else if (ev.code === 'Tab') {
			ev.preventDefault();

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

					this.loadAutocomplete(value, item);
				}
			}
		}
	}

	onKeyPress = ev => {
		const { selectionStart, value } = ev.target;
		if (value) {
			if (ev.nativeEvent.inputType === 'deleteContentBackward' || selectionStart !== value.length) {
				this.props.loadItems(value);

			} else {
				const firstItem = this.props.loadItems(value, 0);
				if (firstItem)
					this.loadAutocomplete(value, firstItem);
			}
		}
	}

	loadAutocomplete = (nonSelected, fullText) => {
		this.input.value = fullText;
		this.input.setSelectionRange(nonSelected.length, fullText.length);
	}

	render() {
		return (
			<form id="launcher-input" onSubmit={ this.onSubmit }>
				<input autoFocus
					type="text"
					name="action"
					onBlur={ this.onBlur }
					onChange={ this.onKeyPress }
					onKeyDown={ this.onKeyDown }
					ref={ input => this.input = input } />
			</form>
	    );
	}
}

export default InputLauncher;
