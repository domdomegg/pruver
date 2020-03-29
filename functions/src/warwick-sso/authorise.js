const oauth = require('./oauth');
const properties = require('../../config/properties.json');

module.exports.handler = async (event) => {
  if (!event.queryStringParameters) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing query parameters',
      }),
    };
  }

  if (!event.queryStringParameters.requested_properties) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing requested_properties query parameter',
      }),
    };
  }

  const requested_properties = event.queryStringParameters.requested_properties.split(',');
  if (!requested_properties.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'No properties requested',
      }),
    };
  }

  const propertyKeys = new Set(Object.keys(properties));
  const invalidProperties = requested_properties.filter((propertyKey) => !propertyKeys.has(propertyKey));
  if (invalidProperties.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Invalid properties: [${invalidProperties}]`,
      }),
    };
  }

  if (!event.queryStringParameters.reference) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing reference query parameter',
      }),
    };
  }

  if (!event.queryStringParameters.seed) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing seed query parameter',
      }),
    };
  }

  const { requestToken, requestTokenSecret } = await new Promise((resolve, reject) => {
    oauth.getOAuthRequestToken({ scope: 'urn:websignon.warwick.ac.uk:sso:service' }, (error, requestToken, requestTokenSecret, results) => {
      if (error) {
        console.log('Error getting request token', error);
        reject(error);
      } else {
        resolve({ requestToken, requestTokenSecret });
      }
    });
  });

  const callbackUrl = `${process.env.BASE_URL}/warwick-sso/callback?requested_properties=${encodeURIComponent(
    event.queryStringParameters.requested_properties
  )}&reference=${encodeURIComponent(event.queryStringParameters.reference)}&seed=${encodeURIComponent(
    event.queryStringParameters.seed
  )}&oauth_token_secret=${encodeURIComponent(requestTokenSecret)}${
    event.queryStringParameters.pruver_redirect ? `&pruver_redirect=${encodeURIComponent(event.queryStringParameters.pruver_redirect)}` : ''
  }`;
  return {
    statusCode: 302,
    headers: {
      Location: `https://websignon.warwick.ac.uk/oauth/authorise?oauth_token=${encodeURIComponent(
        requestToken
      )}&oauth_callback=${encodeURIComponent(callbackUrl)}`,
    },
  };
};
