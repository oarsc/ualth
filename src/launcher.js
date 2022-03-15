const { webFrame } = require('electron');
const { perform }  = require('./action-performer');

window.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('launcher-input')
	const { action } = form;

	form.onsubmit = ev => {
		ev.preventDefault();
		perform(action.value);
		window.top.close();
	};

	action.focus();
});