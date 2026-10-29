/* ==========================================================================
   AGENDA — desplegable de especialidad y ubicación de los turnos en la grilla
   Los horarios se escriben en el HTML (ej. "9:00 – 11:00"); este archivo los
   lee y calcula su fila, su columna y, si dos turnos se superponen en el
   mismo día, en qué carril va cada uno. Los días con carriles se ensanchan
   para que los nombres se lean completos.
   Se aplica a todos los elementos con el atributo [data-agenda].
   ========================================================================== */

(function () {
  const HORA_INICIO = 9 * 60;   // la grilla empieza a las 9:00
  const MINUTOS_FILA = 30;      // cada fila es media hora
  const PRIMERA_FILA = 3;       // fila 1: leyenda y desplegable · fila 2: días
  const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

  const aMinutos = texto => {
    const [h, m] = texto.trim().split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const aFila = minutos => PRIMERA_FILA + (minutos - HORA_INICIO) / MINUTOS_FILA;

  // Ubica los turnos de un día y devuelve cuántos carriles necesita
  function ubicarTurnos(dia) {
    const columna = DIAS.indexOf(dia.dataset.dia) + 2;
    const turnos = [...dia.querySelectorAll('.agenda__turno')].map(el => {
      const [desde, hasta] = [...el.querySelectorAll('.agenda__hora')].map(h => aMinutos(h.textContent));
      return { el, desde, hasta };
    }).sort((a, b) => a.desde - b.desde || a.hasta - b.hasta);

    // Agrupa los turnos que se superponen y les asigna un carril a cada uno
    let grupo = [];
    let finGrupo = -1;
    let maxCarriles = 1;
    const cerrarGrupo = () => {
      const carriles = Math.max(0, ...grupo.map(t => t.carril)) + 1;
      grupo.forEach(t => t.el.style.setProperty('--carriles', carriles));
      maxCarriles = Math.max(maxCarriles, carriles);
      grupo = [];
    };

    turnos.forEach(turno => {
      if (turno.desde >= finGrupo && grupo.length) cerrarGrupo();
      const ocupados = grupo.filter(t => t.hasta > turno.desde).map(t => t.carril);
      let carril = 0;
      while (ocupados.includes(carril)) carril++;
      turno.carril = carril;
      grupo.push(turno);
      finGrupo = Math.max(finGrupo, turno.hasta);

      const estilo = turno.el.style;
      estilo.setProperty('--columna', columna);
      estilo.setProperty('--fila-inicio', aFila(turno.desde));
      estilo.setProperty('--fila-fin', aFila(turno.hasta));
      estilo.setProperty('--carril', carril);
    });
    if (grupo.length) cerrarGrupo();
    return maxCarriles;
  }

  document.querySelectorAll('[data-agenda]').forEach(agenda => {
    const calendario = agenda.querySelector('.agenda__calendario');
    const control = agenda.querySelector('.agenda__control');
    const desplegable = agenda.querySelector('[data-agenda-desplegable]');
    const opciones = [...desplegable.options];
    const paneles = opciones.map(opcion => document.getElementById(opcion.value));

    // Cada hora de la columna de la izquierda arranca en su fila
    agenda.querySelectorAll('.agenda__horas span').forEach(hora => {
      hora.style.setProperty('--fila', aFila(aMinutos(hora.textContent)));
    });

    // Ancho de cada día por panel: 1fr por carril
    const columnas = paneles.map(panel => {
      const carriles = DIAS.map(() => 1);
      panel.querySelectorAll('.agenda__dia').forEach(dia => {
        carriles[DIAS.indexOf(dia.dataset.dia)] = ubicarTurnos(dia);
      });
      return carriles.map(c => `minmax(0, ${c}fr)`).join(' ');
    });

    function mostrar() {
      const i = desplegable.selectedIndex;
      paneles.forEach((panel, j) => panel.hidden = j !== i);
      calendario.style.setProperty('--columnas', columnas[i]);
      control.className = `agenda__control agenda__control--${opciones[i].dataset.familia}`;
    }

    desplegable.addEventListener('change', mostrar);
    mostrar();
    agenda.classList.add('agenda--js');
  });
})();
