import React from 'react';

import { Autocomplete } from './Autocomplete/Autocomplete';
import { useAutocomplete } from './Autocomplete/useAutocomplete';

export default function App() {
  const {
    error,
    items,
    text,
    onChangeText,
    onSelect,
    isPristine,
  } = useAutocomplete();

  return (
    <main role="main">
      <h1>React Issues</h1>
      <Autocomplete
        error={error}
        items={items}
        onSelect={onSelect}
        onChangeText={onChangeText}
        text={text}
        isPristine={isPristine}
      />
    </main>
  );
}
