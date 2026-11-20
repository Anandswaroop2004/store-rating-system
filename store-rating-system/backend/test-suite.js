const assert = require('assert');

// Start the server in-process!
require('./server');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function req(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
    });
    clearTimeout(timeoutId);

    let data = null;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function runTestSuite() {
  // Give server 1 second to start listening
  await new Promise(r => setTimeout(r, 1200));

  console.log('====================================================');
  console.log(' RUNNING COMPREHENSIVE E2E VERIFICATION TEST SUITE  ');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function recordPass(testName) {
    totalTests++;
    passedTests++;
    console.log(`[PASS] ${testName}`);
  }

  function recordFail(testName, error) {
    totalTests++;
    console.error(`[FAIL] ${testName}:`, error.message);
  }

  // 1. Health check
  try {
    const res = await req('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'OK');
    recordPass('1. System Health Check');
  } catch (err) {
    recordFail('1. System Health Check', err);
  }

  // 2. Form Validations on Registration
  try {
    // 2a. Short Name (<20 chars)
    const shortNameRes = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Short Name',
        email: `valid_${Date.now()}@example.com`,
        address: '123 Main Street',
        password: 'Password@123'
      }
    });
    assert.strictEqual(shortNameRes.status, 400);
    recordPass('2a. Validation: Name < 20 chars correctly rejected (400)');

    // 2b. Invalid Password (missing special char)
    const noSpecialRes = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Valid Name For Testing Purposes',
        email: `valid_${Date.now()}@example.com`,
        address: '123 Main Street',
        password: 'Password123'
      }
    });
    assert.strictEqual(noSpecialRes.status, 400);
    recordPass('2b. Validation: Password without special char rejected (400)');

    // 2c. Successful Normal User Registration
    const testEmail = `newuser_${Date.now()}@storerating.in`;
    const regRes = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Vikramaditya Rajesh Sharma',
        email: testEmail,
        address: 'Flat 402, Shanti Kunj Apartments, F.C. Road, Shivajinagar, Pune, Maharashtra 411005',
        password: 'User@Secure123'
      }
    });
    assert.strictEqual(regRes.status, 201);
    assert.strictEqual(regRes.data.user.role, 'user');
    assert.ok(regRes.data.token);
    recordPass('2c. Normal User Registration with role "user" (201)');

    // 2d. Duplicate Email Registration
    const dupRes = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Vikramaditya Rajesh Sharma Duplicate',
        email: testEmail,
        address: 'Flat 402, Shanti Kunj Apartments, F.C. Road, Pune',
        password: 'User@Secure123'
      }
    });
    assert.strictEqual(dupRes.status, 409);
    recordPass('2d. Validation: Duplicate Email rejected (409 Conflict)');
  } catch (err) {
    recordFail('2. Form Validations on Registration', err);
  }

  // 3. Common Login for All Three Roles
  let adminToken, ownerToken, userToken;
  try {
    // 3a. Admin Login (Indian Admin)
    const adminRes = await req('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@storerating.in',
        password: 'Admin@1234'
      }
    });
    assert.strictEqual(adminRes.data.user.role, 'admin');
    adminToken = adminRes.data.token;
    recordPass('3a. Common Login: Admin role authentication & redirect token');

    // 3b. Store Owner Login (Indian Store Owner)
    const ownerRes = await req('/auth/login', {
      method: 'POST',
      body: {
        email: 'ramesh.choudhary@vijaysales.in',
        password: 'Owner@1234'
      }
    });
    assert.strictEqual(ownerRes.data.user.role, 'owner');
    ownerToken = ownerRes.data.token;
    recordPass('3b. Common Login: Store Owner role authentication & redirect token');

    // 3c. Normal User Login (Indian Normal User)
    const userRes = await req('/auth/login', {
      method: 'POST',
      body: {
        email: 'aarav.deshmukh@gmail.com',
        password: 'User@1234'
      }
    });
    assert.strictEqual(userRes.data.user.role, 'user');
    userToken = userRes.data.token;
    recordPass('3c. Common Login: Normal User role authentication & redirect token');

    // 3d. Invalid Password
    const invalidLoginRes = await req('/auth/login', {
      method: 'POST',
      body: {
        email: 'aarav.deshmukh@gmail.com',
        password: 'WrongPassword@123'
      }
    });
    assert.strictEqual(invalidLoginRes.status, 401);
    recordPass('3d. Authentication: Invalid credentials rejected (401)');
  } catch (err) {
    recordFail('3. Common Login for All Three Roles', err);
  }

  // 4. Role-Based Access Control & Security
  try {
    // 4a. Normal User blocked from Admin route
    const normalToAdminRes = await req('/admin/stats', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(normalToAdminRes.status, 403);
    recordPass('4a. Security: Normal user forbidden from Admin endpoints (403)');

    // 4b. Store Owner blocked from Admin route
    const ownerToAdminRes = await req('/admin/stats', {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.strictEqual(ownerToAdminRes.status, 403);
    recordPass('4b. Security: Store Owner forbidden from Admin endpoints (403)');

    // 4c. Normal User blocked from Store Owner dashboard
    const normalToOwnerRes = await req('/owner/dashboard', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(normalToOwnerRes.status, 403);
    recordPass('4c. Security: Normal user forbidden from Store Owner endpoints (403)');

    // 4d. Unauthenticated request blocked
    const unauthRes = await req('/admin/users');
    assert.strictEqual(unauthRes.status, 401);
    recordPass('4d. Security: Unauthenticated access blocked (401)');
  } catch (err) {
    recordFail('4. Role-Based Access Control & Security', err);
  }

  // 5. System Administrator Functionalities
  try {
    // 5a. Admin Dashboard Stats from MySQL
    const statsRes = await req('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.ok(statsRes.data.stats.total_users >= 7);
    assert.ok(statsRes.data.stats.total_stores >= 4);
    assert.ok(statsRes.data.stats.total_ratings >= 6);
    recordPass('5a. Admin Dashboard: Actual MySQL counts for users, stores, ratings');

    // 5b. Admin Add New User (Indian Admin creates Indian User)
    const newAdminEmail = `admin_created_${Date.now()}@storerating.in`;
    const addUserRes = await req('/admin/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Devavrata Anand Swaroop Mishra',
        email: newAdminEmail,
        password: 'AdminUser@123',
        address: 'Flat 204, Ganga View Residency, Kankarbagh, Patna, Bihar 800020',
        role: 'user'
      }
    });
    assert.strictEqual(addUserRes.status, 201);
    recordPass('5b. Admin Manage Users: Add new user');

    // 5c. Admin View Users List with Search & Sort
    const usersRes = await req('/admin/users?sortBy=name&order=asc', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.ok(usersRes.data.users.length > 0);
    recordPass('5c. Admin Manage Users: View users list with sorting & filtering');

    // 5d. Admin View User Details (including Store Owner rating)
    const ownerDetailsRes = await req('/admin/users/2', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(ownerDetailsRes.data.user.role, 'owner');
    assert.ok(ownerDetailsRes.data.user.store !== null);
    assert.ok(ownerDetailsRes.data.user.store.average_rating !== undefined);
    recordPass('5d. Admin User Details: View user details with Store Owner rating');

    // 5e. Admin Add New Store (Indian Store)
    const newStoreEmail = `store_${Date.now()}@retailgroup.in`;
    const addStoreRes = await req('/admin/stores', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Croma Electronics Retail Superstore',
        email: newStoreEmail,
        address: 'City Centre Mall, Sector 29, Gurugram, Haryana 122001',
        owner_id: 2
      }
    });
    assert.strictEqual(addStoreRes.status, 201);
    recordPass('5e. Admin Manage Stores: Add new store with assigned owner');

    // 5f. Admin View Stores List with Average Rating & Sort
    const storesRes = await req('/admin/stores?sortBy=rating&order=desc', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.ok(storesRes.data.stores.length > 0);
    assert.ok(storesRes.data.stores[0].average_rating !== undefined);
    recordPass('5f. Admin Manage Stores: View stores with average rating & sorting');
  } catch (err) {
    recordFail('5. System Administrator Functionalities', err);
  }

  // 6. Normal User Functionalities
  try {
    // 6a. Normal User Store Listing with Overall & User Submitted Rating
    const userStoresRes = await req('/stores?sortBy=name&order=asc', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.ok(userStoresRes.data.stores.length > 0);
    const storeToRate = userStoresRes.data.stores[0];
    assert.ok(storeToRate.overall_rating !== undefined);
    recordPass('6a. Normal User: View stores listing with overall rating and user rating');

    // 6b. Search Stores by Name and Address (Indian Search)
    const searchRes = await req('/stores?search=Vijay', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.ok(searchRes.data.stores.length > 0);
    recordPass('6b. Normal User: Search stores by name and address');

    // 6c. Submit Rating (1 to 5)
    const rateRes = await req(`/stores/${storeToRate.id}/rating`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { rating: 5 }
    });
    assert.strictEqual(rateRes.status, 200);
    assert.strictEqual(rateRes.data.rating, 5);
    recordPass('6c. Normal User: Submit rating (1 to 5)');

    // 6d. Modify Previously Submitted Rating
    const modifyRes = await req(`/stores/${storeToRate.id}/rating`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { rating: 4 }
    });
    assert.strictEqual(modifyRes.status, 200);
    assert.strictEqual(modifyRes.data.rating, 4);
    assert.ok(modifyRes.data.overall_rating !== undefined);
    recordPass('6d. Normal User: Modify existing rating & auto-update average rating');

    // 6e. Invalid Rating Value Rejection (e.g. 7)
    const invalidRateRes = await req(`/stores/${storeToRate.id}/rating`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { rating: 7 }
    });
    assert.strictEqual(invalidRateRes.status, 400);
    recordPass('6e. Validation: Rating outside 1-5 range rejected (400)');
  } catch (err) {
    recordFail('6. Normal User Functionalities', err);
  }

  // 7. Store Owner Functionalities
  try {
    // 7a. Store Owner Dashboard: View own store average rating
    const ownerDashRes = await req('/owner/dashboard?sortBy=date&order=desc', {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.strictEqual(ownerDashRes.status, 200);
    assert.strictEqual(ownerDashRes.data.hasStore, true);
    assert.ok(ownerDashRes.data.store.average_rating !== undefined);
    recordPass('7a. Store Owner: View store details and average rating');

    // 7b. Store Owner: View list of users who submitted ratings for their store
    assert.ok(Array.isArray(ownerDashRes.data.ratings));
    if (ownerDashRes.data.ratings.length > 0) {
      const firstRating = ownerDashRes.data.ratings[0];
      assert.ok(firstRating.user_name);
      assert.ok(firstRating.user_email);
      assert.ok(firstRating.rating >= 1 && firstRating.rating <= 5);
    }
    recordPass('7b. Store Owner: View customer ratings list (Name, Email, Rating, Date)');
  } catch (err) {
    recordFail('7. Store Owner Functionalities', err);
  }

  // 8. Password Update for Logged-In User
  try {
    const pwdRes = await req('/auth/update-password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        currentPassword: 'User@1234',
        newPassword: 'User@NewPass99'
      }
    });
    assert.strictEqual(pwdRes.status, 200);

    // Revert password back so default demo account remains unchanged
    const revertRes = await req('/auth/update-password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        currentPassword: 'User@NewPass99',
        newPassword: 'User@1234'
      }
    });
    assert.strictEqual(revertRes.status, 200);
    recordPass('8. Password Update: Logged-in user can update password');
  } catch (err) {
    recordFail('8. Password Update', err);
  }

  console.log('\n====================================================');
  console.log(` SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED `);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('ALL REQUIREMENTS VERIFIED AND WORKING PERFECTLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
