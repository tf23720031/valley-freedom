import { useEffect, useState } from 'react'
import { loadCompanionPhoto } from '../domain/companionAvatarStorage'

export function CompanionAvatar({ companionId, imageKey, src, alt, className }: { companionId: string; imageKey?: string; src: string; alt: string; className?: string }) {
  const [localUrl, setLocalUrl] = useState('')
  useEffect(() => {
    let active = true, created = ''
    if (imageKey) loadCompanionPhoto(imageKey).then((blob) => { if (blob && active) { created = URL.createObjectURL(blob); setLocalUrl(created) } }).catch(() => undefined)
    else setLocalUrl('')
    return () => { active = false; if (created) URL.revokeObjectURL(created) }
  }, [imageKey, companionId])
  return <img className={className} src={localUrl || src} alt={alt}/>
}
