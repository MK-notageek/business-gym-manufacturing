import { ENROLLED_TAG, nextDueStep } from './_lib/roadmap-email.js'
import { listContacts, sendRoadmapStep } from './_lib/roadmap-email-runner.js'

function authorized(req) {
  const secret = process.env.CRON_SECRET?.trim()
  return Boolean(secret && req.headers.authorization === `Bearer ${secret}`)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  const ghlToken = process.env.GHL_PIT_BERNARD?.trim()
  const trackingSecret = process.env.ROADMAP_EMAIL_TRACKING_SECRET?.trim()
  if (!ghlToken || !trackingSecret) return res.status(500).json({ error: 'Server misconfiguration' })

  try {
    const contacts = await listContacts(ghlToken)
    const enrolled = contacts.filter(contact => (contact.tags || []).includes(ENROLLED_TAG))
    let sent = 0
    let failed = 0
    let skipped = 0

    for (const contact of enrolled) {
      const step = nextDueStep(contact)
      if (!step) { skipped += 1; continue }
      try {
        await sendRoadmapStep({ contact, step, ghlToken, trackingSecret })
        sent += 1
      } catch (error) {
        failed += 1
        console.error('[roadmap-email-cron] send failed:', error.message)
      }
    }

    return res.status(200).json({ ok: true, enrolled: enrolled.length, sent, failed, skipped })
  } catch (error) {
    console.error('[roadmap-email-cron] failed:', error.message)
    return res.status(502).json({ error: 'Roadmap email cron failed' })
  }
}
