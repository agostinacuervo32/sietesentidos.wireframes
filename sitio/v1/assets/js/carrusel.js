/* ==========================================================================
   CARRUSEL — loop infinito de elementos (reseñas, columnas de la galería)
   En reposo avanza solo y se puede arrastrar. Al tocar una flecha se frena
   y pasa de a un elemento, dejando cada uno completo a la vista.
   Los elementos pueden tener distinto ancho.
   Las flechas se vinculan con aria-controls="<id de la pista>".
   Se aplica a todos los elementos con la clase .carrusel.
   ========================================================================== */

(function () {
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const VELOCIDAD = 35;        // px por segundo en modo automático
  const DURACION_PASO = 450;   // ms de la animación de cada flecha
  const UMBRAL_ARRASTRE = 6;   // px: por debajo es un toque (deja hacer clic)

  const suavizar = t => 1 - Math.pow(1 - t, 3);

  document.querySelectorAll('.carrusel').forEach(carrusel => {
    const pista = carrusel.querySelector('.carrusel__pista');
    const originales = [...pista.children];
    const total = originales.length;
    if (!pista.id || total < 2) return;

    const anterior = document.querySelector(`.carrusel__flecha--anterior[aria-controls="${pista.id}"]`);
    const siguiente = document.querySelector(`.carrusel__flecha--siguiente[aria-controls="${pista.id}"]`);

    // Copias antes y después del set original para que el loop no tenga cortes.
    // Quedan ocultas para lectores de pantalla y fuera del orden del teclado,
    // pero se pueden tocar (ej. el botón de una card copiada).
    const copiar = elemento => {
      const copia = elemento.cloneNode(true);
      copia.setAttribute('aria-hidden', 'true');
      [copia, ...copia.querySelectorAll('[id]')].forEach(el => el.removeAttribute('id'));
      copia.querySelectorAll('a, button, input, select, textarea, [tabindex]')
        .forEach(el => el.setAttribute('tabindex', '-1'));
      return copia;
    };
    pista.prepend(...originales.map(copiar));
    pista.append(...originales.map(copiar));

    let puntos = [];       // posición de cada elemento dentro de un set
    let anchoSet = 0;      // ancho de todos los elementos originales (con separaciones)
    let offset = 0;
    let modo = movimientoReducido ? 'manual' : 'auto';
    let animacion = null;  // { desde, hasta, indice, inicio }
    let presion = null;    // { x, offset, id } desde que se apoya el dedo o el mouse
    let arrastre = false;
    let enPantalla = true, conCursor = false, conFoco = false;
    let ultimo = performance.now();

    function medir() {
      const elementos = pista.children;
      const anchoAnterior = anchoSet;
      const origen = elementos[0].offsetLeft;
      puntos = originales.map((_, i) => elementos[i].offsetLeft - origen);
      anchoSet = elementos[total].offsetLeft - origen;
      offset = anchoAnterior ? (offset / anchoAnterior) * anchoSet : -anchoSet;
      normalizar();
      aplicar();
    }

    // Posición del elemento número k (puede caer en cualquier set)
    function puntoDe(k) {
      return Math.floor(k / total) * anchoSet + puntos[((k % total) + total) % total];
    }

    // Elemento que queda más cerca del borde izquierdo
    function masCercano(valor) {
      const x = -valor;
      const set = Math.floor(x / anchoSet);
      let mejor = set * total;
      for (let k = (set - 1) * total; k < (set + 2) * total; k++) {
        if (Math.abs(puntoDe(k) - x) < Math.abs(puntoDe(mejor) - x)) mejor = k;
      }
      return mejor;
    }

    // Mantiene el offset dentro del set del medio (los saltos son invisibles)
    function normalizar() {
      if (!anchoSet) return 0;
      let corrimiento = 0;
      while (offset > -anchoSet * 0.5) { offset -= anchoSet; corrimiento -= anchoSet; }
      while (offset < -anchoSet * 1.5) { offset += anchoSet; corrimiento += anchoSet; }
      return corrimiento;
    }

    function aplicar() {
      pista.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    function animarHasta(indice) {
      animacion = { desde: offset, hasta: -puntoDe(indice), indice, inicio: performance.now() };
    }

    function irA(direccion) {
      modo = 'manual';
      const base = animacion ? animacion.indice : masCercano(offset);
      animarHasta(base + direccion);
    }

    function cuadro(ahora) {
      const dt = Math.min((ahora - ultimo) / 1000, 0.1);
      ultimo = ahora;

      if (animacion) {
        // El tiempo del cuadro puede ser apenas anterior al clic: se acota a 0–1
        const t = Math.min(Math.max((ahora - animacion.inicio) / DURACION_PASO, 0), 1);
        offset = animacion.desde + (animacion.hasta - animacion.desde) * suavizar(t);
        if (t === 1) {
          animacion = null;
          normalizar();
        }
        aplicar();
      } else if (modo === 'auto' && !presion && enPantalla && !conCursor && !conFoco) {
        offset -= VELOCIDAD * dt;
        normalizar();
        aplicar();
      }

      requestAnimationFrame(cuadro);
    }

    /* ---------- Flechas: frenan el modo automático ---------- */
    if (anterior) anterior.addEventListener('click', () => irA(-1));
    if (siguiente) siguiente.addEventListener('click', () => irA(1));

    /* ---------- Arrastre (mouse y táctil) ----------
       Recién se toma el puntero cuando se mueve más que el umbral: así un
       toque sin arrastre sigue siendo un clic (ej. abrir una foto). */
    carrusel.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      presion = { x: e.clientX, offset, id: e.pointerId };
    });

    carrusel.addEventListener('pointermove', e => {
      if (!presion) return;
      if (!arrastre) {
        if (Math.abs(e.clientX - presion.x) < UMBRAL_ARRASTRE) return;
        arrastre = true;
        animacion = null;
        presion.offset = offset;
        presion.x = e.clientX;
        carrusel.setPointerCapture(presion.id);
      }
      offset = presion.offset + (e.clientX - presion.x);
      presion.offset += normalizar();
      aplicar();
    });

    const soltar = () => {
      if (!presion) return;
      const huboArrastre = arrastre;
      presion = null;
      arrastre = false;
      // En modo manual se acomoda para dejar un elemento completo a la vista
      if (huboArrastre && modo === 'manual') animarHasta(masCercano(offset));
    };
    carrusel.addEventListener('pointerup', soltar);
    carrusel.addEventListener('pointercancel', soltar);
    // Si el puntero sale sin haber arrastrado, no queda una presión colgada
    carrusel.addEventListener('pointerleave', () => { if (!arrastre) soltar(); });

    /* ---------- Pausas: cursor encima, foco por teclado o fuera de pantalla ---------- */
    carrusel.addEventListener('mouseenter', () => { conCursor = true; });
    carrusel.addEventListener('mouseleave', () => { conCursor = false; });
    carrusel.addEventListener('focusin', () => { conFoco = true; });
    carrusel.addEventListener('focusout', () => { conFoco = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entrada]) => { enPantalla = entrada.isIntersecting; })
        .observe(carrusel);
    }

    window.addEventListener('resize', medir);
    medir();
    requestAnimationFrame(cuadro);
  });
})();
