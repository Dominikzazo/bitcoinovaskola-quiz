exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  console.log('Function called, ANTHROPIC_KEY exists:', !!process.env.ANTHROPIC_KEY);
  console.log('Request body length:', event.body ? event.body.length : 0);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: event.body
    });

    const data = await response.json();
    console.log('Anthropic response status:', response.status);
    if (!response.ok) {
      console.log('Anthropic error:', JSON.stringify(data));
    }

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.log('Fetch error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
