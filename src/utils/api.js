export async function fetchIssues(text) {
  const response = await fetch(
    `https://api.github.com/search/issues?per_page=${10}&q=repo:facebook/react+${text}`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  const data = await response.json();

  return { response, data };
}

export function formatIssues(issuesResponse) {
  return issuesResponse.items.map((item) => ({
    id: item.id,
    title: item.title,
    isOpen: item.state === 'open',
    labels: item.labels.map((label) => ({
      id: label.id,
      name: label.name,
      color: `#${label.color}`,
    })),
  }));
}

export function getRateLimits(response) {
  const remaining = parseInt(response.headers.get('x-ratelimit-remaining'), 10);
  const limit = parseInt(response.headers.get('x-ratelimit-limit'), 10);
  const used = parseInt(response.headers.get('x-ratelimit-used'), 10);
  const resetTimestamp =
    parseInt(response.headers.get('x-ratelimit-reset'), 10) * 1000;
  const timeUntilReset = resetTimestamp - Date.now();

  return {
    remaining,
    limit,
    used,
    resetTimestamp,
    timeUntilReset,
  };
}
