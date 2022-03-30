import React from 'react';
import InputLauncher from './launcher-input';
import ItemList from './item-list';
import { classNames } from './support';
import { NUM_VISIBLE_ITEMS, INPUT_HEIGHT, ITEM_HEIGHT } from './constants-conf';
import './app.css';

const ipcRenderer = window.ipcRenderer;

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
				this.resizeWindow(0);
			}
		});

		ipcRenderer.receive('blur', this.hide);
	}

	resizeWindow(numItems) {
		let windowHeight = ITEM_HEIGHT * Math.min(numItems, NUM_VISIBLE_ITEMS) + INPUT_HEIGHT;
		if (numItems > 0) windowHeight++;
		ipcRenderer.send('height', windowHeight);
	}

	hide = () => {
		ipcRenderer.send('hide');
		this.clearItems(true);
	}

	clearItems = (hide) => {
		const newState = {
			items: [],
			itemSelected: -1,
		};
		if (hide) newState.visible = false;
		this.setState(newState);
		this.resizeWindow(0);
	}

	loadItems = (text, select = -1) => {
		const items = ipcRenderer.sendSync('find', text);
		const canSelect = items.length > select;

		this.resizeWindow(items.length);
		this.setState({ items: items, itemSelected: canSelect? select : -1 });
		if (canSelect && select >= 0)
			return items[select];
	}

	selectNext = ev => {
		const { items, itemSelected } = this.state;
		const nextSelect = itemSelected + 1;
		if (items.length > nextSelect) {
			this.setState({ itemSelected: nextSelect });
			return items[nextSelect];
		}
		return false;
	}
	selectPrev = ev => {
		const { items, itemSelected } = this.state;
		const nextSelect = itemSelected - 1;
		if (nextSelect >= 0) {
			this.setState({ itemSelected: nextSelect });
			return items[nextSelect];
		}
		return false;
	}

	onClickedItem = (index, ev) => {
		this.onSubmit(this.state.items[index], ev);
	}

	onSubmitForm = (inputText, ev) => {
		ev.preventDefault();

		const { items, itemSelected } = this.state;

		const shouldSearchById = itemSelected >= 0
			? !items[itemSelected].requiresParams
			: false;

		const result = shouldSearchById
			? ipcRenderer.sendSync('performId', items[itemSelected].id)
			: ipcRenderer.sendSync('perform', inputText);

		if (result) this.hide();
	}

	render() {
		if (!this.state.visible)
			return <div/>;

		return (
			<div id="app" className={ classNames('itemed', this.state.items.length) }>
				<InputLauncher
					hideApp={ this.hide }
					loadItems={ this.loadItems }
					clearItems={ this.clearItems }
					findAndSelectNextItem={ this.selectNext }
					findAndSelectPrevItem={ this.selectPrev }
					onSubmitForm={ this.onSubmitForm } />

				<ItemList
					hideApp={ this.hide }
					items={ this.state.items }
					itemSelected={ this.state.itemSelected } />
			</div>
		);
	}
}


export default App;
