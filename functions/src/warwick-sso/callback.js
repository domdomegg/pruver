const oauth = require('./oauth');

const jsrsasign = require('jsrsasign');
const jws = jsrsasign.KJUR.jws.JWS;
const keyutil = jsrsasign.KEYUTIL;
const fs = require('fs');
const crypto = require('crypto');

module.exports.handler = async (event) => {
  const { oauth_token: requestToken, oauth_token_secret: requestTokenSecret, reference, seed } = event.queryStringParameters;
  const { accessToken, accessTokenSecret } = await new Promise((resolve, reject) => {
    oauth.getOAuthAccessToken(requestToken, requestTokenSecret, (error, accessToken, accessTokenSecret, results) => {
      if (error) {
        console.log('Error exchanging request token', error);
        reject(error);
      }
      resolve({ accessToken, accessTokenSecret });
    });
  });

  const profile = await new Promise((resolve, reject) => {
    oauth.post(
      'https://websignon.warwick.ac.uk/oauth/authenticate/attributes',
      accessToken,
      accessTokenSecret,
      null,
      null,
      (error, body, res) => {
        if (error) {
          console.log('Error fetching user profile', error);
          reject(error);
        }

        const profile = {};
        body
          .split('\n')
          .map((s) => s.trim())
          .forEach((property) => {
            if (property.includes('=')) {
              const key = property.slice(0, property.indexOf('='));
              const value = property.slice(property.indexOf('=') + 1);

              profile[key] = value;
            }
          });
        resolve(profile);
      }
    );
  });

  const allData = {
    uniqueId: hash(profile.id, seed),
    student: profile.student, // "true" or "false"
    staff: profile.staff, // "true" or "false"
    group: profile.warwicktargetgroup, // e.g. "Undergraduate - full-time"
    dept: profile.dept, // e.g. "Computer Science"
    year: profile.yearofstudy, // e.g. "2"
    course: profile.warwickcoursecode, // e.g. "UCSA-G503"
    id: profile.id, // e.g. "1802249"
    user: profile.user, // e.g. "u1802249"
    firstName: profile.firstname, // e.g. "Adam"
    lastName: profile.lastname, // e.g. "Jones"
  };

  // Return just the requested properties
  const requestedProperties = event.queryStringParameters.requested_properties.split(',');
  const payload = { reference, seed };
  for (const requestedProperty of requestedProperties) {
    payload[requestedProperty] = allData[requestedProperty];
  }

  const jwt = sign(payload);

  return {
    statusCode: 302,
    headers: {
      Location: `http://domdomegg.github.io/pruver/show.html?jwt=${encodeURIComponent(jwt)}`,
    },
  };
};

const hash = (id, seed) => {
  const secret = fs.readFileSync('./config/uniqueid_private.key');
  return crypto.createHmac('sha256', secret).update(id).update(seed).digest('base64');
};

const sign = (payload) => {
  const privateKey = keyutil.getKey(fs.readFileSync('./config/jwt_private.key').toString());

  return jws.sign('RS512', { alg: 'RS512', typ: 'JWT' }, payload, privateKey);
};
