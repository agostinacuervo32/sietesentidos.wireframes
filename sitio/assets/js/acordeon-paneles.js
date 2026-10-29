/* ==========================================================================
   ACORDEÓN DE PANELES — siempre hay un panel abierto
   Al tocar un panel cerrado se contrae el abierto y se despliega el elegido.
   Se aplica a todos los elementos con el atributo [data-acordeon-paneles].
   ========================================================================== */

(function () {
  document.querySelectorAll('[data-acordeon-paneles]').forEach(acordeon => {
    const paneles = [...acordeon.querySelectorAll('.acordeon-paneles__panel')];

    // Cantidad de paneles: el CSS la usa para calcular el ancho del abierto
    acordeon.style.setProperty('--paneles', paneles.length);

    function abrir(elegido) {
      paneles.forEach(panel => {
        const abierto = panel === elegido;
        panel.classList.toggle('is-abierto', abierto);
        panel.querySelector('.acordeon-paneles__boton').setAttribute('aria-expanded', String(abierto));
      });
    }

    paneles.forEach(panel => {
      panel.querySelector('.acordeon-paneles__boton').addEventListener('click', () => {
        if (!panel.classList.contains('is-abierto')) abrir(panel);
      });
    });
  });
})();
