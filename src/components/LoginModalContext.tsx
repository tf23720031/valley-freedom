import { createContext, useContext } from 'react'

export const LoginModalContext = createContext<((returnTo?: string) => void) | null>(null)
export function useOpenLoginModal() {
  const open = useContext(LoginModalContext)
  if (!open) throw new Error('Login modal is unavailable outside the site shell')
  return open
}
