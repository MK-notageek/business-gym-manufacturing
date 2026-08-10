import { eventTag, readTrackingToken } from './_lib/roadmap-email.js'
import { addContactTags } from './_lib/roadmap-email-runner.js'

const PIXEL = Buffer.from('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', 'base64')

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'image/gif')
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  try {
    const payload = readTrackingToken(req.query?.token, process.env.ROADMAP_EMAIL_TRACKING_SECRET)
    if (payload?.contactId && payload?.step) {
      await addContactTags(payload.contactId, [eventTag(payload.step, 'opened')], process.env.GHL_PIT_BERNARD)
    }
  } catch (error) {
    console.warn('[email-open] tracking skipped:', error.message)
  }
  return res.status(200).send(PIXEL)
}
