import { eventTag, readTrackingToken, redirectFor } from './_lib/roadmap-email.js'
import { addContactTags } from './_lib/roadmap-email-runner.js'

const ALLOWED_ACTIONS = new Set(['download', 'testimonial', 'video', 'booking'])

export default async function handler(req, res) {
  try {
    const action = String(req.query?.action || '')
    if (!ALLOWED_ACTIONS.has(action)) throw new Error('Unknown email action')
    const payload = readTrackingToken(req.query?.token, process.env.ROADMAP_EMAIL_TRACKING_SECRET)
    const destination = redirectFor(payload, action)
    try {
      await addContactTags(payload.contactId, [eventTag(payload.step, `${action}-clicked`)], process.env.GHL_PIT_BERNARD)
    } catch (error) {
      console.error('[email-click] tag failed:', error.message)
    }
    res.setHeader('Cache-Control', 'private, no-store, max-age=0')
    return res.redirect(302, destination)
  } catch (error) {
    return res.status(400).json({ error: 'Invalid tracking link' })
  }
}
