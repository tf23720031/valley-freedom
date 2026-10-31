import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'

type Toast = { id: number; message: string; tone: 'success' | 'error' | 'info' }
const FeedbackContext = createContext<{ notify: (message: string, tone?: Toast['tone']) => void } | null>(null)
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const value = useMemo(() => ({ notify(message: string, tone: Toast['tone'] = 'success') {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600)
  } }), [])
  return <FeedbackContext.Provider value={value}>{children}<div className="toast-region" aria-live="polite">{toasts.map((toast) => <div className={`toast toast-${toast.tone}`} key={toast.id}><Check size={16} aria-hidden="true" />{toast.message}<button aria-label="關閉通知" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}><X size={15} /></button></div>)}</div></FeedbackContext.Provider>
}
export function useNotify() {
  const context = useContext(FeedbackContext)
  if (!context) throw new Error('useNotify must be used inside FeedbackProvider')
  return context.notify
}

export function ConfirmDialog({ open, title, description, confirmLabel = '確認', onCancel, onConfirm, danger = false, children }: { open: boolean; title: string; description: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void; danger?: boolean; children?: React.ReactNode }) {
  const dialogRef = useRef<HTMLElement>(null)
  const cancelRef = useRef(onCancel)
  cancelRef.current = onCancel
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusables = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])') ?? [])
    focusables()[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); cancelRef.current(); return }
      if (event.key !== 'Tab') return
      const targets = focusables()
      if (!targets.length) { event.preventDefault(); dialogRef.current?.focus(); return }
      const first = targets[0], last = targets.at(-1)!
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; previous?.focus() }
  }, [open])
  if (!open) return null
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}><section ref={dialogRef} tabIndex={-1} className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><span className="eyebrow">請再次確認</span><h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p>{children}<div className="dialog-actions"><button className="button button-quiet" onClick={onCancel}>返回</button><button className={`button ${danger ? 'button-danger' : 'button-primary'}`} onClick={onConfirm}>{confirmLabel}</button></div></section></div>
}
