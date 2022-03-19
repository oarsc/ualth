import React from 'react';
import './app.css';
import InputLauncher from './launcher-input';
import Item from './item';

const ipcRenderer = window.ipcRenderer;
const COMMANDS = ipcRenderer.sendSync('commands');

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: false,
			items: [],
			itemSelected: -1,
		};

		ipcRenderer.receive('show', () => {
			if (!this.state.visible) {
				this.setState({
					visible: true,
					items: [],
					itemSelected: -1,
				});
			}
		});
	}

	hide = () => {
		this.setState({ visible: false });
		ipcRenderer.send('hide');
	}

	loadItems = (text, select = -1) => {
		const items = text.indexOf(' ') < 0
			? Object.keys(COMMANDS).filter(key => key.indexOf(text) === 0)
			: [];

		this.setState({ items: items, itemSelected: select });
		if (select >= 0)
			return items[select];
	}

	selectNext = ev => {
		const { items, itemSelected } = this.state;
		const nextSelect = itemSelected+1;
		if (items.length > nextSelect) {
			this.setState({ itemSelected: nextSelect });
			return items[nextSelect];
		}
		return false;
	}
	selectPrev = ev => {
		const { items, itemSelected } = this.state;
		const nextSelect = itemSelected-1;
		if (nextSelect >= 0) {
			this.setState({ itemSelected: nextSelect });
			return items[nextSelect];
		}
		return false;
	}

	onClickedItem = (index, ev) => {
		this.onSubmit(this.state.items[index], ev);
	}

	onSubmit = (action, ev) => {
		this.hide();
		ev.preventDefault();
		console.log(`PERFORM "${action}"`);
		ipcRenderer.send('perform', action);
	}

	render() {
		if (!this.state.visible)
			return <div/>;

		return (
			<div id="app">
				<InputLauncher
					hideApp={ this.hide }
					loadItems={ this.loadItems }
					findAndSelectNextItem={ this.selectNext }
					findAndSelectPrevItem={ this.selectPrev }
					onSubmit={ this.onSubmit } />

				<div id="items">
					{
						this.state.items.map((item, i) =>
							<Item
								key={i}
								index={i}
								text={ item }
								selected={ i === this.state.itemSelected }
								onClick={ this.onClickedItem } />
						)
					}
				</div>
			</div>
		);
	}
}


export default App;
