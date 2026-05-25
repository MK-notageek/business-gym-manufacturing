import { sendCapiEvent } from './_lib/meta-capi.js'

export default async function handler(req, res) {
  const pixelId = process.env.META_PIXEL_ID || ''
  const token = process.env.META_CAPI_TOKEN || ''

  let capiResult = null
  try {
    capiResult = await sendCapiEvent({
      eventName: 'Lead',
      eventId: `diag-${Date.now()}`,
      eventSourceUrl: 'https://roadmap.premierbusinessacademy.co.nz',
      email: 'diagtest@example.com',
      testEventCode: 'TEST57247',
    })
  } catch (err) {
    capiResult = { error: err.message }
  }

  res.status(200).json({
    pixel_set: !!pixelId,
    token_set: !!token,
    node_version: process.version,
    capi_result: capiResult,
  })
}
