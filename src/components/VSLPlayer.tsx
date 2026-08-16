import { useEffect, useRef, useState } from 'react'

/**
 * The VSL player from the post-booking page, lifted out so the pre-booking
 * thank-you page plays its video in exactly the same manner: autoplays muted,
 * shows a tap-for-sound cue until the viewer unmutes, and carries a scrubbable
 * progress bar along the bottom edge.
 *
 * The `.vsl-*` class names live in each page's own <style> block; both pages
 * carry the identical rules.
 */
export default function VSLPlayer({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(true)
  const [pct, setPct] = useState(0)
  const [buffering, setBuffering] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true // set the muted PROPERTY before play(); the JSX attr alone is unreliable in Chrome
    v.play().catch(() => {})
  }, [])

  // Unmuting is the real start of the VSL. The muted autoplay is only there to
  // prove the page is alive, so whatever ran while the viewer was reading the
  // page above is not the pitch — rewind to 0 so they hear it from the hook
  // rather than dropping in 20 seconds late.
  const unmute = () => {
    const v = ref.current
    if (!v) return
    v.muted = false
    v.currentTime = 0
    setPct(0)
    setMuted(false)
    if (v.paused) v.play().catch(() => {})
  }
  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.muted) { unmute(); return }
    if (v.paused) v.play(); else v.pause()
  }
  const seekTo = (clientX: number) => {
    const v = ref.current, t = trackRef.current
    if (!v || !t || !v.duration) return
    const r = t.getBoundingClientRect()
    const frac = Math.min(Math.max((clientX - r.left) / r.width, 0), 1)
    v.currentTime = frac * v.duration
    setPct(frac * 100)
  }
  const onScrub = (e: { clientX: number; stopPropagation: () => void }) => {
    e.stopPropagation()
    seekTo(e.clientX)
    const move = (ev: PointerEvent) => seekTo(ev.clientX)
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <>
      <video
        ref={ref}
        className="vsl-video"
        playsInline
        muted
        autoPlay
        preload="auto"
        poster={poster}
        onClick={toggle}
        onWaiting={() => setBuffering(true)}
        onStalled={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration) setPct((v.currentTime / v.duration) * 100) }}
      >
        <source src={src} type="video/mp4" />
      </video>
      {muted && (
        <div className="vsl-cue" data-soundcue onClick={unmute}>
          <div className="vsl-ring"><svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.06A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg></div>
          <div className="vsl-cue-lbl">Your video has started</div>
          <div className="vsl-cue-sub">▶ Tap for sound</div>
        </div>
      )}
      {buffering && <div className="vsl-spinner" aria-hidden="true"><span /></div>}
      <div className="vsl-track" ref={trackRef} onPointerDown={onScrub}>
        <div className="vsl-bar" style={{ width: pct + '%' }}><i className="vsl-knob" /></div>
      </div>
    </>
  )
}
