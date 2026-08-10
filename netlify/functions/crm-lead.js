// Receives lead form submissions from the browser and forwards them to
// rndCRM server-side, so CRM_WIT_SECRET never reaches client-side code.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }

  let lead;
  try {
    lead = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Invalid JSON' }) };
  }

  const contactPerson = (lead.contactPerson || '').trim();
  if (!contactPerson) {
    return { statusCode: 400, body: JSON.stringify({ success: false, error: 'contactPerson is required' }) };
  }

  const { CRM_WIT_DOMAIN, CRM_WIT_SECRET, CRM_WIT_TRACKING_ID } = process.env;
  if (!CRM_WIT_DOMAIN || !CRM_WIT_SECRET || !CRM_WIT_TRACKING_ID) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: 'CRM is not configured' }) };
  }

  const domain = CRM_WIT_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    const res = await fetch(`https://${domain}/api/wit/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackingId: CRM_WIT_TRACKING_ID,
        apiSecret: CRM_WIT_SECRET,
        visitorId: lead.visitorId || '',
        sessionId: lead.sessionId || '',
        companyName: lead.companyName || contactPerson,
        contactPerson,
        email: lead.email || '',
        phone: lead.phone || '',
        dealValue: lead.dealValue || 0,
        customFields: lead.customFields || {}
      })
    });

    if (!res.ok) {
      return { statusCode: 502, body: JSON.stringify({ success: false, error: 'CRM rejected the lead' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ success: false, error: 'Could not reach CRM' }) };
  }
};
