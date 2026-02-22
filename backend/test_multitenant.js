import fetch from 'node-fetch'; // Requires node-fetch or Node v18+ native fetch
// If Node >= 18, fetch is native. We'll use native fetch.

const BASE_URL = 'http://localhost:4000/api';

async function runTests() {
    let passed = 0;
    let failed = 0;

    const assert = (condition, msg) => {
        if (condition) {
            console.log(`✅ ${msg}`);
            passed++;
        } else {
            console.error(`❌ ${msg}`);
            failed++;
        }
    };

    try {
        console.log("=== Running Multi-Tenant verification ===");

        // TEST 1 & TEST 4: Signup Tenant A
        const resA = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgName: 'Tenant A', name: 'User A', email: `usera_${Date.now()}@test.com`, password: 'password123', plan: 'starter' })
        });
        const dataA = await resA.json();
        assert(dataA.success === true, "Auth: Signup works for Tenant A");
        const tokenA = dataA.token;
        const tenantAId = dataA.tenant.id;

        // TEST 4: Anonymous routes
        const resAnon = await fetch(`${BASE_URL}/sites`, { method: 'GET' });
        assert(resAnon.status === 401, "Auth Required: Anonymous GET /sites returns 401");

        // TEST 1: Signup Tenant B
        const resB = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgName: 'Tenant B', name: 'User B', email: `userb_${Date.now()}@test.com`, password: 'password123', plan: 'starter' })
        });
        const dataB = await resB.json();
        assert(dataB.success === true, "Auth: Signup works for Tenant B");
        const tokenB = dataB.token;

        // Create Site for Tenant A
        const resSiteA = await fetch(`${BASE_URL}/sites/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
            body: JSON.stringify({ name: 'Site A1' })
        });
        const dataSiteA = await resSiteA.json();
        assert(dataSiteA.success === true, "Sites: Tenant A can create a site");
        const siteAId = dataSiteA.project.id;

        // TEST 1: Tenant Isolation
        const resReadAFromB = await fetch(`${BASE_URL}/sites/${siteAId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${tokenB}` }
        });
        assert(resReadAFromB.status === 403 || resReadAFromB.status === 404, "Isolation: Tenant B cannot read Tenant A's site");

        // TEST 3: Site Limits (Starter -> max 2 sites)
        await fetch(`${BASE_URL}/sites/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
            body: JSON.stringify({ name: 'Site A2' })
        }); // 2nd site

        const resSiteA3 = await fetch(`${BASE_URL}/sites/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
            body: JSON.stringify({ name: 'Site A3' })
        }); // 3rd site (should fail)
        assert(resSiteA3.status === 403, "Limits: Tenant A hit limit for sites created (starter = 2)");

        // TEST 5: Owner-only Roles for Deletion
        // Deleting Site A1 with Token A (since User A is Owner)
        const resDelA1 = await fetch(`${BASE_URL}/sites/${siteAId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenA}` }
        });
        assert(resDelA1.status === 200, "Roles: Owner can delete their own site");

    } catch (e) {
        console.error("Test script failed", e);
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

runTests();
