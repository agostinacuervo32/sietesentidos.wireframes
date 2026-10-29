/* ==========================================================================
   GALERÍA — abre una foto del mosaico en el visor (<dialog class="galeria-visor">)
   El movimiento del mosaico lo maneja carrusel.js. La foto tocada se busca
   por posición, así funciona igual en las fotos originales y en las copias.
   Si hubo arrastre, el clic no abre nada.
   ========================================================================== */

(function () {
  const visor = document.querySelector('.galeria-visor');
  if (!visor) return;

  const imagen = visor.querySelector('.galeria-visor__imagen');
  const cerrar = visor.querySelector('.galeria-visor__cerrar');
  const UMBRAL_ARRASTRE = 6;   // px, igual que en carrusel.js

  const abrir = foto => {
    const original = foto.querySelector('img');
    imagen.src = original.currentSrc || original.src;
    imagen.alt = original.alt;
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

  // Un clic fuera del recuadro cierra el visor (Escape lo cierra el <dialog>)
  visor.addEventListener('click', e => {
    if (!contiene(visor.getBoundingClientRect(), e.clientX, e.clientY)) visor.close();
  });
})();
