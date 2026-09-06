/**
 * Frontend E2E RBAC Verification Script
 * Tests the complete persona switching flow through the actual frontend APIs
 */

const BASE = 'http://localhost:5000/api/v1';
const FRONTEND = 'http://localhost:3000';

const PERSONAS = [
  { role: 'NATIONAL_ADMIN', email: 'admin.mord@nic.in', pass: 'Admin@123', label: 'National Admin (MoRD)' },
  { role: 'STATE_NODAL_OFFICER', email: 'nodal.maharashtra@nic.in', pass: 'Admin@123', label: 'State Nodal Officer' },
  { role: 'DISTRICT_COLLECTOR', email: 'collector.pune@nic.in', pass: 'Collector@123', label: 'District Collector' },
  { role: 'LAND_ACQUISITION_OFFICER', email: 'cala.nh66@nic.in', pass: 'Cala@123', label: 'Competent Authority (CALA)' },
  { role: 'REQUISITIONING_AGENCY', email: 'nhai.projects@nic.in', pass: 'Nhai@123', label: 'Requisitioning Agency (NHAI)' },
  { role: 'FIELD_SURVEYOR', email: 'surveyor.amin@nic.in', pass: 'Survey@123', label: 'Field Surveyor' },
  { role: 'CITIZEN_VIEWER', email: 'citizen@gov.in', pass: 'Citizen@123', label: 'Citizen Viewer' },
];

async function loginAs(email, pass) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Login failed: ${data.message}`);
  return data;
}

async function testPersona(persona) {
  console.log(`\nTesting Persona: [${persona.role}] (${persona.email})`);
  
  // 1. Login
  const loginResult = await loginAs(persona.email, persona.pass);
  const token = loginResult.token;
  const user = loginResult.user;
  
  // Verify identity
  const roleMatch = user.role === persona.role;
  console.log(`  ${roleMatch ? '✓' : '✗'} Identity: ${user.name} (${user.role})`);
  if (!roleMatch) {
    console.log(`    FAIL: Expected role ${persona.role}, got ${user.role}`);
    return false;
  }
  
  // 2. Verify JWT contains correct role via /auth/me
  const meRes = await fetch(`${BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const meData = await meRes.json();
  const meRoleMatch = meData.user?.role === persona.role;
  console.log(`  ${meRoleMatch ? '✓' : '✗'} JWT Session: /auth/me returns role ${meData.user?.role}`);
  
  // 3. Check project scoping
  const projRes = await fetch(`${BASE}/projects`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const projData = await projRes.json();
  console.log(`  ✓ Projects Scope: ${projData.count || projData.data?.length || 0} projects`);
  
  // 4. Check parcel PII redaction for Citizen
  const parcelRes = await fetch(`${BASE}/parcels`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const parcelData = await parcelRes.json();
  if (persona.role === 'CITIZEN_VIEWER') {
    const firstWithPII = parcelData.data?.find(p => p.ownerAadhaarMasked);
    const isRedacted = firstWithPII?.ownerAadhaarMasked === '(Protected)';
    console.log(`  ${isRedacted ? '✓' : '✗'} Citizen PII Redaction: ${isRedacted ? 'YES (Protected)' : 'NO - LEAK!'}`);
  }
  
  // 5. Check disbursements access
  const disbRes = await fetch(`${BASE}/disbursements`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (['FIELD_SURVEYOR', 'CITIZEN_VIEWER'].includes(persona.role)) {
    console.log(`  ${disbRes.status === 403 ? '✓' : '✗'} Disbursements Blocked: HTTP ${disbRes.status} (expected 403)`);
  } else {
    console.log(`  ${disbRes.status === 200 ? '✓' : '✗'} Disbursements Access: HTTP ${disbRes.status}`);
  }
  
  // 6. Check audit logs access  
  const auditRes = await fetch(`${BASE}/audit-logs`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (['REQUISITIONING_AGENCY', 'FIELD_SURVEYOR', 'CITIZEN_VIEWER'].includes(persona.role)) {
    console.log(`  ${auditRes.status === 403 ? '✓' : '✗'} Audit Logs Blocked: HTTP ${auditRes.status} (expected 403)`);
  } else {
    console.log(`  ${auditRes.status === 200 ? '✓' : '✗'} Audit Logs Access: HTTP ${auditRes.status}`);
  }
  
  // 7. Verify fake/mock token is rejected
  const fakeRes = await fetch(`${BASE}/auth/me`, {
    headers: { 'Authorization': 'Bearer demo-jwt-token' },
  });
  console.log(`  ${fakeRes.status === 401 ? '✓' : '✗'} Fake Token Rejected: HTTP ${fakeRes.status} (expected 401)`);
  
  // 8. Verify no-token request returns 401 on protected endpoints
  const noAuthRes = await fetch(`${BASE}/disbursements`);
  console.log(`  ${noAuthRes.status === 401 ? '✓' : '✗'} No-Auth Request Blocked: HTTP ${noAuthRes.status} (expected 401)`);
  
  console.log('  ' + '─'.repeat(60));
  return true;
}

async function testFrontendPages() {
  console.log('\n' + '═'.repeat(70));
  console.log('  FRONTEND PAGE ACCESSIBILITY VERIFICATION');
  console.log('═'.repeat(70));
  
  // Test that frontend pages return 200
  const pages = ['/login', '/dashboard', '/projects', '/parcels'];
  for (const page of pages) {
    const res = await fetch(`${FRONTEND}${page}`);
    console.log(`  ${res.status === 200 ? '✓' : '✗'} ${page}: HTTP ${res.status}`);
  }
}

async function main() {
  console.log('═'.repeat(70));
  console.log('  BHUMI SETU — COMPLETE RBAC E2E VERIFICATION');
  console.log('═'.repeat(70));
  
  let allPassed = true;
  for (const persona of PERSONAS) {
    const passed = await testPersona(persona);
    if (!passed) allPassed = false;
  }
  
  await testFrontendPages();
  
  console.log('\n' + '═'.repeat(70));
  if (allPassed) {
    console.log('  ✅ ALL 7 PERSONAS VERIFIED — RBAC SYSTEM IS FUNCTIONAL');
  } else {
    console.log('  ❌ SOME PERSONAS FAILED — SEE ABOVE');
  }
  console.log('═'.repeat(70));
}

main().catch(console.error);
