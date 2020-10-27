import { useCallback, useEffect, useRef } from 'react';

export function useLazyTimeout() {
  const ref = useRef();
  const _clearTiemout = useCallback(() => {
    if (ref.current) {
      clearTimeout(ref.current);
    }
  }, []);
  const _setTimeout = useCallback(
    (fn, ms) => {
      _clearTiemout();
      ref.current = setTimeout(fn, ms);
    },
    [_clearTiemout]
  );
  useEffect(() => {
    return () => _clearTiemout();
  }, [_clearTiemout]);

  return _setTimeout;
}
