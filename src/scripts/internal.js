(() => {
  const closeLightbox = (dialog) => {
    if (dialog && dialog.open) dialog.close();
  };

  const createLightbox = () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'sb-lightbox';
    dialog.setAttribute('aria-label', 'Anteprima immagine');
    dialog.innerHTML = [
      '<button class="sb-lightbox-close" type="button" aria-label="Chiudi anteprima">×</button>',
      '<figure class="sb-lightbox-figure">',
      '<img class="sb-lightbox-image" alt="">',
      '<figcaption class="sb-lightbox-caption"></figcaption>',
      '</figure>',
    ].join('');
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeLightbox(dialog);
    });
    dialog.querySelector('.sb-lightbox-close').addEventListener('click', () => closeLightbox(dialog));
    document.body.appendChild(dialog);
    return dialog;
  };

  const openLightbox = (link) => {
    const dialog = document.querySelector('.sb-lightbox') || createLightbox();
    const image = dialog.querySelector('.sb-lightbox-image');
    const caption = dialog.querySelector('.sb-lightbox-caption');
    const thumbnail = link.querySelector('img');
    const description = link.querySelector('span');
    const text = link.dataset.sbLightboxCaption || (thumbnail && thumbnail.alt) || (description && description.textContent) || '';

    image.src = link.href;
    image.alt = (thumbnail && thumbnail.alt) || text;
    caption.textContent = text;
    caption.hidden = text === '';
    if (!dialog.open) dialog.showModal();
  };

  const initialise = () => {
    document.querySelectorAll('.sb-gallery-swiper').forEach((gallery) => {
      if (typeof Swiper === 'undefined' || gallery.swiper) return;
      new Swiper(gallery, {
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 30,
        pagination: {
          el: gallery.querySelector('.swiper-pagination'),
          clickable: true,
        },
        navigation: {
          nextEl: gallery.querySelector('.swiper-button-next'),
          prevEl: gallery.querySelector('.swiper-button-prev'),
        },
      });
    });

    const hamburger = document.querySelector('#hamburger--icon > a');
    if (hamburger) {
      hamburger.addEventListener('click', (event) => {
        event.preventDefault();
        document.querySelectorAll('.movable').forEach((element) => element.classList.toggle('pushed'));
        hamburger.querySelectorAll('rect').forEach((element) => element.classList.toggle('pushed'));
      });
    }

    const scrollIcon = document.querySelector('.scroll--icon');
    if (scrollIcon) {
      scrollIcon.addEventListener('click', (event) => {
        event.preventDefault();
        const main = document.querySelector('main');
        if (main) main.scrollIntoView({ behavior: 'smooth' });
      });
    }

    document.addEventListener('click', (event) => {
      const lightboxLink = event.target.closest('a[data-sb-lightbox]');
      if (lightboxLink) {
        event.preventDefault();
        openLightbox(lightboxLink);
        return;
      }

      const link = event.target.closest('a[href^="#"]');
      if (!link || link.getAttribute('href') === '#') return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', link.getAttribute('href'));
    });

    const searchTerm = document.querySelector('.search--term');
    const searchForm = document.querySelector('.homilies-search');
    if (searchTerm && searchForm) {
      searchTerm.addEventListener('focus', () => searchForm.classList.add('fixedbox'));
      searchTerm.addEventListener('blur', () => searchForm.classList.remove('fixedbox'));
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
})();
