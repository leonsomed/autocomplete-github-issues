import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FiAlertCircle } from 'react-icons/fi';

function onPreventDefault(e) {
  e.preventDefault();
}

export function Item({ item, onSelect, isHighlighted }) {
  const onSelectProxy = useCallback(() => onSelect(item), [item, onSelect]);
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <li
      role="option"
      aria-selected={isHighlighted}
      className={classnames('autocomplete__item', {
        'autocomplete__item--selected': isHighlighted,
      })}
      // preventing default to allow onClick to fire before onBlur from input element
      onMouseDown={onPreventDefault}
      onClick={onSelectProxy}
    >
      <div className="autocomplete__item-row">
        <FiAlertCircle
          title={item.isOpen ? 'Open' : 'Closed'}
          className={classnames('autocomplete__icon', {
            'autocomplete__icon--open': item.isOpen,
            'autocomplete__icon--closed': !item.isOpen,
          })}
        />
        <span className="autocomplete__title">{item.title}</span>
      </div>
      <div className="autocomplete__item-row">
        {item.labels.map((label) => (
          <span
            key={label.id}
            title={label.name}
            className="autocomplete__label"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
          </span>
        ))}
      </div>
    </li>
  );
}

export const labelPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
});

export const itemPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  labels: PropTypes.arrayOf(labelPropType).isRequired,
  isOpen: PropTypes.bool.isRequired,
});

Item.propTypes = {
  item: itemPropType.isRequired,
  isHighlighted: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};
