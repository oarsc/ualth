import React from 'react';
import './launcher-input.css';

class InputLauncher extends React.Component {
	onSubmit = ev => {
		ev.preventDefault();
	}

	onBlur = () => {
		this.props.hideApp();
	}

	onKeyDown = ev => {
		if (ev.code === 'Escape') {
			this.props.hideApp();
		}
		if (ev.code === 'Tab') {
			ev.preventDefault();
		}
	}

	onKeyPress = ev => {
		this.loadAutocomplete(ev.target.value, ev.target.value+'__');
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
