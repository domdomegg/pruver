const { handler } = require('./authorise');

it('rejects requests with no query parameters', async () => {
  const res = await handler({});
  expect(res.statusCode).toBe(400);
  expect(JSON.parse(res.body).message).toBe('Missing query parameters');
});

it('rejects requests missing requested_properties', async () => {
  const res = await handler({ queryStringParameters: { foo: 'bar' } });
  expect(res.statusCode).toBe(400);
  expect(JSON.parse(res.body).message).toBe('Missing requested_properties query parameter');
});
