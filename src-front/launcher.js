const { webFrame } = require('electron');
const { perform, matches }  = require('./action-performer');
const ANIMATION_TIME = 100;

window.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('launcher-input')
	const { action } = form;

	form.onsubmit = ev => {
		close();
		ev.preventDefault();
		perform(action.value);
	};

	action.onblur = _ => close;

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

	setVisible(true);
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

	function close() {
		setVisible(false).then(() => window.top.close())
	}

	function setVisible(value) {
		const opacityValue = value? 1 : 0;
		return action.animate({opacity:opacityValue}, ANIMATION_TIME).finished
			.then(() => action.style.opacity=opacityValue);
	}
});
