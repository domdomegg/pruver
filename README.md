# ✒ Pruver

Pruver certifies people's identities (e.g. they're a Warwick student), without revealing anything else.

See [the website](https://domdomegg.github.io/pruver/) for more details.

## 🤔 Technical explanation

### Technical (happy path) user flow

1. User **A** generates a 'Pruver link' on the static website. This is really an API Gateway endpoint URL with some query parameters set. This endpoint is set up by Serverless, and points at the authorisation Lambda.
2. User **B** receives the link from user **A**, and navigates to it in their web browser. This triggers the authorisation Lambda. The Lambda gets a request token (e.g. with Warwick's API) and redirects the user to authenticate and authorise Pruver (e.g. Warwick's SSO page).
3. Provided authentication and authorisation were successful, the user is redirected to a callback URL. This callback URL now has all the data necessary for the Lambda to:
   1. Exchange the request token and request token secret for an access token and access token secret
   2. Get the user's profile
   3. Extract the requested data, and create a Pruver code
   4. Redirect the user back to the static site with the Pruver code in the query parameters.
4. User **B** is shown their generated Pruver code on the static site. They can provide this code to user **A** who will then be able to verify its validity and the requested properties.

### Pruver code

Pruver codes are really JSON web tokens (JWTs). Pruver uses the RS512 (RSA using SHA-512 hash) algorithm to sign tokens with a private key, which can then be verified with a public key (these keys are stored in the `config` folder if you're interested).

Provided Pruver has the private key, if a token is signed correctly (which anyone can verify with the public key), Pruver must have been the one to sign it.

### `uniqueid`

`uniqueid` is a property used to uniquely identify someone for a particular seed.

It is an HMAC SHA256 hash of their id and the seed, and is keyed with `uniqueid_private.key`.

The purpose of `uniqueid_private.key` is to prevent brute force/lookup table attacks (e.g. hashing every number from 1800000 to 1900000 and comparing them).

## 🙌 Contributing

Contributions (in the form of issues or pull requests) are welcomed.

If it's security or privacy related, please instead [contact me privately](https://domdomegg.github.io/).

### 🔧 Setup

| NPM command     | What it does               |
|-----------------|----------------------------|
| `install`       | Install dependencies       |
| `lint`          | Find lint issues           |
| `lint:fix`      | Fix most lint issues       |
| `deploy:dev`    | Deploy to dev environment  |
| `deploy:prod`   | Deploy to prod environment |
| `teardown:dev`  | Teardown dev environment   |
| `teardown:prod` | Teardown prod environment  |

- For lint scripts, install prettier globally with `npm install --global prettier`.
- For deploy and teardown scripts, install Serverless globally with `npm install --global serverless`.

### ☁️ Releases

#### 🚧 CI/CD (dev only)

Every commit to master will kick off a CI build. If the tests are successful a CD build will deploy the new version to the dev environment. Build logs are available publicly on GitHub.

#### 👷 Manual (dev and prod)

1. Ensure your local copy is what you want deployed (for prod, this should be a version that's been tested in dev)
2. Run `npm i` to install dependencies
3. Run `npm run deploy:dev` or `npm run deploy:prod` to deploy the app to the respective environment

### 📈 Monitoring

There are several places to monitor and debug issues:
- GitHub build logs: test or deployment statuses and logs
- AWS CloudFormation: infrastructure changes, and a high level overview of app health
- AWS CloudWatch Metrics and Logs: app health indicators (e.g. HTTP status codes)
- AWS CloudWatch Logs: all log output from the Lambda functions