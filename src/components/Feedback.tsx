import { createPortal } from 'react-dom'
import { createContext, useContext, useMemo, useState, useId } from 'react'
import { Check, X } from 'lucide-react'
import { useDialogBehavior } from './useDialogBehavior'

type Toast = { id: number; message: string; tone: 'success' | 'error' | 'info' }
const FeedbackContext = createContext<{ notify: (message: string, tone?: Toast['tone']) => void } | null>(null)
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const value = useMemo(() => ({ notify(message: string, tone: Toast['tone'] = 'success') {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600)
  } }), [])
  return <FeedbackContext.Provider value={value}>{children}<div className="toast-region" aria-live="polite">{toasts.map((toast) => <div className={`toast show toast-${toast.tone}`} key={toast.id}><Check size={16} aria-hidden="true" />{toast.message}<button aria-label="關閉通知" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}><X size={15} /></button></div>)}</div></FeedbackContext.Provider>
}
export function useNotify() {
  const context = useContext(FeedbackContext)
  if (!context) throw new Error('useNotify must be used inside FeedbackProvider')
  return context.notify
}

export function ConfirmDialog({ open, title, description, confirmLabel = '確認', cancelLabel = '返回', onCancel, onConfirm, danger = false, confirmDisabled = false, children }: { open: boolean; title: string; description: string; confirmLabel?: string; cancelLabel?: string; onCancel: () => void; onConfirm: () => void; danger?: boolean; confirmDisabled?: boolean; children?: React.ReactNode }) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useDialogBehavior(open, onCancel)
  if (!open) return null
  return createPortal(<div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}>
    <section ref={dialogRef} tabIndex={-1} className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
      <header className="stable-dialog-header"><div><span className="eyebrow">{danger ? '取消與變更' : '預約確認'}</span><h2 id={titleId}>{title}</h2></div><button type="button" className="stable-dialog-close" aria-label="關閉視窗" onClick={onCancel}><X size={22}/></button></header>
      <div className="stable-dialog-body"><p id={descriptionId}>{description}</p>{children}</div>
      <footer className="dialog-actions stable-dialog-footer"><button type="button" className="button button-quiet" onClick={onCancel}>{cancelLabel}</button><button type="button" disabled={confirmDisabled} className={`button ${danger ? 'button-danger' : 'button-primary'}`} onClick={onConfirm}>{confirmLabel}</button></footer>
    </section>
  </div>, document.body)
}
