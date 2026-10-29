/* ==========================================================================
   ACORDEÓN — preguntas frecuentes
   Se abre una pregunta por vez: al abrir otra, se cierra la anterior.
   Si el acordeón está dentro de un elemento con [data-acordeon-alto], le
   pasa el alto que ocupa con todas las preguntas cerradas
   (--acordeon-alto-cerrado), para que ese bloque no cambie de tamaño.
   Se aplica a todos los elementos con el atributo [data-acordeon].
   ========================================================================== */

(function () {
  document.querySelectorAll('[data-acordeon]').forEach(acordeon => {
    const items = [...acordeon.querySelectorAll('.acordeon__item')];
    const contenedor = acordeon.closest('[data-acordeon-alto]');

    function alternar(elegido) {
      const abrir = !elegido.classList.contains('is-abierto');
      items.forEach(item => {
        const abierto = item === elegido && abrir;
        item.classList.toggle('is-abierto', abierto);
        item.querySelector('.acordeon__pregunta').setAttribute('aria-expanded', String(abierto));
      });
    }

    items.forEach(item => {
      item.querySelector('.acordeon__pregunta').addEventListener('click', () => alternar(item));
    });

    if (!contenedor) return;

    // Alto con todo cerrado: las preguntas más la separación entre ellas
    function medir() {
      const separacion = parseFloat(getComputedStyle(acordeon).rowGap) || 0;
      const alto = items.reduce((total, item) =>
        total + item.querySelector('.acordeon__encabezado').offsetHeight, 0) +
        separacion * (items.length - 1);
      contenedor.style.setProperty('--acordeon-alto-cerrado', `${alto}px`);
    }

    medir();
    window.addEventListener('resize', medir);
    if (document.fonts) document.fonts.ready.then(medir);
  });
})();
