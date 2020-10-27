import { useRef } from 'react';

export function useCache() {
  const ref = useRef(new Map());
  return ref.current;
}
