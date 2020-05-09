const axios = require("axios");

exports.handler = async (event, context, callback) => {
  const { email } = JSON.parse(event.body);

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Method not allowed",
      }),
    };
  }

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Email is required",
      }),
    };
  }

  try {
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const DATACENTER = API_KEY.split("-")[1];

    const data = JSON.stringify({
      email_address: email,
      status: "subscribed",
    });

    const response = await axios.post(
      `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
      data,
      {
        headers: {
          Authorization: `apikey ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status >= 400) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `There was an error subscribing to the newsletter. Please send an email at [hello@abdessalam.dev]`,
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.message || error.toString(),
      }),
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ error: "" }),
  };
};
