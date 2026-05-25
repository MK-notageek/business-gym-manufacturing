export default function handler(req, res) {
  const pixelId = process.env.META_PIXEL_ID || ''
  const token = process.env.META_CAPI_TOKEN || ''
  res.status(200).json({
    pixel_set: !!pixelId,
    pixel_preview: pixelId ? pixelId.slice(0, 6) + '...' : '(empty)',
    token_set: !!token,
    token_preview: token ? token.slice(0, 8) + '...' : '(empty)',
    node_version: process.version,
  })
}
