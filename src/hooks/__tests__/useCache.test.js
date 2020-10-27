import { renderHook } from '@testing-library/react-hooks';

import { useCache } from '../useCache';

describe('useCache', () => {
  it('returns a map', () => {
    const { result } = renderHook(() => useCache());
    const cache = result.current;

    cache.set('test', [1, 2, 3]);

    expect(cache.get('test')).toEqual([1, 2, 3]);
  });
});
