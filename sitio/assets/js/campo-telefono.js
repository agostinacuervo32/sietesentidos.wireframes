/* ==========================================================================
   CAMPO TELÉFONO — bandera del prefijo de país
   Al elegir otro país en el desplegable, cambia la bandera que se ve.
   Cada opción indica su bandera con data-bandera (código de dos letras):
   se reemplaza solo el nombre del archivo, así no depende de la carpeta.
   Se aplica a todos los desplegables con el atributo [data-campo-prefijo].
   ========================================================================== */

(function () {
  document.querySelectorAll('[data-campo-prefijo]').forEach(select => {
    const bandera = select.closest('.campo__prefijo').querySelector('.campo__bandera');

    function actualizar() {
      const codigo = select.selectedOptions[0].dataset.bandera;
      bandera.setAttribute('src', bandera.getAttribute('src').replace(/[a-z]{2}\.svg$/, `${codigo}.svg`));
    }

    select.addEventListener('change', actualizar);
    actualizar();   // por si el navegador recordó otro país al volver a la página
  });
})();
