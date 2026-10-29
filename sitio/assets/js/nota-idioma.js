/* ==========================================================================
   NOTA — IDIOMA: pasa la nota de español a inglés y vuelve
   Cada texto con data-traducir="clave" tiene su versión en inglés en el
   <template class="nota__traduccion"> con la misma clave; los alt de las
   fotos usan data-traducir-alt. No se traducen la banda ni las migas de
   Inicio y Novedades; la miga final (la volanta de la nota) sí.
   Efecto: con GSAP SplitText, las palabras suben y salen línea por línea y
   entran las del otro idioma. Sin GSAP o con prefers-reduced-motion, el
   cambio es directo. Sin JS el botón no se muestra.
   ========================================================================== */

(function () {
  const nota = document.querySelector('[data-nota]');
  if (!nota) return;

  const boton = nota.querySelector('[data-idioma-boton]');
  const plantilla = nota.querySelector('.nota__traduccion');
  if (!boton || !plantilla) return;

  const etiquetaBoton = boton.querySelector('[data-idioma-texto]');
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');

  // El contenido del <template> no forma parte de la página: estos son solo los textos visibles
  const textos = [...nota.querySelectorAll('[data-traducir]')];
  const alts = [...nota.querySelectorAll('[data-traducir-alt]')];
  const claves = [...nota.querySelectorAll('[data-claves]')];

  // Sin animación: los botones .btn (la copia del blob repite su texto)
  const animables = textos.filter(el => !el.closest('.btn'));

  const versiones = { es: {}, en: {} };
  textos.forEach(el => { versiones.es[el.dataset.traducir] = el.innerHTML.trim(); });
  alts.forEach(img => { versiones.es[img.dataset.traducirAlt] = img.alt; });
  plantilla.content.querySelectorAll('[data-traducir]').forEach(el => {
    versiones.en[el.dataset.traducir] = el.innerHTML.trim();
  });

  // El botón ofrece el otro idioma
  const etiquetas = {
    es: { texto: 'Leer en inglés', lang: 'es' },
    en: { texto: 'Read in Spanish', lang: 'en' }
  };

  let actual = 'es';
  let animando = false;

  function aplicar(idioma) {
    const version = versiones[idioma];
    textos.forEach(el => {
      const valor = version[el.dataset.traducir];
      if (valor !== undefined) el.innerHTML = valor;
    });
    alts.forEach(img => {
      const valor = version[img.dataset.traducirAlt];
      if (valor !== undefined) img.alt = valor;
    });
    // Palabras clave: solo la lista del idioma actual
    claves.forEach(lista => { lista.hidden = lista.dataset.claves !== idioma; });
    if (idioma === 'es') nota.removeAttribute('lang');
    else nota.lang = idioma;
  }

  function actualizarBoton(idioma) {
    const { texto, lang } = etiquetas[idioma];
    // También la copia del botón dentro del blob (boton-blob.js), si está visible
    [etiquetaBoton, ...document.querySelectorAll('.blob-fantasma [data-idioma-texto]')].forEach(span => {
      span.textContent = texto;
      span.lang = lang;
    });
  }

  function dividir() {
    // La miga final va en una sola línea (cortada con "…"): se divide y enmascara por palabras
    return animables.map(el => el.closest('.migas')
      ? SplitText.create(el, { type: 'words', mask: 'words' })
      : SplitText.create(el, { type: 'lines,words', mask: 'lines' }));
  }

  const palabras = partes => partes.flatMap(p => p.words);
  const revertir = partes => partes.forEach(p => p.revert());

  function cambiar(destino) {
    const conEfecto = window.gsap && window.SplitText && !reducido.matches;

    if (!conEfecto) {
      aplicar(destino);
      actualizarBoton(destino);
      return;
    }

    animando = true;
    boton.setAttribute('aria-busy', 'true');
    const salida = dividir();

    gsap.to(palabras(salida), {
      yPercent: -110,
      duration: 0.35,
      ease: 'power2.in',
      stagger: { amount: 0.35 },
      onComplete() {
        revertir(salida);
        aplicar(destino);
        actualizarBoton(destino);

        const entrada = dividir();
        gsap.from(palabras(entrada), {
          yPercent: 110,
          duration: 0.5,
          ease: 'power3.out',
          stagger: { amount: 0.4 },
          onComplete() {
            revertir(entrada);
            animando = false;
            boton.removeAttribute('aria-busy');
          }
        });
      }
    });
  }

  if (window.gsap && window.SplitText) gsap.registerPlugin(SplitText);

  boton.hidden = false;
  boton.addEventListener('click', () => {
    if (animando) return;
    actual = actual === 'es' ? 'en' : 'es';
    cambiar(actual);
  });
})();
