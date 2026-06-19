export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;
  console.log('NY REGISTRERING:', JSON.stringify(payload));

  // Send til Make.com / n8n webhook hvis konfigurert
  const webhookUrl = process.env.REGISTRATION_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Webhook feil:', err.message);
    }
  }

  // HubSpot CRM hvis konfigurert
  const hsToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (hsToken) {
    try {
      await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hsToken}`,
        },
        body: JSON.stringify({
          properties: {
            firstname: payload.fornavn,
            lastname: payload.etternavn,
            email: payload.epost,
            company: payload.kontor,
            jobtitle: payload.rolle,
            hs_lead_status: 'NEW',
            lifecyclestage: 'lead',
          },
        }),
      });
    } catch (err) {
      console.error('HubSpot feil:', err.message);
    }
  }

  return res.status(200).json({ success: true });
}
