/* ==========================================================================
   FORMULARIO DE POSTULACIÓN (Sumate) — lógica condicional y validación
   - Tipo de postulación (profesional / voluntariado): el CV es obligatorio
     solo para profesionales. Los textos que cambian según el tipo llevan
     data-solo-tipo en el HTML.
   - Área "Otra": muestra el campo para escribir la especialidad.
   - CV: archivo (PDF o Word, hasta 5 MB) o link.
   - Los botones con data-elegir-postulacion dejan elegido el tipo antes
     de bajar al formulario.
   Los textos de error viven en el HTML (data-error-*).
   El envío NO se resuelve acá: si todo está completo, se dispara el evento
   "postulacion:lista" con los datos (FormData), para que lo tome el
   módulo de envío que se defina. PENDIENTE: ese módulo.
   Después se reemplaza el formulario por el agradecimiento, con un botón
   que abre WhatsApp con un mensaje armado con los datos.
   ========================================================================== */

(function () {
  const MINIMO_DIGITOS = 8;   // teléfono con característica
  const PESO_MAXIMO = 5 * 1024 * 1024;
  const EXTENSIONES_CV = /\.(pdf|docx?)$/i;

  document.querySelectorAll('[data-formulario-postulacion]').forEach(formulario => {
    const tipos = [...formulario.querySelectorAll('input[name="tipo"]')];
    const textosPorTipo = [...formulario.querySelectorAll('[data-solo-tipo]')];
    const area = formulario.querySelector('[data-area-select]');
    const areaOtra = formulario.querySelector('[data-area-otra]');
    const areaOtraControl = areaOtra.querySelector('.campo__control');
    const cv = formulario.querySelector('[data-cv]');
    const cvArchivo = cv.querySelector('[data-cv-archivo]');
    const cvLink = cv.querySelector('[data-cv-link]');
    const cvNombre = cv.querySelector('[data-cv-nombre]');
    const cvQuitar = cv.querySelector('[data-cv-quitar]');
    const tarjeta = formulario.parentElement;
    const gracias = tarjeta.querySelector('[data-postulacion-gracias]');
    const whatsapp = gracias && gracias.querySelector('[data-postulacion-whatsapp]');

    const tipoElegido = () => formulario.elements.tipo.value;

    /* ---------- Errores ---------- */
    function mostrarError(campo, texto, controles) {
      const error = campo.querySelector('.campo__error');
      campo.classList.toggle('is-error', Boolean(texto));
      controles.forEach(control => {
        if (texto) control.setAttribute('aria-invalid', 'true');
        else control.removeAttribute('aria-invalid');
      });
      error.querySelector('.campo__error-texto').textContent = texto;
      error.hidden = !texto;
    }

    function validarCampo(control) {
      const valor = control.value.trim();
      if (!valor) return control.dataset.errorVacio;
      if (control.type === 'tel' && valor.replace(/\D/g, '').length < MINIMO_DIGITOS) {
        return control.dataset.errorFormato;
      }
      if (control.type === 'email' && control.validity.typeMismatch) {
        return control.dataset.errorFormato;
      }
      return '';
    }

    function validarCv() {
      const archivo = cvArchivo.files[0];
      const link = cvLink.value.trim();
      if (archivo) {
        if (!EXTENSIONES_CV.test(archivo.name)) return cv.dataset.errorArchivo;
        if (archivo.size > PESO_MAXIMO) return cv.dataset.errorPeso;
      }
      if (link && !/^https?:\/\/\S+\.\S+/i.test(link)) return cv.dataset.errorLink;
      if (!archivo && !link && tipoElegido() === 'profesional') return cv.dataset.errorVacio;
      return '';
    }

    // Campos obligatorios visibles (el de "Otra" solo cuenta si se ve)
    const obligatorios = () =>
      [...formulario.querySelectorAll('[data-error-vacio]:not(fieldset)')].filter(control => !control.disabled);

    function revisarCampo(control) {
      mostrarError(control.closest('.campo'), validarCampo(control), [control]);
    }

    function revisarCv() {
      mostrarError(cv, validarCv(), [cvArchivo, cvLink]);
    }

    /* ---------- Tipo de postulación ---------- */
    function actualizarTipo() {
      const tipo = tipoElegido();
      textosPorTipo.forEach(texto => { texto.hidden = texto.dataset.soloTipo !== tipo; });
      if (cv.classList.contains('is-error')) revisarCv();
    }

    tipos.forEach(opcion => opcion.addEventListener('change', actualizarTipo));

    document.querySelectorAll('[data-elegir-postulacion]').forEach(boton => {
      boton.addEventListener('click', () => {
        const opcion = tipos.find(o => o.value === boton.dataset.elegirPostulacion);
        if (!opcion) return;
        opcion.checked = true;
        actualizarTipo();
      });
    });

    /* ---------- Área "Otra" ---------- */
    function actualizarArea() {
      const esOtra = area.value === 'Otra';
      areaOtra.hidden = !esOtra;
      areaOtraControl.disabled = !esOtra;   // deshabilitado no se valida ni se envía
      if (!esOtra) mostrarError(areaOtra, '', [areaOtraControl]);
    }

    area.addEventListener('change', actualizarArea);

    /* ---------- Archivo del CV ---------- */
    function actualizarArchivo() {
      const archivo = cvArchivo.files[0];
      cvNombre.textContent = archivo ? archivo.name : cvNombre.dataset.textoVacio;
      cvQuitar.hidden = !archivo;
    }

    cvArchivo.addEventListener('change', () => {
      actualizarArchivo();
      revisarCv();   // el formato y el peso se avisan apenas se elige
    });

    cvQuitar.addEventListener('click', () => {
      cvArchivo.value = '';
      actualizarArchivo();
      if (cv.classList.contains('is-error')) revisarCv();
      cvArchivo.focus();
    });

    cvLink.addEventListener('input', () => {
      if (cv.classList.contains('is-error')) revisarCv();
    });

    /* ---------- Con un error a la vista, se vuelve a revisar mientras se corrige ---------- */
    formulario.querySelectorAll('[data-error-vacio]:not(fieldset)').forEach(control => {
      const evento = control.tagName === 'SELECT' ? 'change' : 'input';
      control.addEventListener(evento, () => {
        if (control.closest('.campo').classList.contains('is-error')) revisarCampo(control);
      });
    });

    /* ---------- Envío ---------- */
    formulario.addEventListener('submit', evento => {
      evento.preventDefault();

      let primerError = null;
      obligatorios().forEach(control => {
        revisarCampo(control);
        if (control.getAttribute('aria-invalid') && !primerError) primerError = control;
      });

      revisarCv();
      if (cv.classList.contains('is-error') && !primerError) {
        primerError = cvArchivo.files[0] || !cvLink.value.trim() ? cvArchivo : cvLink;
      }

      if (primerError) {
        primerError.focus();
        return;
      }

      const datos = new FormData(formulario);
      formulario.dispatchEvent(new CustomEvent('postulacion:lista', { detail: { datos } }));
      mostrarGracias(datos);   // PENDIENTE: cuando haya envío real, mostrarlo solo si salió bien
    });

    /* ---------- Agradecimiento con botón de WhatsApp ---------- */
    function mostrarGracias(datos) {
      if (!gracias) return;
      if (whatsapp) {
        const nombre = datos.get('nombre').trim();
        const tipo = datos.get('tipo') === 'profesional' ? 'profesional' : 'voluntario/a';
        const areaElegida = datos.get('area') === 'Otra' ? datos.get('area_otra').trim() : datos.get('area');
        const mensaje = `Hola, soy ${nombre}. Acabo de enviar mi postulación desde la web para sumarme como ${tipo} en ${areaElegida}.`;
        whatsapp.href = `https://wa.me/${whatsapp.dataset.postulacionWhatsapp}?text=${encodeURIComponent(mensaje)}`;
      }
      formulario.hidden = true;
      gracias.hidden = false;
      gracias.focus({ preventScroll: true });
      gracias.scrollIntoView({ block: 'center' });
    }

    // Por si el navegador recordó lo elegido al volver a la página
    actualizarTipo();
    actualizarArea();
    actualizarArchivo();
  });
})();
