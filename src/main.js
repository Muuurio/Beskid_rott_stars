import './index.css'
import './App.css'

const WEB3FORMS_URL = 'https://api.web3forms.com/submit'
// niżej dodaje się zdjęcia, wystarczy podać ścieżkę do zdjęcia w folderze photos
const carouselSources = {
  Aston: [
    '/photos/aston4.jpeg',
    '/photos/aston1.jpeg',
    '/photos/aston3.jpeg',
    '/photos/aston5.jpeg',
    '/photos/aston6.jpeg',


  ],
  Pola: [
    '/photos/pola4.jpeg',
    '/photos/pola2.jpeg',
    '/photos/pola1.jpeg',
    '/photos/pola6.jpeg',
    '/photos/pola3.jpeg',
    '/photos/pola5.jpeg',
    '/photos/pola7.jpeg',
    '/photos/pola8.jpeg',
  ],
  Connie: [
    '/photos/connie1.jpeg',
    '/photos/connie2.jpeg',
    '/photos/connie3.jpeg',
    '/photos/connie4.jpeg',
    '/photos/connie5.jpeg',
    '/photos/connie6.jpeg',
    '/photos/connie7.jpeg',
    '/photos/connie8.jpeg',
  ],
  Dixie: [
    '/photos/dixie1.jpeg',
    '/photos/pola2.jpeg',
    '/photos/dixie3.jpeg',
    '/photos/dixie4.jpeg',
    '/photos/dixie5.jpeg',
    '/photos/dixie6.jpeg',
    '/photos/dixie7.jpeg',
    '/photos/dixie8.jpeg',
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
    if (urls.length === 0) return

    const image = carousel.querySelector('img')
    const dotsContainer = carousel.querySelector('.dog-carousel-dots')
    const prevButton = carousel.querySelector('.dog-carousel-btn-prev')
    const nextButton = carousel.querySelector('.dog-carousel-btn-next')
    if (!image || !dotsContainer || !prevButton || !nextButton) return

    dotsContainer.innerHTML = urls
      .map((_, i) => `<span class="dog-carousel-dot${i === 0 ? ' is-active' : ''}"></span>`)
      .join('')
    const dots = dotsContainer.querySelectorAll('.dog-carousel-dot')

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

    // Ensure first slide is synced on initial page load.
    render()
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
