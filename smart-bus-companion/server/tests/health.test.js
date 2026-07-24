process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');

// Mock busSimulator to prevent it from starting logic
jest.mock('../services/busSimulator', () => ({
  startBusSimulator: jest.fn()
}));

const { app, server } = require('../server');

describe('Health Endpoint', () => {
  afterAll(async () => {
    await mongoose.disconnect();
    if (server && server.listening) {
      server.close();
    }
  });

  it('should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect([200, 500, 503]).toContain(response.statusCode);
    if (response.statusCode !== 500) {
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('dbState');
      expect(response.body).toHaveProperty('uptime');
    }
  });
  
  it('should have security headers from helmet', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers).toHaveProperty('x-dns-prefetch-control');
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('strict-transport-security');
  });
});
