const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stockAPI = process.env.STOCK_API;
const stockAPIAuthorization = process.env.STOCK_API_AUTHORIZATION;
const orderAPI = process.env.ORDER_API;
const orderAPIToken = process.env.ORDER_API_TOKEN;
const { mapDisplayItems } = require('../utils/helpers');

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

  try {
    const webhookEvent = stripe.webhooks.constructEvent(
      event.body,
      event.headers['stripe-signature'],
      endpointSecret,
    );

    if (webhookEvent.type !== 'checkout.session.completed') {
      return;
    }

    const order = webhookEvent.data.object;

    const {
      line1,
      line2,
      city,
      state,
      // eslint-disable-next-line camelcase
      postal_code,
      country,
    } = order.shipping.address;

    const displayItems = mapDisplayItems(
      order.display_items,
      JSON.parse(order.metadata.items),
    );

    const user = order.client_reference_id;
    const address = {
      postalCode: postal_code,
      city,
      line1,
      line2,
      country,
    };
    const data = {
      user,
      address,
      products: displayItems,
    };

    await axios.post(`${orderAPI}`, data, {
      headers: {
        ...headers,
        token: `${orderAPIToken}`,
      },
    });

    await axios.post(`${stockAPI}`, data, {
      headers: {
        ...headers,
        authorization: `${stockAPIAuthorization}`,
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        received: true,
        data,
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
