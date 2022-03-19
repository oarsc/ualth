import React from 'react';
import './item.css';
import { classNames } from './support';

class Item extends React.Component {

	onClick = ev => {
		const { index, onClick } = this.props;
		if (onClick)
			onClick(index, ev);
	}

	render() {
		return (
			<div className={ classNames(['item', 'selected'], [1, this.props.selected]) } onClick={ this.onClick }>
				{ this.props.text }
			</div>
	    );
	}
}

export default Item;
