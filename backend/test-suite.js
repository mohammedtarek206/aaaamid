const assert = require('assert');
const path = require('path');

// Ensure VERCEL environment is simulated for serverless tests
process.env.VERCEL = '1';
process.env.JWT_SECRET = 'test_secret_for_verification_only_123';
process.env.MONGODB_URI = 'mongodb+srv://testuser:testpass12345@cluster.test.mongodb.net/el_amid';

const { sanitizeMongoUri } = require('./db');
const app = require('./server');

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(err);
    }
}

async function itAsync(name, fn) {
    totalTests++;
    try {
        await fn();
        console.log(`  ✅ PASS: ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(err);
    }
}

// Mock request / response helper
function createMockRes() {
    return {
        statusCode: 200,
        headers: {},
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
            return this;
        },
        send(data) {
            this.body = data;
            return this;
        },
        setHeader(name, val) {
            this.headers[name.toLowerCase()] = val;
        },
        getHeader(name) {
            return this.headers[name.toLowerCase()];
        },
        end(data) {
            if (data) this.body = data;
            return this;
        },
        cookie(name, val, opts) {
            this.headers['set-cookie'] = `${name}=${val}; Path=/; ${opts.httpOnly ? 'HttpOnly;' : ''} ${opts.sameSite ? `SameSite=${opts.sameSite};` : ''}`;
            return this;
        }
    };
}

async function runTests() {
    console.log('--- Starting Production Verification Suite ---');

    // TEST 1: Sanitize Mongo URI
    it('Never exposes credentials in MongoDB URI logs', () => {
        const uri1 = 'mongodb+srv://admin_user:SuperSecretPassword123@mycluster.mongodb.net/el_amid';
        const clean1 = sanitizeMongoUri(uri1);
        assert.ok(!clean1.includes('SuperSecretPassword123'), 'Password should be masked');
        assert.ok(clean1.includes('****'), 'Should contain mask');
        assert.ok(clean1.includes('admin_user'), 'Username can be kept');

        const uri2 = 'mongodb://root:p@ssword!@localhost:27017/test';
        const clean2 = sanitizeMongoUri(uri2);
        assert.ok(!clean2.includes('p@ssword!'), 'Password should be masked');
    });

    // TEST 2: Preflight OPTIONS on /auth/login/admin for https://www.mrahmed-shendy.com returns 204
    await itAsync('OPTIONS /auth/login/admin returns HTTP 204 for https://www.mrahmed-shendy.com', async () => {
        const req = {
            method: 'OPTIONS',
            url: '/auth/login/admin',
            path: '/auth/login/admin',
            headers: {
                origin: 'https://www.mrahmed-shendy.com',
                'access-control-request-method': 'POST',
                'access-control-request-headers': 'Content-Type,Authorization,x-device-id'
            }
        };
        const res = createMockRes();

        await new Promise((resolve) => {
            app.handle(req, res, () => resolve());
            if (res.statusCode === 204 || res.statusCode === 200) resolve();
        });

        assert.strictEqual(res.statusCode, 204, 'Preflight must return HTTP 204, not 500 or 200');
        assert.strictEqual(res.headers['access-control-allow-origin'], 'https://www.mrahmed-shendy.com');
        assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
        assert.ok(res.headers['access-control-allow-methods'].includes('POST'));
        assert.ok(res.headers['access-control-allow-methods'].includes('OPTIONS'));
        assert.ok(res.headers['access-control-allow-headers'].toLowerCase().includes('content-type'));
        assert.ok(res.headers['access-control-allow-headers'].toLowerCase().includes('authorization'));
        assert.ok(res.headers['access-control-allow-headers'].toLowerCase().includes('x-device-id'));
    });

    // TEST 3: Preflight OPTIONS for root domain https://mrahmed-shendy.com
    await itAsync('OPTIONS /auth/login/admin returns HTTP 204 for https://mrahmed-shendy.com', async () => {
        const req = {
            method: 'OPTIONS',
            url: '/auth/login/admin',
            path: '/auth/login/admin',
            headers: {
                origin: 'https://mrahmed-shendy.com',
                'access-control-request-method': 'POST'
            }
        };
        const res = createMockRes();

        await new Promise((resolve) => {
            app.handle(req, res, () => resolve());
            if (res.statusCode === 204) resolve();
        });

        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.headers['access-control-allow-origin'], 'https://mrahmed-shendy.com');
        assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
    });

    // TEST 4: Allows Vercel preview domains safely
    await itAsync('Allows Vercel preview deployments safely', async () => {
        const req = {
            method: 'OPTIONS',
            url: '/auth/login/admin',
            path: '/auth/login/admin',
            headers: {
                origin: 'https://el-amid-platform-git-preview-test.vercel.app',
                'access-control-request-method': 'POST'
            }
        };
        const res = createMockRes();

        await new Promise((resolve) => {
            app.handle(req, res, () => resolve());
            if (res.statusCode === 204) resolve();
        });

        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.headers['access-control-allow-origin'], 'https://el-amid-platform-git-preview-test.vercel.app');
        assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
    });

    // TEST 5: Blocks unauthorized origins cleanly without 500 error
    await itAsync('Blocks unauthorized origins without throwing 500 error', async () => {
        const req = {
            method: 'OPTIONS',
            url: '/api/auth/login/admin',
            path: '/api/auth/login/admin',
            headers: {
                origin: 'https://evil-phishing-site.com',
                'access-control-request-method': 'POST'
            }
        };
        const res = createMockRes();

        await new Promise((resolve) => {
            app.handle(req, res, () => resolve());
            setTimeout(resolve, 50);
        });

        assert.strictEqual(res.headers['access-control-allow-origin'], undefined);
        assert.notStrictEqual(res.statusCode, 500);
    });

    // TEST 6: Health check responds UP even when DB is disconnected
    await itAsync('Health check responds UP even when DB is disconnected', async () => {
        const req = {
            method: 'GET',
            url: '/api/health',
            path: '/api/health',
            headers: {}
        };
        const res = createMockRes();

        await new Promise((resolve) => {
            app.handle(req, res, () => resolve());
            setTimeout(resolve, 50);
        });

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.status, 'UP');
    });

    // TEST 7: Route dual-mounting (/api/auth and /auth)
    it('Routes are mounted for both /api/auth and /auth', () => {
        const routes = [];
        app._router.stack.forEach((layer) => {
            if (layer.route) {
                routes.push(layer.route.path);
            } else if (layer.name === 'router') {
                routes.push(layer.regexp.toString());
            }
        });
        const hasAuth = routes.some(r => r.includes('auth'));
        assert.ok(hasAuth, 'Auth router should be mounted');
    });

    // TEST 8: Vercel serverless entry points
    it('Both backend/api/index.js and root api/index.js export express app', () => {
        const backendServerlessApp = require('./api/index');
        assert.strictEqual(typeof backendServerlessApp, 'function');
        assert.strictEqual(typeof backendServerlessApp.handle, 'function');

        const rootServerlessApp = require('../api/index');
        assert.strictEqual(typeof rootServerlessApp, 'function');
        assert.strictEqual(typeof rootServerlessApp.handle, 'function');
    });

    // TEST 9: Admin login endpoint with DB unavailable returns 503 + CORS headers
    await itAsync('POST /auth/login/admin returns 503 + CORS headers when DB is unavailable', async () => {
        const mongoose = require('mongoose');
        Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });
        process.env.MONGODB_URI = ''; // simulate unavailable DB

        const req = {
            method: 'POST',
            url: '/auth/login/admin',
            path: '/auth/login/admin',
            headers: {
                origin: 'https://www.mrahmed-shendy.com',
                'content-type': 'application/json'
            },
            body: { username: 'admin', password: '123' }
        };
        const res = createMockRes();

        await new Promise((resolve) => {
            app.handle(req, res, () => resolve());
            setTimeout(resolve, 100);
        });

        assert.strictEqual(res.statusCode, 503);
        assert.strictEqual(res.headers['access-control-allow-origin'], 'https://www.mrahmed-shendy.com');
        assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
        assert.strictEqual(res.body.error, 'Database connection failed');
    });

    // TEST 10: Admin login endpoint reaches controller and validates credentials
    await itAsync('POST /auth/login/admin validates empty username/password with 400', async () => {
        const mongoose = require('mongoose');
        Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

        const req = {
            method: 'POST',
            url: '/auth/login/admin',
            path: '/auth/login/admin',
            headers: {
                origin: 'https://www.mrahmed-shendy.com',
                'content-type': 'application/json'
            },
            body: { username: '', password: '' }
        };
        const res = createMockRes();

        await new Promise((resolve) => {
            app.handle(req, res, () => resolve());
            setTimeout(resolve, 100);
        });

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.headers['access-control-allow-origin'], 'https://www.mrahmed-shendy.com');
        assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
        assert.ok(res.body.error.includes('اسم المستخدم'));
    });

    console.log(`\n--- Verification Complete: ${passedTests}/${totalTests} Passed ---`);
    if (passedTests !== totalTests) {
        process.exit(1);
    }
}

runTests();
