const oauthConfig = require('../../config/oauth.json');

const Oauth = require('oauth');
const oauth = new Oauth.OAuth(
  'https://websignon.warwick.ac.uk/oauth/requestToken',
  'https://websignon.warwick.ac.uk/oauth/accessToken',
  oauthConfig.warwickSso.consumerKey,
  oauthConfig.warwickSso.consumerSecret,
  '1.0',
  null,
  'HMAC-SHA1'
);

module.exports = oauth;
