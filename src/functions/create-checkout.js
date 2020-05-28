const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Retry to prevent network errors early
stripe.setMaxNetworkRetries(4);

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
      body: JSON.stringify({
        error: 'Method not allowed',
      }),
    };
  }

  let { items, customerEmail, clientReferenceId } = JSON.parse(event.body);

  if (!items || !items.length) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Items must not be empty',
      }),
    };
  }

  try {
    const lineItems = items.map(({ id, sku, slug, ...item }) => {
      return {
        ...item,
        // security check to set max product quantity to 10
        quantity: item.quantity > 0 && item.quantity <= 10 ? item.quantity : 1,
      };
    });

    const metadata = {
      items: JSON.stringify(
        items.map(item => {
          return {
            id: item.id,
            name: item.name,
            sku: item.sku,
            slug: item.slug,
          };
        }),
      ),
    };

    const session = await stripe.checkout.sessions.create({
      ...(customerEmail && { customer_email: customerEmail }),
      ...(clientReferenceId && { client_reference_id: clientReferenceId }),
      success_url: 'https://smartwatch.abdessalam.dev/checkout-success',
      cancel_url: 'https://smartwatch.abdessalam.dev/cart',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['FR'],
      },
      line_items: lineItems,
      metadata: metadata,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id }),
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
