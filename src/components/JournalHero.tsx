export function JournalWave() {
  return <svg className="journal-wave" viewBox="0 0 1200 24" preserveAspectRatio="none" aria-hidden="true"><path d="M0 14 35 9 62 16 96 5 129 12 163 18 196 10 229 15 264 6 300 13 337 7 370 16 405 9 442 14 479 5 515 12 551 7 587 15 622 8 658 13 694 5 730 12 767 7 805 16 843 9 880 14 917 6 953 13 990 8 1026 15 1062 7 1098 12 1134 6 1171 13 1200 8"/></svg>
}

export function JournalHero({ title, eyebrow, description, photo }: { title: string; eyebrow: string; description: string; photo: string }) {
  return <><header className="journal-hero"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><figure><img src={photo} alt="花東旅行氛圍示意"/><figcaption>氛圍參考照</figcaption></figure></header><JournalWave/></>
}
