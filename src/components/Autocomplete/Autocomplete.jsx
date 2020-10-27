import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { Item, itemPropType } from './Item';
import './Autocomplete.scss';

const KEY_CODES = {
  DOWN_ARROW: 40,
  UP_ARROW: 38,
  ENTER: 13,
  ESCAPE: 27,
};

function useAutocompleteState(items, onSelect, text) {
  const hasItems = items.length > 0;
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const onDismiss = useCallback(() => {
    if (hasItems) {
      setHighlightedIndex(-1);
      onSelect({ title: text });
    }
  }, [hasItems, setHighlightedIndex, onSelect, text]);
  const onKeyDown = useCallback(
    (e) => {
      switch (e.keyCode) {
        case KEY_CODES.DOWN_ARROW:
          setHighlightedIndex(Math.min(highlightedIndex + 1, items.length - 1));
          break;
        case KEY_CODES.UP_ARROW:
          setHighlightedIndex(Math.max(highlightedIndex - 1, 0));
          break;
        case KEY_CODES.ENTER:
          if (highlightedIndex >= 0 && items.length > highlightedIndex) {
            onSelect(items[highlightedIndex]);
          }
          setHighlightedIndex(-1);
          break;
        case KEY_CODES.ESCAPE:
          onDismiss();
          break;
        default:
          break;
      }
    },
    [highlightedIndex, onSelect, setHighlightedIndex, items, onDismiss]
  );

  return {
    onKeyDown,
    hasItems,
    highlightedIndex,
    onDismiss,
  };
}

export function Autocomplete({
  isPristine,
  error,
  items,
  onSelect,
  text,
  onChangeText,
}) {
  const {
    onDismiss,
    onKeyDown,
    hasItems,
    highlightedIndex,
  } = useAutocompleteState(items, onSelect, text);
  const hasError = !!error;

  return (
    <div className="autocomplete">
      <input
        role="combobox"
        aria-autocomplete="list"
        aria-controls="autocomplete"
        aria-expanded={hasItems}
        aria-label="Search"
        aria-invalid={hasError}
        type="text"
        className="autocomplete__search"
        placeholder="Search issues..."
        value={text}
        onChange={onChangeText}
        onKeyDown={onKeyDown}
        onBlur={onDismiss}
      />

      {hasError && (
        <div role="alert" className="autocomplete__error">
          <span>{error.message}</span>
        </div>
      )}

      {!hasError && !isPristine && hasItems && (
        <ul id="autocomplete" role="listbox" className="autocomplete__list">
          {items.map((item, i) => (
            <Item
              key={item.id}
              item={item}
              isHighlighted={highlightedIndex === i}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

Autocomplete.propTypes = {
  isPristine: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }),
  items: PropTypes.arrayOf(itemPropType).isRequired,
  text: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};
