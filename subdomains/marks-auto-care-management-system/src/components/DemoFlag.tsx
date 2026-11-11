import { useState } from 'react'

interface DemoFlagProps {
  /** Plain-English description of what this action does once the backend exists */
  explainer: string
  children: React.ReactNode
  /** Render inline (wraps a button/element) vs a standalone trigger */
  inline?: boolean
}

/**
 * Wraps any "this would normally save/send/sync something" action.
 * In this demo it never calls a real backend — it just shows what
 * would actually happen in production, so a reviewer can click through
 * the whole platform without us having to fake a database.
 */
export default function DemoFlag({ explainer, children, inline = true }: DemoFlagProps) {
  const [open, setOpen] = useState(false)

  return (
    <span className={inline ? 'relative inline-block' : 'relative block'}>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </span>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="card max-w-md w-full border-brand-lime/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="pill bg-brand-lime/15 text-brand-lime">Demo only</span>
              <span className="label-caps">No backend connected yet</span>
            </div>
            <p className="text-sm text-white/85 leading-relaxed">{explainer}</p>
            <button className="btn-ghost mt-4 w-full text-sm" onClick={() => setOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </span>
  )
}
