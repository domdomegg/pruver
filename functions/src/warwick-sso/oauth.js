const oauthConfig = require('../../config/oauth.json');

const Oauth = require('oauth');
const oauth = new Oauth.OAuth(
  oauthConfig.warwickSso.requestTokenUrl,
  oauthConfig.warwickSso.accessTokenUrl,
  oauthConfig.warwickSso.consumerKey,
  oauthConfig.warwickSso.consumerSecret,
  '1.0',
  null,
  'HMAC-SHA1'
);

module.exports = oauth;
