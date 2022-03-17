import React from 'react';
import './app.css';
import InputLauncher from './launcher-input';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: false,
		};

		window.api.receive('show', () => {
			if (!this.state.visible) {
				this.setState({ visible: true });
			}
		})

	}
	hide = () => {
		this.setState({ visible: false });
		window.api.send('hide');
	}

	render() {
		if (!this.state.visible)
			return <div/>;

		return (
			<>
				<InputLauncher hideApp = { this.hide }/>				
			</>
		);
	}
}


export default App;
