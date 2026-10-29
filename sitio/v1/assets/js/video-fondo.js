/* ==========================================================================
   VIDEO DE FONDO — videos decorativos sin controles ni sonido
   Se reproducen solo mientras están en pantalla y se pausan con
   prefers-reduced-motion. Se aplica a todos los <video> con autoplay.
   Si el video tiene un botón [data-video-pausa] (aria-controls="<id>"),
   la persona puede pausarlo y reanudarlo; lo que elige se respeta al
   volver a entrar en pantalla. Los textos del botón viven en el HTML
   (data-texto-pausar y data-texto-reproducir).
   ========================================================================== */

(function () {
  const videos = document.querySelectorAll('video[autoplay]');
  if (!videos.length) return;

  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');

  videos.forEach(video => {
    video.muted = true;
    video.controls = false;
    video.addEventListener('contextmenu', e => e.preventDefault());
  });

  const reproducir = video => {
    if (movimientoReducido.matches || video.dataset.pausaManual === 'true') return;
    const promesa = video.play();
    if (promesa) promesa.catch(() => {});
  };

  if (movimientoReducido.matches) {
    videos.forEach(video => video.pause());
  }

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver(entradas => {
      entradas.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) reproducir(target);
        else target.pause();
      });
    }, { rootMargin: '100px' });

    videos.forEach(video => observador.observe(video));
  }

  movimientoReducido.addEventListener('change', () => {
    videos.forEach(video => (movimientoReducido.matches ? video.pause() : reproducir(video)));
  });

  /* ---------- Botón de pausa / reproducción ---------- */
  document.querySelectorAll('[data-video-pausa]').forEach(boton => {
    const video = document.getElementById(boton.getAttribute('aria-controls'));
    if (!video) return;

    // El botón muestra lo que va a pasar al tocarlo
    const actualizar = () => {
      const pausado = video.paused;
      boton.classList.toggle('is-pausado', pausado);
      boton.setAttribute('aria-label', pausado ? boton.dataset.textoReproducir : boton.dataset.textoPausar);
    };

    boton.addEventListener('click', () => {
      if (video.paused) {
        // Pedido explícito: se reproduce aunque haya movimiento reducido
        video.dataset.pausaManual = 'false';
        const promesa = video.play();
        if (promesa) promesa.catch(() => {});
      } else {
        video.dataset.pausaManual = 'true';
        video.pause();
      }
    });

    video.addEventListener('play', actualizar);
    video.addEventListener('pause', actualizar);
    actualizar();
  });
})();
