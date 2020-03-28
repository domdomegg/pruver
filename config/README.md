# ⚙ Config

This folder contains configuration (mainly keys and secrets) for different stages.

For obvious reasons the prod secrets are not checked into version control.

Currently, the files are:
- `jwt_private.key` and `jwt_public.key` are a keypair used to sign JWTs. You can generate such a keypair with:
  1. `ssh-keygen -t rsa -b 4096 -m PKCS8 -f jwt_private.key`
  2. `ssh-keygen -e -m PKCS8 -f jwt_private.key > jwt_public.key`
- `uniqueid_private.key` is random data to use as an HMAC key to create `uniqueid`. Base64 from a cryptographically secure random generator works.