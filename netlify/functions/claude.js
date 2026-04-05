exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);

    // Convert Anthropic format to OpenAI format
    const messages = [];
    if (body.system) {
      messages.push({ role: 'system', content: body.system });
    }
    for (const msg of body.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: body.max_tokens || 1200,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('OpenAI error:', JSON.stringify(data));
      return {
        statusCode: response.status,
        body: JSON.stringify(data)
      };
    }

    // Convert OpenAI response to Anthropic format so frontend works unchanged
    const anthropicFormat = {
      content: [{
        type: 'text',
        text: data.choices[0].message.content
      }]
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(anthropicFormat)
    };
  } catch (err) {
    console.log('Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
