import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { Autocomplete } from '../Autocomplete';
import { useAutocomplete } from '../useAutocomplete';

const githubApiUrl = 'https://api.github.com/search/issues';

function handler200(req, res, ctx) {
  return res(
    ctx.set({
      'x-ratelimit-remaining': 9,
      'x-ratelimit-limit': 10,
      'x-ratelimit-used': 1,
      'x-ratelimit-reset': Date.now() / 1000 + 1000 * 60,
    }),
    ctx.status(200),
    ctx.json({
      items: [
        {
          id: 723339671,
          title: '[Workshop] React Redux',
          labels: [
            {
              id: 2220714600,
              node_id: 'MDU6TGFiZWwyMjIwNzE0NjAw',
              url:
                'https://api.github.com/repos/CodeYourFuture/syllabus/labels/Workshop',
              name: 'Workshop',
              color: 'fbca04',
              default: false,
              description: '',
            },
          ],
          state: 'open',
        },
      ],
    })
  );
}

function handler403(req, res, ctx) {
  return res(
    ctx.set({
      'x-ratelimit-remaining': 0,
      'x-ratelimit-limit': 10,
      'x-ratelimit-used': 10,
      'x-ratelimit-reset': Date.now() / 1000 + 1000 * 60,
    }),
    ctx.status(403),
    ctx.json({})
  );
}

function handler500(req, res, ctx) {
  return res(
    ctx.set({
      'x-ratelimit-remaining': 0,
      'x-ratelimit-limit': 10,
      'x-ratelimit-used': 10,
      'x-ratelimit-reset': Date.now() / 1000 + 1000 * 60,
    }),
    ctx.status(500),
    ctx.json({})
  );
}

function AutocompleteWrapper() {
  const props = useAutocomplete();
  return <Autocomplete {...props} />;
}

describe('Autocomplete', () => {
  let server;

  beforeAll(() => {
    server = setupServer(rest.get(githubApiUrl, handler403));
    server.listen();
  });
  beforeEach(() => {
    server.resetHandlers();
    server.resetHandlers(rest.get(githubApiUrl, handler200));
  });
  afterAll(() => server.close());

  it('shows "please wait" message when rate limit is reached', async () => {
    server.resetHandlers(rest.get(githubApiUrl, handler403));
    const { getByRole } = render(<AutocompleteWrapper />);
    await act(async () => {
      await userEvent.type(getByRole('combobox'), 'virtual dom', { delay: 20 });
    });
    expect(getByRole('alert')).toHaveTextContent('Please wait.');
  });

  it('shows generic error when there is an unexpected error', async () => {
    server.resetHandlers(rest.get(githubApiUrl, handler500));
    const { getByRole } = render(<AutocompleteWrapper />);
    await act(async () => {
      await userEvent.type(getByRole('combobox'), 'virtual dom', { delay: 20 });
    });
    expect(getByRole('alert')).toHaveTextContent(
      'There was an error, please try again.'
    );
  });

  it('updates search input text', async () => {
    const { getByRole } = render(<AutocompleteWrapper />);

    await act(async () => {
      await userEvent.type(getByRole('combobox'), 'virtual dom', { delay: 20 });
    });
    expect(getByRole('combobox')).toHaveValue('virtual dom');
  });

  it('shows search results', async () => {
    const { getByRole } = render(<AutocompleteWrapper />);

    await act(async () => {
      await userEvent.type(getByRole('combobox'), 'virtual dom', { delay: 20 });
    });
    expect(getByRole('option')).toBeVisible();
  });

  describe('keyboard navigation', () => {
    it('can navigate', async () => {
      const { getByRole } = render(<AutocompleteWrapper />);

      await act(async () => {
        await userEvent.type(getByRole('combobox'), 'virtual dom', {
          delay: 20,
        });
      });
      act(() => {
        fireEvent.keyDown(getByRole('combobox'), {
          keyCode: 40,
        });
      });
      expect(getByRole('option')).toHaveAttribute('aria-selected', 'true');
    });

    it('can select item', async () => {
      const { getByRole } = render(<AutocompleteWrapper />);

      await act(async () => {
        await userEvent.type(getByRole('combobox'), 'virtual dom', {
          delay: 20,
        });
      });
      act(() => {
        fireEvent.keyDown(getByRole('combobox'), {
          keyCode: 40,
        });
      });
      act(() => {
        fireEvent.keyDown(getByRole('combobox'), {
          keyCode: 13,
        });
      });
      expect(getByRole('combobox')).toHaveValue('[Workshop] React Redux');
    });

    it('can dismiss search results', async () => {
      const { getByRole, queryByRole } = render(<AutocompleteWrapper />);

      await act(async () => {
        await userEvent.type(getByRole('combobox'), 'virtual dom', {
          delay: 20,
        });
      });
      act(() => {
        fireEvent.keyDown(getByRole('combobox'), {
          keyCode: 27,
        });
      });
      expect(queryByRole('listbox')).toBeNull();
    });
  });
});
