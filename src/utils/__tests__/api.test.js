import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { fetchIssues, getRateLimits, formatIssues } from '../api';

describe('utils/api', () => {
  const now = Date.now;
  const server = setupServer(
    rest.get('https://api.github.com/search/issues', (req, res, ctx) => {
      return res(
        ctx.set({
          'x-ratelimit-remaining': 10,
          'x-ratelimit-limit': 10,
          'x-ratelimit-used': 0,
          'x-ratelimit-reset': 100,
        }),
        ctx.json({ test: 'hi' })
      );
    })
  );

  beforeAll(() => server.listen());
  beforeEach(() => {
    Date.now = jest.fn().mockReturnValue(1000 * 80);
  });
  afterEach(() => {
    server.resetHandlers();
    Date.now = now;
  });
  afterAll(() => server.close());

  describe('fetchIssues', () => {
    it('returns a response object with request/response status', async () => {
      const { response } = await fetchIssues('some text');
      expect(response.status).toEqual(200);
    });

    it('returns a data object with response payload', async () => {
      const { data } = await fetchIssues('some text');
      expect(data.test).toEqual('hi');
    });
  });

  describe('getRateLimits', () => {
    it('returns data from response headers', async () => {
      const { response } = await fetchIssues('some text');
      const limits = getRateLimits(response);
      expect(limits).toEqual({
        remaining: 10,
        limit: 10,
        used: 0,
        resetTimestamp: 100 * 1000,
        timeUntilReset: 20 * 1000,
      });
    });
  });

  describe('formatIssues', () => {
    it('transforms issues into correct format', () => {
      const responseData = {
        items: [
          {
            id: 1,
            title: 'title',
            state: 'open',
            labels: [
              {
                id: 1,
                name: 'test',
                color: 'fff',
              },
            ],
          },
        ],
      };
      const result = formatIssues(responseData);
      expect(result).toEqual([
        {
          id: 1,
          title: 'title',
          isOpen: true,
          labels: [
            {
              id: 1,
              name: 'test',
              color: '#fff',
            },
          ],
        },
      ]);
    });
  });
});
