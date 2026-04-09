import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import './App.css'

const PHOTOS_PER_DOG = 4

function dogPhotoUrls(breedSlug: string, dogSlug: string): string[] {
  return Array.from(
    { length: PHOTOS_PER_DOG },
    (_, i) => `https://picsum.photos/seed/brs-${breedSlug}-${dogSlug}-img${i}/640/400`,
  )
}

function DogPhotoCarousel({ label, urls }: { label: string; urls: readonly string[] }) {
  const [index, setIndex] = useState(0)
  const regionRef = useRef<HTMLDivElement>(null)
  const n = urls.length
  const prev = () => setIndex((i) => (i - 1 + n) % n)
  const next = () => setIndex((i) => (i + 1) % n)

  useEffect(() => {
    const el = regionRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndex((i) => (i - 1 + n) % n)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIndex((i) => (i + 1) % n)
      }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [n])

  return (
    <div
      ref={regionRef}
      className="dog-carousel"
      role="region"
      aria-roledescription="Karuzela zdjęć"
      aria-label={`Zdjęcia: ${label}`}
      tabIndex={0}
    >
      <div className="dog-carousel-viewport">
        <img
          src={urls[index]}
          alt={`${label} — zdjęcie ${index + 1} z ${n} (placeholder)`}
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
      <div className="dog-carousel-dots" aria-hidden="true">
        {urls.map((_, i) => (
          <span key={i} className={`dog-carousel-dot${i === index ? ' is-active' : ''}`} />
        ))}
      </div>
      <button
        type="button"
        className="dog-carousel-btn dog-carousel-btn-prev"
        onClick={prev}
        aria-label="Poprzednie zdjęcie"
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        className="dog-carousel-btn dog-carousel-btn-next"
        onClick={next}
        aria-label="Następne zdjęcie"
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  )
}

const navItems = [
  { href: '#top', label: 'Strona główna' },
  { href: '#o-nas', label: 'O nas' },
  { href: '#aktualnosci', label: 'Aktualności' },
  { href: '#nasze-psy', label: 'Nasze psy' },
  { href: '#kontakt', label: 'Kontakt' },
] as const

const breeds = [
  {
    name: 'Rottweiler',
    slug: 'rottweiler',
    dogs: [
      { name: 'Aston', slug: 'aston' },
      { name: 'Pola', slug: 'pola' },
    ],
  },
  {
    name: 'Boston Terrier',
    slug: 'boston-terrier',
    dogs: [
      { name: 'Connie', slug: 'connie' },
      { name: 'Dixie', slug: 'dixie' },
    ],
  },
] as const

