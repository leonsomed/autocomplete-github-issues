import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { Item } from '../Item';

describe('Item', () => {
  const props = {
    isHighlighted: false,
    onSelect: jest.fn(),
    item: {
      id: 1,
      title: 'title',
      isOpen: true,
      labels: [
        {
          id: 1,
          name: 'label',
          color: '#fff',
        },
      ],
    },
  };

  it('calls onSelect when clicking the item', () => {
    const { getByRole } = render(<Item {...props} />);
    fireEvent.click(getByRole('option'));
    expect(props.onSelect).toHaveBeenCalled();
  });

  it('renders title', () => {
    const { getByText } = render(<Item {...props} />);
    expect(getByText('title')).toBeVisible();
  });

  it('renders labels', () => {
    const { getByText } = render(<Item {...props} />);
    expect(getByText('label')).toBeVisible();
  });
});
