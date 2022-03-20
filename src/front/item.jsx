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
		this.selfRef.scrollIntoView({block: "center"});
	}

	render() {
		return (
			<div
				className={ classNames(['item', 'selected'], [1, this.props.selected]) }
				onClick={ this.onClick }
				ref={ ref => this.selfRef = ref } >

				{ this.props.item.key }
			</div>
	    );
	}
}

export default Item;
