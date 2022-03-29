import React from 'react';
import './item.css';
import { classNames } from './support';
import defaultIcon from './sources/defaultIcon.png';

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

		const icon = item.icon
			? `./icons/${item.icon}.png`
			: defaultIcon;

		return (
			<div
				className={ classNames(['item', 'selected', 'arguments'], [1, selected, item.requiresParams]) }
				onClick={ this.onClick }
				ref={ ref => this.selfRef = ref } >

				<div className='item-line'>
					<div className='icon'>
						<img src={ icon } alt=''/>
					</div>
					<span>{ item.title }</span>
				</div>

			</div>
	    );
	}
}

export default Item;
