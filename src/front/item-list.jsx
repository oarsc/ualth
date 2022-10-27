import React from 'react';
import './item-list.css';
import Item from './item';
import { NUM_VISIBLE_ITEMS, ITEM_HEIGHT } from './constants-conf';

const ipcRenderer = window.ipcRenderer;

class ItemList extends React.Component {
	onClickedItem = (item, ev) => {
		const result = ipcRenderer.sendSync('perform', item.id, '');
		if (result) this.props.hideApp();
		else document.getElementById('input').focus();
	}

	componentDidUpdate() {
		if (this.selectedItemRef)
			this.selectedItemRef.scrollIntoView();
	}

	render() {
		return (
			<div id="items" style={{ height: `${Math.min(this.props.items.length, NUM_VISIBLE_ITEMS) * ITEM_HEIGHT}px` }}>
				{
					this.props.items.map((item, i) => {
						const itemIsSelected = i === this.props.itemSelected;
						return <Item
							key={ i }
							item={ item.value }
							matchingIndexes={ item.matchingIndexes }
							selected={ itemIsSelected }
							ref={ ref => { if (itemIsSelected) this.selectedItemRef = ref } }
							onClick={ this.onClickedItem } />;
					})
				}
			</div>
		);
	}
}

export default ItemList;
