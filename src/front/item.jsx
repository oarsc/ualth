import React from 'react';
import './item.css';
import { classNames } from './support';

class Item extends React.Component {

	onClick = ev => {
		const { item, onClick } = this.props;
		if (onClick)
			onClick(item, ev);
	}

	scrollIntoView = () => {
		this.selfRef.scrollIntoView({ block: 'center' });
	}

	render() {
		const { item, selected } = this.props;

		return (
			<div
				className={ classNames(['item', 'selected', 'arguments'], [1, selected, item.requiresParams]) }
				onClick={ this.onClick }
				ref={ ref => this.selfRef = ref } >

				<span>{ item.title }</span>
			</div>
	    );
	}
}

export default Item;
