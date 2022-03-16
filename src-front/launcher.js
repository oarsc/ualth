const { webFrame } = require('electron');
const { perform, matches }  = require('./action-performer');

window.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('launcher-input')
	const { action } = form;

	form.onsubmit = ev => {
		ev.preventDefault();
		perform(action.value);
		window.top.close();
	};

	action.onblur = _ => {
		window.top.close();
	};

	action.onkeydown = ev => {
		if (ev.key == 'Escape') {
			window.top.close();
			return false;
		}
		action.prevValue = getWrittenValue();
		return ev.key != 'Tab';
	};

	action.onkeyup = ev => {
		if (!isLetterKey(ev))
			return;

		let val = getWrittenValue();
		if (val.length) {
			let [ firstMatch ] = matches(val);
			if (firstMatch && val !== action.prevValue) {
				setAutocomplete(val, firstMatch);
			}
		}
	};

	action.focus();


	function isLetterKey(ev) {
		return !(ev.altKey || ev.ctrlKey || ['Tab','Alt','Control','Backspace','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Home','End'].indexOf(ev.key) >= 0);
	}

	function setAutocomplete(value, full) {
		action.value = full;
		action.setSelectionRange(value.length, full.length);
	}

	function getWrittenValue() {
		const { selectionStart, selectionEnd } = action;
		if (selectionStart == selectionEnd) {
			return action.value;
		}
		return action.value.substr(0,selectionStart);
	}
});
