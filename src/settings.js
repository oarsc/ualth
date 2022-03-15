window.addEventListener('DOMContentLoaded', () => {
	function replaceText (selector, text) {
		const element = document.getElementById(selector);
		if (element) element.innerText = text;
	}

	['chrome', 'node', 'electron']
		.forEach(dependency => replaceText(`${dependency}-version`, process.versions[dependency]));
});