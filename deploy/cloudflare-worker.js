export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const upstream = new URL('https://opensky-network.org/api/states/all');

    if (url.searchParams.get('extended') === '1') {
      upstream.searchParams.set('extended', '1');
    }

    const headers = new Headers({ Accept: 'application/json' });

    if (env.OPENSKY_BEARER_TOKEN) {
      headers.set('Authorization', `Bearer ${env.OPENSKY_BEARER_TOKEN}`);
    }

    const response = await fetch(upstream.toString(), { headers });

    return new Response(response.body, {
      status: response.status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=4, s-maxage=4'
      }
    });
  }
};
