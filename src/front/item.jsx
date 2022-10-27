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
		const { item, matchingIndexes, selected } = this.props;

		const icon = (icon => {
			if (icon.match(/https?:\/\//))
				return icon;
			return icon? `./icons/${icon}.png` : defaultIcon;
		})(item.icon);


		const title = matchingIndexes.reverse()
			.reduce((title, [startIndex, endIndex]) =>
				title.substring(0, startIndex) +'{b}'+
				title.substring(startIndex, endIndex) +'{/b}'+
				title.substr(endIndex), item.title)
			.replace(/</gm, '&lt;')
			.replace(/>/gm, '&gt;')
			.replace(/{b}(.*?){\/b}/gm, '<b>$1</b>')
			.replace(/{u}(.*?){\/u}/gm, '<u>$1</u>')
			.replace(/{s}(.*?){\/s}/gm, '<s>$1</s>')
			.replace(/{i}(.*?){\/i}/gm, '<i>$1</i>');

		return (
			<div
				className={ classNames(['item', 'selected', 'arguments'], [1, selected, item.requiresParams]) }
				onClick={ this.onClick }
				ref={ ref => this.selfRef = ref } >

				<div className='item-line'>
					<div className='icon'>
						<img src={ icon } alt=''/>
					</div>
					<span aaa={title} dangerouslySetInnerHTML={{__html: title}}></span>
				</div>

			</div>
	    );
	}
}

export default Item;
