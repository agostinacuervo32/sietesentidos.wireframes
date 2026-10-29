/* ==========================================================================
   CARD GIRO — cards que se aprietan y se dan vuelta en móvil
   "Ver más" gira la card y muestra el dorso; la X (o Escape) la vuelve.
   En escritorio (desde 1200px) el dorso se ve siempre y no hay giro.
   Se aplica a todos los elementos con la clase .card-beneficio.
   ========================================================================== */

(function () {
  const cards = document.querySelectorAll('.card-beneficio');
  if (!cards.length) return;

  const escritorio = window.matchMedia('(min-width: 1200px)');

  function actualizar(card) {
    const abierta = card.classList.contains('is-girada');
    const frente = card.querySelector('.card-beneficio__frente');
    const dorso = card.querySelector('.card-beneficio__dorso');
    const verMas = card.querySelector('.card-beneficio__ver-mas');

    verMas.setAttribute('aria-expanded', String(abierta));
    // Solo se puede enfocar la cara que está a la vista
    frente.inert = !escritorio.matches && abierta;
    dorso.inert = !escritorio.matches && !abierta;
  }

  function girar(card, abrir) {
    if (card.classList.contains('is-girada') === abrir) return;

    card.classList.remove('is-volviendo');
    card.classList.toggle('is-girada', abrir);
    if (!abrir) card.classList.add('is-volviendo');
    actualizar(card);

    const destino = abrir
      ? card.querySelector('.card-beneficio__cerrar')
      : card.querySelector('.card-beneficio__ver-mas');
    destino.focus({ preventScroll: true });
  }

  cards.forEach(card => {
    card.querySelector('.card-beneficio__ver-mas').addEventListener('click', () => girar(card, true));
    card.querySelector('.card-beneficio__cerrar').addEventListener('click', () => girar(card, false));

    card.addEventListener('keydown', e => {
      if (e.key === 'Escape') girar(card, false);
    });

    card.addEventListener('animationend', e => {
      if (e.animationName === 'beneficio-cerrar') card.classList.remove('is-volviendo');
    });

    actualizar(card);
  });

  // Al pasar a escritorio todas las cards quedan al frente y con su texto visible
  escritorio.addEventListener('change', () => {
    cards.forEach(card => {
      card.classList.remove('is-girada', 'is-volviendo');
      actualizar(card);
    });
  });
})();
