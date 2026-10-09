import './index.css'
import './App.css'
import EmblaCarousel from 'embla-carousel'

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

let photoLightboxEls

function ensurePhotoLightbox() {
  if (photoLightboxEls) return photoLightboxEls

  const dialog = document.createElement('dialog')
  dialog.className = 'photo-lightbox'
  dialog.setAttribute('aria-label', 'Powiększone zdjęcie')
  dialog.innerHTML = `
    <div class="photo-lightbox-layout">
      <div class="photo-lightbox-panel">
        <button type="button" class="photo-lightbox-close" aria-label="Zamknij">&times;</button>
        <img class="photo-lightbox-img" alt="" width="1280" height="800" decoding="async" />
      </div>
    </div>
  `
  document.body.appendChild(dialog)

  const layout = dialog.querySelector('.photo-lightbox-layout')
  const panel = dialog.querySelector('.photo-lightbox-panel')
  const closeBtn = dialog.querySelector('.photo-lightbox-close')
  const img = dialog.querySelector('.photo-lightbox-img')

  layout.addEventListener('click', () => dialog.close())
  panel.addEventListener('click', (event) => event.stopPropagation())
  closeBtn.addEventListener('click', () => dialog.close())

  photoLightboxEls = { dialog, img, closeBtn }
  return photoLightboxEls
}

function openPhotoLightbox(src, alt) {
  const { dialog, img, closeBtn } = ensurePhotoLightbox()
  img.src = src
  img.alt = alt
  dialog.showModal()
  closeBtn.focus()
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
                <button
                  type="button"
                  class="dog-carousel-expand"
                  data-slide-index="${i}"
                  aria-label="Powiększ zdjęcie: ${label}, ${i + 1} z ${validUrls.length}"
                >
                  <img
                    src="${url}"
                    alt=""
                    width="640"
                    height="400"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                </button>
              </div>
            `,
          )
          .join('')}
      </div>
    `

    const slideCount = validUrls.length
    viewport.querySelectorAll('.dog-carousel-expand').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slideImg = btn.querySelector('img')
        if (!slideImg) return
        const i = Number(btn.getAttribute('data-slide-index'))
        const altText = Number.isFinite(i)
          ? `${label} - zdjęcie ${i + 1} z ${slideCount}`
          : label
        openPhotoLightbox(slideImg.src, altText)
      })
    })

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

function setCurrentYear() {
  const year = document.getElementById('year')
  if (year) {
    year.textContent = String(new Date().getFullYear())
  }
}

setupMobileMenu()
setupCarousels()
setCurrentYear()
