/* ==========================================================================
   NOTICIAS — orden y paginación de las entradas
   Las noticias viven en el HTML (.card-noticia con su <time datetime>).
   Este script solo las ordena según el desplegable y las muestra de a 6
   (de a 3 en móvil, donde van en una sola columna), armando los números
   de la paginación.
   Sin JS se ven todas.
   ========================================================================== */

(function () {
  const POR_PAGINA_ESCRITORIO = 6;   // tablet y escritorio: 2 o 3 columnas
  const POR_PAGINA_MOVIL = 3;        // móvil: 1 columna
  const conVariasColumnas = window.matchMedia('(min-width: 700px)');   // igual que noticias.css
  const porPagina = () => (conVariasColumnas.matches ? POR_PAGINA_ESCRITORIO : POR_PAGINA_MOVIL);

  document.querySelectorAll('[data-noticias]').forEach(seccion => {
    const lista = seccion.querySelector('.noticias__lista');
    const desplegable = seccion.querySelector('.noticias__desplegable');
    const paginacion = seccion.querySelector('.paginacion');
    const numeros = paginacion.querySelector('.paginacion__numeros');
    const anterior = paginacion.querySelector('.paginacion__anterior');
    const siguiente = paginacion.querySelector('.paginacion__siguiente');
    const noticias = [...lista.querySelectorAll('.card-noticia')];
    const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');

    const fecha = noticia => noticia.querySelector('time').getAttribute('datetime');
    let totalPaginas = 1;
    let pagina = 1;

    // 1 … 4 5 6 … 12: siempre la primera, la última y las vecinas de la actual
    function paginasVisibles() {
      if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
      const visibles = new Set([1, totalPaginas, pagina - 1, pagina, pagina + 1]);
      if (pagina <= 3) [2, 3, 4].forEach(n => visibles.add(n));
      if (pagina >= totalPaginas - 2) [totalPaginas - 3, totalPaginas - 2, totalPaginas - 1].forEach(n => visibles.add(n));
      return [...visibles].filter(n => n >= 1 && n <= totalPaginas).sort((a, b) => a - b);
    }

    function dibujarNumeros() {
      numeros.replaceChildren();
      let previa = 0;
      paginasVisibles().forEach(n => {
        if (n - previa > 1) {
          const puntos = document.createElement('li');
          puntos.className = 'paginacion__puntos';
          puntos.setAttribute('aria-hidden', 'true');
          puntos.textContent = '…';
          numeros.append(puntos);
        }
        const item = document.createElement('li');
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'paginacion__numero';
        boton.textContent = n;
        boton.setAttribute('aria-label', `Página ${n}`);
        if (n === pagina) boton.setAttribute('aria-current', 'page');
        boton.addEventListener('click', () => irA(n));
        item.append(boton);
        numeros.append(item);
        previa = n;
      });
    }

    function mostrar() {
      const cantidad = porPagina();
      totalPaginas = Math.ceil(noticias.length / cantidad);
      pagina = Math.min(pagina, totalPaginas);
      paginacion.hidden = totalPaginas < 2;
      const desde = (pagina - 1) * cantidad;
      [...lista.children].forEach((noticia, i) => {
        noticia.hidden = i < desde || i >= desde + cantidad;
      });
      anterior.disabled = pagina === 1;
      siguiente.disabled = pagina === totalPaginas;
      dibujarNumeros();
    }

    function irA(n) {
      pagina = Math.min(Math.max(n, 1), totalPaginas);
      mostrar();
      seccion.scrollIntoView({ behavior: movimientoReducido.matches ? 'auto' : 'smooth', block: 'start' });
    }

    function ordenar() {
      const recientesPrimero = desplegable.value === 'recientes';
      noticias
        .sort((a, b) => (recientesPrimero ? fecha(b).localeCompare(fecha(a)) : fecha(a).localeCompare(fecha(b))))
        .forEach(noticia => lista.append(noticia));
      pagina = 1;
      mostrar();
    }

    anterior.addEventListener('click', () => irA(pagina - 1));
    siguiente.addEventListener('click', () => irA(pagina + 1));
    desplegable.addEventListener('change', ordenar);

    // Al pasar de móvil a tablet (o al revés) se mantiene a la vista la primera noticia de la página
    conVariasColumnas.addEventListener('change', e => {
      const primera = (pagina - 1) * (e.matches ? POR_PAGINA_MOVIL : POR_PAGINA_ESCRITORIO);
      pagina = Math.floor(primera / porPagina()) + 1;
      mostrar();
    });
    ordenar();
  });
})();
