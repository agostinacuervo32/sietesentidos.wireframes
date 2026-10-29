/* ==========================================================================
   MENÚ — apertura del panel móvil y relleno según la sección de abajo
   ========================================================================== */

(function () {
  const header = document.querySelector('.header');
  if (!header) return;

  const menu = header.querySelector('.menu');
  const boton = header.querySelector('.menu__hamburguesa');
  const panel = header.querySelector('.menu__navegacion');

  /* ---------- Panel móvil ---------- */
  function abrir(estado) {
    menu.classList.toggle('is-abierto', estado);
    boton.setAttribute('aria-expanded', String(estado));
    boton.setAttribute('aria-label', estado ? 'Cerrar menú' : 'Abrir menú');
  }

  if (boton && panel) {
    boton.addEventListener('click', () => {
      abrir(!menu.classList.contains('is-abierto'));
    });

    // Cerrar al elegir un link, con Escape o al tocar fuera del menú
    panel.addEventListener('click', e => {
      if (e.target.closest('a')) abrir(false);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('is-abierto')) {
        abrir(false);
        boton.focus();
      }
    });

    document.addEventListener('click', e => {
      if (!header.contains(e.target)) abrir(false);
    });

    window.matchMedia('(min-width: 1200px)').addEventListener('change', e => {
      if (e.matches) abrir(false);
    });
  }

  /* ---------- Relleno según la sección que pasa por debajo ----------
     Cada sección declara su fondo con data-fondo="claro | color | oscuro". */
  const secciones = document.querySelectorAll('[data-fondo]');
  let pendiente = false;

  function actualizarFondo() {
    pendiente = false;
    const r = header.getBoundingClientRect();
    const medio = r.top + r.height / 2;
    let fondo = 'claro';

    secciones.forEach(s => {
      const b = s.getBoundingClientRect();
      if (b.top <= medio && b.bottom > medio) fondo = s.dataset.fondo;
    });

    header.dataset.sobre = fondo;
  }

  addEventListener('scroll', () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizarFondo);
    }
  }, { passive: true });

  addEventListener('resize', actualizarFondo);
  actualizarFondo();
})();
