export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { fornavn, etternavn, epost, kontor, rolle } = req.body;
  if (!fornavn || !epost || !kontor) return res.status(400).json({ error: 'Manglende felt' });

  const payload = { fornavn, etternavn, epost, kontor, rolle, tidspunkt: new Date().toISOString() };
  console.log('NY REGISTRERING:', JSON.stringify(payload));

  const wh = process.env.REGISTRATION_WEBHOOK_URL;
  if (wh) {
    try {
      await fetch(wh, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (e) { console.error('Webhook:', e.message); }
  }

  const hs = process.env.HUBSPOT_ACCESS_TOKEN;
  if (hs) {
    try {
      await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hs}` },
        body: JSON.stringify({ properties: { firstname: fornavn, lastname: etternavn, email: epost, company: kontor, jobtitle: rolle } }),
      });
    } catch (e) { console.error('HubSpot:', e.message); }
  }

  return res.status(200).json({ success: true });
}