const WEB3FORMS_URL = 'https://api.web3forms.com/submit'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [formStatus, setFormStatus] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const formNameId = useId()
  const formEmailId = useId()
  const formMessageId = useId()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormStatus(null)
    setFormError(null)

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim()
    if (!accessKey) {
      setFormError(
        'Brak klucza Web3Forms. Utwórz plik .env z VITE_WEB3FORMS_ACCESS_KEY (patrz .env.example).',
      )
      return
    }

    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()

    setFormSubmitting(true)
    try {
      const res = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: 'Wiadomość z formularza strony Beskid Rott Stars',
          name,
          email,
          message,
        }),
      })
      const json = (await res.json()) as { success?: boolean; message?: string }
      if (!res.ok || json.success === false) {
        setFormError(json.message ?? 'Nie udało się wysłać wiadomości. Spróbuj ponownie później.')
        return
      }
      setFormStatus('Dziękujemy — wiadomość została wysłana.')
      form.reset()
    } catch {
      setFormError('Błąd sieci. Sprawdź połączenie i spróbuj ponownie.')
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Przejdź do treści
      </a>

      <header className="site-header">
        <div className="header-inner">
          <a href="#top" className="logo">
            Beskid Rott Stars
          </a>
          <nav className="nav-desktop" aria-label="Główna nawigacja">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            Menu
          </button>
        </div>
        <nav
          id="mobile-nav"
          className={`nav-mobile${menuOpen ? ' open' : ''}`}
          aria-label="Menu mobilne"
          aria-hidden={!menuOpen}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="main">
        <section id="top" className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title">Beskid Rott Stars</h1>
          <p className="hero-lead">
            Domowa hodowla psów rottweiler i boston terrier
          </p>
          <a className="btn" href="#nasze-psy">
            Nasze psy
          </a>
        </section>

        <section id="o-nas" className="section section-alt" aria-labelledby="o-nas-title">
          <div className="section-inner">
            <h2 id="o-nas-title">O nas</h2>
            <p style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto', color: 'var(--color-muted)' }}>
            Jesteśmy małą, domową hodowlą, w której psy są przede wszystkim członkami rodziny. Nasze bostony mieszkają z nami w domu, uczestniczą w codziennym życiu i wychowywane są w atmosferze ogromnej miłości, troski oraz bliskości człowieka.
Dlaczego nasze szczenięta?
Pochodzą z małej, odpowiedzialnej hodowli domowej gdzie rodzice są w pełni przebadani pod kątem chorób typowych dla rasy,
dbamy o zdrowie, prawidłowy rozwój i socjalizację od pierwszych dni życia.
Szczenięta będą przyzwyczajane do domowych odgłosów takich jak czajnik czy piekarnik, kontaktu z ludźmi oraz codziennej pielęgnacji.
Naszym priorytetem jest zdrowie, stabilny charakter oraz doskonałe warunki wychowu. Każdy maluch otrzyma metrykę, książeczkę zdrowia, będzie odpowiednio zaszczepiony i odrobaczony stosownie do wieku oraz gotowy, by stać się ukochanym członkiem nowej rodziny.
Szukamy dla naszych szczeniąt odpowiedzialnych, ciepłych domów, w których będą traktowane jak prawdziwi członkowie rodziny.
Jeśli marzysz o wesołym, inteligentnym i pełnym uroku nowym członku rodziny, zapraszamy do kontaktu – chętnie udzielimy wszelkich informacji oraz opowiemy więcej o naszej hodowli i planowanym miocie.
Zainteresowane osoby prosimy o wiadomość prywatną lub kontakt telefoniczny. 
Zapraszam na stronę FB 
Beskid Rott Stars
            </p>
          </div>
        </section>

        <section id="aktualnosci" className="section" aria-labelledby="aktualnosci-title">
          <div className="section-inner">
            <h2 id="aktualnosci-title">Aktualności</h2>
            <p style={{ textAlign: 'center', maxWidth: '36rem', margin: '0 auto', color: 'var(--color-muted)' }}>
              Tu możesz dodać wpisy o miotach, wystawach i planach hodowlanych.
            </p>
          </div>
        </section>

        <section id="nasze-psy" className="section section-alt" aria-labelledby="psy-title">
          <div className="section-inner">
            <h2 id="psy-title">Poznaj nasze psy</h2>
            <div className="breeds-grid">
              {breeds.map((b) => (
                <article key={b.slug} className="breed-card">
                  <div className="breed-visual" aria-hidden="true">
                    <span>{b.name}</span>
                  </div>
                  <div className="breed-body">
                    <h3>{b.name}</h3>
                    <a href={`#${b.slug}`}>Zobacz więcej Beskid Rott Stars</a>
                  </div>
                </article>
              ))}
            </div>

            <div className="breed-details">
              {breeds.map((b) => (
                <section
                  key={b.slug}
                  id={b.slug}
                  className="breed-detail"
                  aria-labelledby={`heading-${b.slug}`}
                >
                  <h3 id={`heading-${b.slug}`} className="breed-detail-title">
                    {b.name}
                  </h3>
                  <ul className="dog-grid" role="list">
                    {b.dogs.map((dog) => (
                      <li key={dog.slug} id={`${b.slug}-${dog.slug}`} className="dog-card">
                        <DogPhotoCarousel label={dog.name} urls={dogPhotoUrls(b.slug, dog.slug)} />
                        <div className="dog-card-footer">
                          <span className="dog-card-name">{dog.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section id="kontakt" className="section contact-section" aria-labelledby="kontakt-title">
          <div className="section-inner contact-grid">
            <div className="contact-form">
              <h2 id="kontakt-title">Kontakt</h2>
              <p className="form-sub">Zostaw nam wiadomość</p>
              <form onSubmit={onSubmit} noValidate aria-busy={formSubmitting}>
                <div className="form-group">
                  <label htmlFor={formNameId}>Imię i nazwisko</label>
                  <input id={formNameId} name="name" type="text" autoComplete="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor={formEmailId}>E-mail</label>
                  <input id={formEmailId} name="email" type="email" autoComplete="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor={formMessageId}>Wiadomość</label>
                  <textarea id={formMessageId} name="message" required />
                </div>
                <button type="submit" className="btn" disabled={formSubmitting}>
                  {formSubmitting ? 'Wysyłanie…' : 'Wyślij'}
                </button>
                {formStatus ? (
                  <p className="form-status" role="status">
                    {formStatus}
                  </p>
                ) : null}
                {formError ? (
                  <p className="form-status form-status-error" role="alert">
                    {formError}
                  </p>
                ) : null}
              </form>
            </div>
            <aside className="contact-aside" aria-label="Dane kontaktowe">
              <h3>Bielsko-Biała</h3>
              <h3>
                <a>881 503 322</a>
              </h3>
              <p>
                Hodowla psów rasy Rottweiler prowadzona w domu
              </p>
              <ul>
                <li>
                  <a>881 503 322</a>
                </li>
                <li>
                  <a href="https://maps.app.goo.gl/c8o5PGw7B1KS3c9A9" target="_blank" rel="noopener noreferrer">
                    43-382 Bielsko-Biała, Lubiana 17
                  </a>
                </li>
                <li>8:00–20:00</li>
                <li>W nagłych przypadkach całodobowo</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas metus justo, molestie vitae sodales
          eget, efficitur eget metus.
        </p>
        <p>© {new Date().getFullYear()} Beskid Rott Stars</p>
      </footer>
    </>
  )
}
