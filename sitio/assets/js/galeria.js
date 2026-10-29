/* ==========================================================================
   GALERÍA — abre una foto del mosaico en el visor (<dialog class="galeria-visor">)
   El movimiento del mosaico lo maneja carrusel.js. La foto tocada se busca
   por posición, así funciona igual en las fotos originales y en las copias.
   Si hubo arrastre, el clic no abre nada.
   Con las flechas del visor (o las del teclado) se pasa a la foto anterior o
   siguiente, en el orden de la galería y en loop.
   ========================================================================== */

(function () {
  const visor = document.querySelector('.galeria-visor');
  if (!visor) return;

  const imagen = visor.querySelector('.galeria-visor__imagen');
  const cerrar = visor.querySelector('.galeria-visor__cerrar');
  const anterior = visor.querySelector('.galeria-visor__flecha--anterior');
  const siguiente = visor.querySelector('.galeria-visor__flecha--siguiente');
  const UMBRAL_ARRASTRE = 6;   // px, igual que en carrusel.js

  // Fotos originales, sin las copias del loop (carrusel.js las marca con aria-hidden)
  const fotos = () => [...document.querySelectorAll('.galeria .carrusel__pista > :not([aria-hidden]) .galeria__foto img')];
  let actual = 0;

  const mostrar = indice => {
    const lista = fotos();
    actual = (indice + lista.length) % lista.length;
    const original = lista[actual];
    imagen.src = original.currentSrc || original.src;
    imagen.alt = original.alt;
  };

  // La foto tocada puede ser una copia: se busca la original por su src
  const abrir = foto => {
    const src = foto.querySelector('img').getAttribute('src');
    mostrar(Math.max(0, fotos().findIndex(img => img.getAttribute('src') === src)));
    visor.showModal();
  };

  const contiene = (rect, x, y) =>
    x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

  document.querySelectorAll('.galeria .carrusel').forEach(carrusel => {
    let inicio = null;

    carrusel.addEventListener('pointerdown', e => {
      inicio = { x: e.clientX, y: e.clientY };
    });

    carrusel.addEventListener('click', e => {
      // Teclado (Enter o espacio sobre el botón)
      if (e.detail === 0) {
        const foto = e.target.closest('.galeria__foto');
        if (foto) abrir(foto);
        return;
      }

      if (inicio && Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > UMBRAL_ARRASTRE) return;

      const foto = [...carrusel.querySelectorAll('.galeria__foto')]
        .find(f => contiene(f.getBoundingClientRect(), e.clientX, e.clientY));
      if (foto) abrir(foto);
    });
  });

  cerrar.addEventListener('click', () => visor.close());
  anterior.addEventListener('click', () => mostrar(actual - 1));
  siguiente.addEventListener('click', () => mostrar(actual + 1));

  visor.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') mostrar(actual - 1);
    if (e.key === 'ArrowRight') mostrar(actual + 1);
  });

  // Un clic fuera del recuadro cierra el visor (Escape lo cierra el <dialog>)
  visor.addEventListener('click', e => {
    // Solo cuenta el clic sobre el propio <dialog> (el fondo): los botones de adentro,
    // activados con teclado, llegan sin coordenadas
    if (e.target === visor && !contiene(visor.getBoundingClientRect(), e.clientX, e.clientY)) visor.close();
  });
})();
