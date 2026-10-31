export function ageAt(birthDate: string, now = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00`)
  if (!birthDate || Number.isNaN(birth.getTime())) return -1
  let age = now.getFullYear() - birth.getFullYear()
  const beforeBirthday = now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  if (beforeBirthday) age -= 1
  return age
}

export function validateCompanionBirthDate(birthDate: string, now = new Date()): { ok: true; age: number } | { ok: false; error: string } {
  if (!birthDate || Number.isNaN(new Date(`${birthDate}T00:00:00`).getTime())) return { ok: false, error: '請填寫有效的出生日期。' }
  if (new Date(`${birthDate}T00:00:00`) > new Date(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`)) return { ok: false, error: '出生日期不可晚於今天。' }
  const age = ageAt(birthDate, now)
  return age < 20 ? { ok: false, error: '啟用在地旅伴身分須年滿 20 歲。' } : { ok: true, age }
}
