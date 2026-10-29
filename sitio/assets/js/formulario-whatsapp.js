/* ==========================================================================
   FORMULARIO → WHATSAPP — validación y envío del formulario de contacto
   Revisa los campos obligatorios (los que tienen data-error-vacio) y, si
   están completos, abre WhatsApp con un mensaje armado con lo que se
   completó. Los textos de error viven en el HTML (data-error-vacio y
   data-error-formato) y se muestran debajo de cada campo.
   El número sale del atributo [data-formulario-whatsapp] del formulario.
   Sin JS, el formulario abre el chat de WhatsApp sin mensaje (action).
   ========================================================================== */

(function () {
  const MINIMO_DIGITOS = 8;   // teléfono con característica

  document.querySelectorAll('[data-formulario-whatsapp]').forEach(formulario => {
    const numero = formulario.dataset.formularioWhatsapp;
    const obligatorios = [...formulario.querySelectorAll('[data-error-vacio]')];

    function validar(control) {
      const valor = control.value.trim();
      if (!valor) return control.dataset.errorVacio;
      if (control.type === 'tel' && valor.replace(/\D/g, '').length < MINIMO_DIGITOS) {
        return control.dataset.errorFormato;
      }
      return '';
    }

    function mostrarError(control, texto) {
      const campo = control.closest('.campo');
      const error = campo.querySelector('.campo__error');
      campo.classList.toggle('is-error', Boolean(texto));
      if (texto) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
      error.querySelector('.campo__error-texto').textContent = texto;
      error.hidden = !texto;
    }

    // Con un error a la vista, se vuelve a revisar mientras se corrige
    obligatorios.forEach(control => {
      const evento = control.tagName === 'SELECT' ? 'change' : 'input';
      control.addEventListener(evento, () => {
        if (control.closest('.campo').classList.contains('is-error')) {
          mostrarError(control, validar(control));
        }
      });
    });

    function armarMensaje(datos) {
      const nombre = datos.get('nombre').trim();
      const servicio = datos.get('servicio');
      const telefono = `${datos.get('prefijo')} ${datos.get('telefono').trim()}`;
      let mensaje = (datos.get('mensaje') || '').trim().replace(/\s+/g, ' ');
      if (mensaje && !/[.!?…]$/.test(mensaje)) mensaje += '.';

      return [
        `Hola, soy ${nombre} y quiero consultar por ${servicio}.`,
        mensaje,
        `(Tel: ${telefono})`
      ].filter(Boolean).join(' ');
    }

    formulario.addEventListener('submit', evento => {
      evento.preventDefault();

      let primerError = null;
      obligatorios.forEach(control => {
        const texto = validar(control);
        mostrarError(control, texto);
        if (texto && !primerError) primerError = control;
      });

      if (primerError) {
        primerError.focus();
        return;
      }

      const url = `https://wa.me/${numero}?text=${encodeURIComponent(armarMensaje(new FormData(formulario)))}`;
      const ventana = window.open(url, '_blank');
      if (ventana) ventana.opener = null;
      else window.location.href = url;   // si el navegador bloquea la pestaña nueva
    });
  });
})();
