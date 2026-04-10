import './index.css'
import './App.css'

const WEB3FORMS_URL = 'https://api.web3forms.com/submit'
const PHOTOS_PER_DOG = 4

const carouselSources = {
  Aston: [
    'https://picsum.photos/seed/brs-rottweiler-aston-img0/640/400',
    'https://picsum.photos/seed/brs-rottweiler-aston-img1/640/400',
    'https://picsum.photos/seed/brs-rottweiler-aston-img2/640/400',
    'https://picsum.photos/seed/brs-rottweiler-aston-img3/640/400',
  ],
  Pola: [
    'https://picsum.photos/seed/brs-rottweiler-pola-img0/640/400',
    'https://picsum.photos/seed/brs-rottweiler-pola-img1/640/400',
    'https://picsum.photos/seed/brs-rottweiler-pola-img2/640/400',
    'https://picsum.photos/seed/brs-rottweiler-pola-img3/640/400',
  ],
  Connie: [
    'https://picsum.photos/seed/brs-boston-terrier-connie-img0/640/400',
    'https://picsum.photos/seed/brs-boston-terrier-connie-img1/640/400',
    'https://picsum.photos/seed/brs-boston-terrier-connie-img2/640/400',
    'https://picsum.photos/seed/brs-boston-terrier-connie-img3/640/400',
  ],
  Dixie: [
    'https://picsum.photos/seed/brs-boston-terrier-dixie-img0/640/400',
    'https://picsum.photos/seed/brs-boston-terrier-dixie-img1/640/400',
    'https://picsum.photos/seed/brs-boston-terrier-dixie-img2/640/400',
    'https://picsum.photos/seed/brs-boston-terrier-dixie-img3/640/400',
  ],
}

function setupMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle')
  const mobileNav = document.getElementById('mobile-nav')
  if (!menuToggle || !mobileNav) return

  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open')
    menuToggle.setAttribute('aria-expanded', String(isOpen))
    mobileNav.setAttribute('aria-hidden', String(!isOpen))
  })

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open')
      menuToggle.setAttribute('aria-expanded', 'false')
      mobileNav.setAttribute('aria-hidden', 'true')
    })
  })
}

function setupCarousels() {
  const carousels = document.querySelectorAll('.dog-carousel')
  carousels.forEach((carousel) => {
    const label = carousel.getAttribute('data-carousel-label') || ''
    const urls = carouselSources[label] || []
    if (urls.length !== PHOTOS_PER_DOG) return

    const image = carousel.querySelector('img')
    const dots = carousel.querySelectorAll('.dog-carousel-dot')
    const prevButton = carousel.querySelector('.dog-carousel-btn-prev')
    const nextButton = carousel.querySelector('.dog-carousel-btn-next')
    if (!image || !prevButton || !nextButton || dots.length !== PHOTOS_PER_DOG) return

    let index = 0
    const render = () => {
      image.src = urls[index]
      image.alt = `${label} - zdjęcie ${index + 1} z ${urls.length} (placeholder)`
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index))
    }
    const next = () => {
      index = (index + 1) % urls.length
      render()
    }
    const prev = () => {
      index = (index - 1 + urls.length) % urls.length
      render()
    }

    prevButton.addEventListener('click', prev)
    nextButton.addEventListener('click', next)
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        prev()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      }
    })
  })
}

function setupContactForm() {
  const form = document.getElementById('contact-form')
  const submitButton = document.getElementById('form-submit')
  const status = document.getElementById('form-status')
  const error = document.getElementById('form-error')
  if (!form || !submitButton || !status || !error) return

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    status.hidden = true
    error.hidden = true
    status.textContent = ''
    error.textContent = ''

    const accessKey = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '').trim()
    if (!accessKey) {
      error.textContent = 'Brak klucza Web3Forms. Utwórz plik .env z VITE_WEB3FORMS_ACCESS_KEY.'
      error.hidden = false
      return
    }

    const formData = new FormData(form)
    const payload = {
      access_key: accessKey,
      subject: 'Wiadomość z formularza strony Beskid Rott Stars',
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    }

    submitButton.disabled = true
    submitButton.textContent = 'Wysyłanie...'
    form.setAttribute('aria-busy', 'true')

    try {
      const response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const json = await response.json()
      if (!response.ok || json.success === false) {
        error.textContent = json.message || 'Nie udało się wysłać wiadomości. Spróbuj ponownie później.'
        error.hidden = false
        return
      }
      status.textContent = 'Dziękujemy - wiadomość została wysłana.'
      status.hidden = false
      form.reset()
    } catch {
      error.textContent = 'Błąd sieci. Sprawdź połączenie i spróbuj ponownie.'
      error.hidden = false
    } finally {
      submitButton.disabled = false
      submitButton.textContent = 'Wyślij'
      form.setAttribute('aria-busy', 'false')
    }
  })
}

function setCurrentYear() {
  const year = document.getElementById('year')
  if (year) {
    year.textContent = String(new Date().getFullYear())
  }
}

setupMobileMenu()
setupCarousels()
setupContactForm()
setCurrentYear()
