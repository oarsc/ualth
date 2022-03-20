import React from 'react';
import './item-list.css';
import Item from './item';

const ipcRenderer = window.ipcRenderer;

class ItemList extends React.Component {
	onClickedItem = (item, ev) => {
		const result = ipcRenderer.sendSync('performId', item.id)
		if (result) this.props.hideApp();
		else document.getElementById('input').focus();
	}

	componentDidUpdate() {
		if (this.selectedItemRef)
			this.selectedItemRef.scrollIntoView();
	}

	render() {
		return (
			<div id="items" style={{ height: `${Math.min(this.props.items.length, 11) * 40 + 1}px` }}>
				{
					this.props.items.map((item, i) => {
						const itemIsSelected = i === this.props.itemSelected;
						return <Item
							key={ i }
							item={ item }
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
