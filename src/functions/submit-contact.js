const FORMSPREE_API_URL = process.env.FORMSPREE_API_URL;
const axios = require('axios');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept',
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': '*',
};

exports.handler = async (event, context, callback) => {
  // Handling preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Method not allowed',
      }),
    };
  }

  const { email, message } = JSON.parse(event.body);

  if (!email || !message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Email and message are required!',
      }),
    };
  }

  try {
    const data = {
      email,
      message,
    };

    const response = await axios.post(FORMSPREE_API_URL, data, {
      headers: {
        ...headers,
      },
    });

    if (response.status >= 400) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error:
            'There was an error submitting contact form. Please send an email at [hello@abdessalam.dev]',
        }),
      };
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        data: 'sent',
      }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({
        error: error.message || error.toString(),
      }),
    };
  }
};
