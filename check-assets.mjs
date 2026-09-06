async function checkAll() {
  const routes = [
    '/',
    '/dashboard',
    '/projects',
    '/parcels',
    '/awards',
    '/disbursements',
    '/field-survey',
    '/rr-monitoring',
    '/risk-engine',
    '/mis-reports',
    '/login'
  ];

  let total404s = 0;
  let totalChecked = 0;

  for (const route of routes) {
    const pageRes = await fetch('http://localhost:3000' + route);
    if (!pageRes.ok) {
      console.log(`[PAGE ERROR] ${route} returned ${pageRes.status}`);
      total404s++;
      continue;
    }
    const html = await pageRes.text();
    const assets = [
      ...[...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map(m => m[1]),
      ...[...html.matchAll(/href="(\/_next\/static\/[^"]+)"/g)].map(m => m[1])
    ];

    for (const asset of assets) {
      totalChecked++;
      const assetRes = await fetch('http://localhost:3000' + asset);
      if (assetRes.status !== 200) {
        console.log(`[ASSET 404] Page ${route} -> Asset ${asset} returned ${assetRes.status}`);
        total404s++;
      }
    }
  }

  console.log(`\nAsset Check Complete: ${totalChecked} assets checked, ${total404s} errors found.`);
}

checkAll().catch(console.error);
