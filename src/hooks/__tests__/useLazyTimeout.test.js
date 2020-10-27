import { renderHook } from '@testing-library/react-hooks';
import wait from 'waait';

import { useLazyTimeout } from '../useLazyTimeout';

describe('useLazyTimeout', () => {
  let setLazyTimeout;
  let hook;

  beforeEach(() => {
    hook = renderHook(() => useLazyTimeout());
    setLazyTimeout = hook.result.current;
  });

  it('clears pending timeout when component unmounts', async () => {
    const mockFn = jest.fn((x) => x);

    setLazyTimeout(mockFn, 100);
    hook.unmount();
    await wait(100);

    expect(mockFn).not.toHaveBeenCalled();
  });

  it('clears previous timeout when invoking a new timeout', async () => {
    const mockFn1 = jest.fn((x) => x);
    const mockFn2 = jest.fn((x) => x);

    setLazyTimeout(mockFn1, 100);
    setLazyTimeout(mockFn2, 100);
    await wait(100);

    expect(mockFn1).not.toHaveBeenCalled();
    expect(mockFn2).toHaveBeenCalled();
  });

  it('calls function when X ms have elapsed', async () => {
    const mockFn = jest.fn((x) => x);

    setLazyTimeout(mockFn, 100);
    await wait(100);

    expect(mockFn).toHaveBeenCalled();
  });
});
