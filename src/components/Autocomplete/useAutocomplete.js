import { useCallback, useReducer } from 'react';
import throttle from 'lodash/throttle';

import { fetchIssues, formatIssues, getRateLimits } from '../../utils/api';
import { useLazyTimeout } from '../../hooks/useLazyTimeout';
import { useCache } from '../../hooks/useCache';

const GENERIC_ERROR = {
  message: 'There was an error, please try again.',
  type: 'error',
};
const RATE_LIMIT_ERROR = {
  message: 'Please wait.',
  type: 'warning',
};

const initialState = {
  items: [],
  text: '',
  error: null,
  isPristine: true,
  hasReachedMaxLimit: false,
  rateLimitResetTime: 0,
};

const setError = (error) => ({
  type: 'setError',
  payload: { error },
});

const updateRateLimits = (rateLimitResetTime, hasReachedMaxLimit) => ({
  type: 'updateRateLimits',
  payload: { rateLimitResetTime, hasReachedMaxLimit },
});

const changeText = (text) => ({
  type: 'changeText',
  payload: { text },
});

const setItems = (items) => ({
  type: 'setItems',
  payload: { items },
});

const selectItem = (item) => ({
  type: 'selectItem',
  payload: { item },
});

function autocompleteReducer(state, action) {
  switch (action.type) {
    case updateRateLimits.name:
      return {
        ...state,
        rateLimitResetTime: action.payload.rateLimitResetTime,
        hasReachedMaxLimit: action.payload.hasReachedMaxLimit,
      };
    case setItems.name:
      return {
        ...state,
        error: null,
        items: action.payload.items,
      };
    case changeText.name:
      return {
        ...state,
        text: action.payload.text,
        isPristine: false,
      };
    case selectItem.name:
      return {
        ...state,
        text: action.payload.item.title,
        items: [],
        isPristine: true,
      };
    case setError.name:
      return {
        ...state,
        error: action.payload.error,
      };
    default:
      return state;
  }
}

export function useAutocomplete() {
  const [state, dispatch] = useReducer(autocompleteReducer, initialState);
  const setLazyTimeout = useLazyTimeout();
  const cache = useCache();
  const {
    items,
    text,
    error,
    isPristine,
    hasReachedMaxLimit,
    rateLimitResetTime,
  } = state;

  const setDismissableError = useCallback(
    (error, ms) => {
      dispatch(setError(error));
      setLazyTimeout(() => {
        dispatch(setError(null));
      }, ms);
    },
    [setLazyTimeout]
  );

  const handleRateLimit = useCallback(
    (response) => {
      const { resetTimestamp, remaining, timeUntilReset } = getRateLimits(
        response
      );
      dispatch(updateRateLimits(resetTimestamp, remaining === 0));

      if (response.status === 403) {
        setDismissableError(RATE_LIMIT_ERROR, timeUntilReset);
      }
    },
    [setDismissableError]
  );

  const onSearch = useCallback(
    async (text) => {
      try {
        if (!text) {
          dispatch(setItems([]));
          return;
        }

        const cachedItems = cache.get(text);

        if (cachedItems) {
          dispatch(setItems(cachedItems));
          return;
        }

        const timeUntilReset = rateLimitResetTime - Date.now();

        if (timeUntilReset > 0 && hasReachedMaxLimit) {
          if (!error) {
            setDismissableError(RATE_LIMIT_ERROR, timeUntilReset);
          }
          return;
        }

        const { response, data } = await fetchIssues(text);
        handleRateLimit(response);

        if (response.status === 403) {
          return;
        }

        if (response.status !== 200) {
          dispatch(setError(GENERIC_ERROR));
          return;
        }

        const newItems = formatIssues(data);
        cache.set(text, newItems);
        dispatch(setItems(newItems));
      } catch (e) {
        dispatch(setError(GENERIC_ERROR));
      }
    },
    [
      rateLimitResetTime,
      hasReachedMaxLimit,
      cache,
      error,
      handleRateLimit,
      setDismissableError,
    ]
  );

  const onSearchThrottled = useCallback(throttle(onSearch, 2000), [onSearch]);

  const onChangeText = useCallback(
    (e) => {
      const text = e.target.value;
      dispatch(changeText(text));
      onSearchThrottled(text);
    },
    [onSearchThrottled]
  );

  const onSelect = useCallback((item) => {
    dispatch(selectItem(item));
  }, []);

  return {
    error,
    items,
    text,
    onChangeText,
    onSelect,
    isPristine,
  };
}
