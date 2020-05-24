const axios = require("axios");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
  "Content-Type": "application/json",
  "Access-Control-Allow-Methods": "*",
};

exports.handler = async (event, context, callback) => {
  // Handling preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Method not allowed",
      }),
    };
  }

  const { email } = JSON.parse(event.body);

  if (!email) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Email is required",
      }),
    };
  }

  try {
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const DATACENTER = API_KEY.split("-")[1];

    const data = {
      email_address: email,
      status: "subscribed",
    };

    const response = await axios.post(
      `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
      data,
      {
        headers: {
          ...headers,
          Authorization: `apikey ${API_KEY}`,
        },
      }
    );

    if (response.status >= 400) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error:
            "There was an error subscribing to the newsletter. Please send an email at [hello@abdessalam.dev]",
        }),
      };
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        data: "created",
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
