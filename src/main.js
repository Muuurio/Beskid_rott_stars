import './index.css'
import './App.css'
import EmblaCarousel from 'embla-carousel'

const WEB3FORMS_URL = 'https://api.web3forms.com/submit'
const photoModules = import.meta.glob('../photos/*.{jpeg,jpg,png,JPEG,JPG,PNG}', {
  eager: true,
  import: 'default',
})

function photo(name) {
  const key = `../photos/${name}`
  return photoModules[key] || ''
}

// niżej dodaje się zdjęcia, wystarczy podać nazwę pliku z folderu photos
const carouselSources = {
  Aston: [
    photo('aston4.jpeg'),
    photo('aston1.jpeg'),
    photo('aston3.jpeg'),
    photo('aston5.jpeg'),
    photo('aston6.jpeg'),
  ],
  Pola: [
    photo('pola4.jpeg'),
    photo('pola2.jpeg'),
    photo('pola1.jpeg'),
    photo('pola6.jpeg'),
    photo('pola3.jpeg'),
    photo('pola5.jpeg'),
    photo('pola7.jpeg'),
    photo('pola8.jpeg'),
  ],
  Connie: [
    photo('connie1.jpeg'),
    photo('connie2.jpeg'),
    photo('connie3.jpeg'),
    photo('connie4.jpeg'),
    photo('connie5.jpeg'),
    photo('connie6.jpeg'),
    photo('connie7.jpeg'),
    photo('connie8.jpeg'),
  ],
  Dixie: [
    photo('dixie1.jpeg'),
    photo('dixie2.jpeg'),
    photo('dixie3.jpeg'),
    photo('dixie4.jpeg'),
    photo('dixie5.jpeg'),
    photo('dixie6.jpeg'),
    photo('dixie7.jpeg'),
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
    const validUrls = urls.filter(Boolean)
    if (validUrls.length === 0) return

    const viewport = carousel.querySelector('.dog-carousel-viewport')
    const dotsContainer = carousel.querySelector('.dog-carousel-dots')
    const prevButton = carousel.querySelector('.dog-carousel-btn-prev')
    const nextButton = carousel.querySelector('.dog-carousel-btn-next')
    if (!viewport || !dotsContainer || !prevButton || !nextButton) return

    viewport.innerHTML = `
      <div class="dog-carousel-container">
        ${validUrls
          .map(
            (url, i) => `
              <div class="dog-carousel-slide">
                <img
                  src="${url}"
                  alt="${label} - zdjęcie ${i + 1} z ${validUrls.length}"
                  width="640"
                  height="400"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
            `,
          )
          .join('')}
      </div>
    `

    dotsContainer.innerHTML = validUrls
      .map((_, i) => `<button type="button" class="dog-carousel-dot${i === 0 ? ' is-active' : ''}" aria-label="Przejdź do zdjęcia ${i + 1}"></button>`)
      .join('')
    const dots = Array.from(dotsContainer.querySelectorAll('.dog-carousel-dot'))

    const embla = EmblaCarousel(viewport, {
      loop: true,
      align: 'start',
    })

    const syncDots = () => {
      const selected = embla.selectedScrollSnap()
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === selected))
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => embla.scrollTo(i))
    })

    prevButton.addEventListener('click', () => embla.scrollPrev())
    nextButton.addEventListener('click', () => embla.scrollNext())
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        embla.scrollPrev()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        embla.scrollNext()
      }
    })

    embla.on('select', syncDots)
    embla.on('reInit', syncDots)
    syncDots()
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
