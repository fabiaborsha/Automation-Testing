import { test, expect, request } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = 'https://reqres.in/api';

async function createApiContext() {
  return request.newContext({
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.REQRES_API_KEY || ''
    }
  });
}

test('API Q3 - login and capture auth token', async () => {
  const api = await createApiContext();

  const response = await api.post(baseUrl + '/login', {
    data: {
      email: 'eve.holt@reqres.in',
      password: 'cityslicka'
    }
  });

  expect(response.status()).toBe(200);

  const data = await response.json();

  console.log('Login response:', data);
  console.log('Auth token:', data.token);

  expect(data.token).toBeTruthy();

  await api.dispose();
});

test('API Q4 - get user by user id', async () => {
  const api = await createApiContext();

  const userId = 2;

  const response = await api.get(baseUrl + '/users/' + userId);

  expect(response.status()).toBe(200);

  const data = await response.json();

  expect(data.data.id).toBe(userId);
  expect(data.data.first_name).toBe('Janet');
  expect(data.data.last_name).toBe('Weaver');
  expect(data.data.email).toBe('janet.weaver@reqres.in');

  await api.dispose();
});

test('API Q5 - update profile using PUT', async () => {
  const api = await createApiContext();

  const response = await api.put(baseUrl + '/users/2', {
    data: {
      name: 'John Tester',
      job: 'QA Engineer'
    }
  });

  expect(response.status()).toBe(200);

  const data = await response.json();

  expect(data.name).toBe('John Tester');
  expect(data.job).toBe('QA Engineer');
  expect(data.updatedAt).toBeTruthy();

  const updatedDate = new Date(data.updatedAt);

  expect(updatedDate.toString()).not.toBe('Invalid Date');

  console.log('Updated at:', data.updatedAt);

  await api.dispose();
});

test('API Q6 - update one field using PATCH', async () => {
  const api = await createApiContext();

  const response = await api.patch(baseUrl + '/users/2', {
    data: {
      job: 'Senior QA Engineer'
    }
  });

  expect(response.status()).toBe(200);

  const data = await response.json();

  expect(data.job).toBe('Senior QA Engineer');
  expect(data.updatedAt).toBeTruthy();

  // Only the job field was sent in the PATCH request.
  expect(data.name).toBeUndefined();

  await api.dispose();
});

test('API Q8 - login without password returns 4xx', async () => {
  const api = await createApiContext();

  const response = await api.post(baseUrl + '/login', {
    data: {
      email: 'peter@klaven'
    }
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
  expect(response.status()).toBeLessThan(500);

  const data = await response.json();
  expect(data.error).toBeTruthy();

  await api.dispose();
});

test('API Q8 - login without email returns 4xx', async () => {
  const api = await createApiContext();

  const response = await api.post(baseUrl + '/login', {
    data: {
      password: 'cityslicka'
    }
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
  expect(response.status()).toBeLessThan(500);

  await api.dispose();
});

test('API Q8 - invalid login details returns 4xx', async () => {
  const api = await createApiContext();

  const response = await api.post(baseUrl + '/login', {
    data: {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    }
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
  expect(response.status()).toBeLessThan(500);

  await api.dispose();
});

test('API Q8 - non existing user returns 4xx', async () => {
  const api = await createApiContext();

  const response = await api.get(baseUrl + '/users/9999');

  expect(response.status()).toBeGreaterThanOrEqual(400);
  expect(response.status()).toBeLessThan(500);

  await api.dispose();
});
