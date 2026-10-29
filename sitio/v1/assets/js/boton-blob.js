/* ==========================================================================
   BOTÓN BLOB — animación tomada de boton-blob-triangulo.html
   Hover: el cursor se convierte en un blob con resorte; dentro del blob se ve
   una copia del botón en el color inverso. Efecto magnético y texto +3pt.
   Presionado: el botón se rellena con el color del blob y el blob se va.
   Se aplica a todos los elementos con la clase .btn, también a los que se
   crean después de cargar la página (ej. las copias del loop de carrusel.js):
   los eventos se escuchan desde el documento.
   ========================================================================== */

(function () {
  const puedeAnimar =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!puedeAnimar) return;

  if (!document.querySelector('.btn')) return;

  document.documentElement.classList.add('blob-activo');

  // Capa 1: el blob
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'blob-cursor');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(svgNS, 'path');
  svg.appendChild(path);

  // Capa 2: copia del botón en color inverso, recortada con la forma del blob
  const capa = document.createElement('div');
  capa.className = 'blob-fantasma';
  capa.setAttribute('aria-hidden', 'true');

  document.body.append(svg, capa);

  let mx = innerWidth / 2, my = innerHeight / 2;
  let x = mx, y = my, vx = 0, vy = 0;
  let dx = 0, dy = 0, dvx = 0, dvy = 0;
  let R = 0;
  let activo = null;       // botón con el cursor encima
  let fantasma = null;     // su copia en color inverso
  let visible = false, presionado = false;
  let corriendo = false;   // el loop solo corre con un botón activo o mientras el blob se va
  let ultimoD = null;      // último trazado escrito, para no tocar el DOM si no cambió

  const N = 24;

  // Al arrancar desde reposo, el blob aparece justo debajo del cursor
  function arrancar() {
    if (corriendo) return;
    corriendo = true;
    x = mx; y = my; vx = vy = 0;
    dx = dy = dvx = dvy = 0;
    requestAnimationFrame(tick);
  }

  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; visible = true; });
  document.documentElement.addEventListener('mouseleave', () => { visible = false; });

  const botonDe = objetivo => (objetivo instanceof Element ? objetivo.closest('.btn') : null);

  function entrar(btn) {
    activo = btn;
    btn.classList.add('is-abrazado');
    path.style.fill = getComputedStyle(btn).getPropertyValue('--btn-blob');

    fantasma = btn.cloneNode(true);
    fantasma.removeAttribute('id');
    fantasma.removeAttribute('href');
    fantasma.removeAttribute('style');
    fantasma.classList.remove('is-abrazado', 'is-presionado');
    capa.replaceChildren(fantasma);
  }

  function salir(btn) {
    if (activo === btn) activo = null;
    presionado = false;
    btn.classList.remove('is-abrazado', 'is-presionado');
    btn.style.transform = '';
  }

  // Entrar y salir de un botón (pointerover/out burbujean, a diferencia de enter/leave)
  document.addEventListener('pointerover', e => {
    const btn = botonDe(e.target);
    if (!btn || btn === activo) return;
    mx = e.clientX; my = e.clientY; visible = true;
    if (activo) salir(activo);
    entrar(btn);
    arrancar();
  });

  document.addEventListener('pointerout', e => {
    const btn = botonDe(e.target);
    if (!btn || btn.contains(e.relatedTarget)) return;
    salir(btn);
  });

  // Mientras se mantiene presionado: botón relleno y sin blob
  document.addEventListener('pointerdown', e => {
    const btn = botonDe(e.target);
    if (!btn) return;
    presionado = true;
    btn.classList.add('is-presionado');
    R = 0;                       // el blob se va de golpe
    dx = dy = dvx = dvy = 0;
  });

  // Efecto magnético muy sutil (el protagonista es el blob)
  document.addEventListener('pointermove', e => {
    const btn = botonDe(e.target);
    if (!btn || btn !== activo) return;
    const r = btn.getBoundingClientRect();
    const ox = e.clientX - (r.left + r.width / 2);
    const oy = e.clientY - (r.top + r.height / 2);
    btn.style.transform = `translate(${ox * 0.045}px, ${oy * 0.06}px)`;
  });

  // Al soltar (sobre el botón o fuera de él) vuelve a la normalidad
  const soltar = () => {
    presionado = false;
    document.querySelectorAll('.btn.is-presionado').forEach(b => b.classList.remove('is-presionado'));
  };
  addEventListener('pointerup', soltar);
  addEventListener('pointercancel', soltar);

  function tick() {
    const px = x, py = y;
    const hover = activo !== null;

    // El centro del blob va más lento que el cursor, así el cursor lo "tira".
    // Fuera del botón el blob no se ve, pero sigue al cursor de cerca
    // para que al entrar aparezca justo debajo de la flecha.
    const follow = hover ? 0.045 : 0.35;
    x += (mx - x) * follow;
    y += (my - y) * follow;
    vx = x - px;
    vy = y - py;

    const targetR = visible && hover && !presionado ? 34 : 0;
    R += (targetR - R) * 0.07;

    const pullX = (mx - x) + vx * 4;
    const pullY = (my - y) + vy * 4;

    // Resorte: la deformación persigue el tirón y rebota al soltarse
    const stiffness = 0.09, damping = 0.8;
    dvx = (dvx + (pullX - dx) * stiffness) * damping;
    dvy = (dvy + (pullY - dy) * stiffness) * damping;
    dx += dvx;
    dy += dvy;

    const maxStretch = R * 1.4 + 9;
    const amount = Math.min(Math.hypot(dx, dy), maxStretch);
    const ang = Math.atan2(dy, dx);
    const k = R > 0 ? amount / (R + 5) : 0;

    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const c = Math.cos(a - ang);
      let r = R;
      if (c > 0) r += amount * Math.pow(c, 3);
      else       r -= R * k * 0.15 * c * c;
      r -= R * k * 0.28 * (1 - c * c);
      r = Math.max(r, R * 0.45);
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
    }

    const d = R < 0.3 ? '' : smoothClosed(pts);
    if (d !== ultimoD) {
      path.setAttribute('d', d);
      capa.style.clipPath = d ? `path('${d}')` : 'inset(100%)';
      ultimoD = d;
    }

    // La copia en color inverso sigue exactamente al botón real
    if (activo && fantasma) {
      const rect = activo.getBoundingClientRect();
      fantasma.style.left = rect.left + 'px';
      fantasma.style.top = rect.top + 'px';
      fantasma.style.width = rect.width + 'px';
      fantasma.style.height = rect.height + 'px';
      fantasma.style.fontSize = getComputedStyle(activo).fontSize;
    }

    // Sin botón activo y con el blob ya ido, el loop se frena hasta el próximo botón
    if (!activo && !d) {
      corriendo = false;
      return;
    }
    requestAnimationFrame(tick);
  }

  function smoothClosed(p) {
    const n = p.length;
    const f = v => v.toFixed(2);
    let d = `M${f(p[0][0])},${f(p[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
    }
    return d + 'Z';
  }
})();
