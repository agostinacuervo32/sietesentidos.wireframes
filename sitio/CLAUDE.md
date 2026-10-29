# CLAUDE.md — Sitio Siete Sentidos en modo WIREFRAME

Este proyecto **no es el sitio real**: es la versión wireframe (boceto en grises) del sitio de la Fundación Siete Sentidos, hecha para el TFG de Agos (Diseño Gráfico, UES21). Representa la **etapa de boceto**, previa al diseño final.

**Regla de oro:** toda corrección o página nueva tiene que seguir viéndose como wireframe. Nada de colores, fotos, ilustraciones, videos ni animaciones del sitio final.

Idioma: respondé en español rioplatense informal. Si una corrección es ambigua, preguntá antes de cambiar.

---

## 1. Cómo está armado

```
sitio-wireframe/
├── index.html, apoyo-escolar/, especialidades/, nosotros/, novedades/, dona/, sumate/
├── novedades/<nota>/index.html     → notas individuales
├── assets/                         → CSS y JS del sitio nuevo (no tocar salvo necesidad)
├── v1/assets/                      → CSS y JS de la PRIMERA versión del sitio
├── wf/                             → CAPA WIREFRAME (acá van casi todas las correcciones)
│   ├── wireframe.css               → grises, placeholders, overrides por componente
│   ├── wireframe.js                → cambia fotos/videos/agenda/mapa por placeholders y pone el logo
│   ├── logo.png                    → logo original de Agos (negro + blob gris)
│   └── fonts/                      → tipografías locales
└── LEEME.txt
```

- **Especialidades** y **Novedades** (`/especialidades/` y `/novedades/`) vienen de la primera versión del sitio (repo `agostinacuervo32/sietesentidos`) y cargan sus estilos desde `/v1/assets/`. El resto de las páginas viene del sitio nuevo (repo `agostinacuervo32/prototipo-siete-sentidos-2`) y usa `/assets/`. **No mezclar:** si editás estilos de esas dos páginas, tocá `/v1/assets/`.
- **Nunca modificar los repos originales.** Este proyecto es una copia aparte.
- Cada `index.html` carga al final `<link rel="stylesheet" href="/wf/wireframe.css">` (antes de `</head>`) y `<script src="/wf/wireframe.js"></script>` (antes de `</body>`). **Toda página nueva tiene que tener esas dos líneas.**
- Las rutas son absolutas (`/assets/...`): se abre con **Live Server** con esta carpeta como raíz. Con doble clic no cargan los estilos.

**Dónde corregir:**
1. Algo visual que aplica a un tipo de componente (colores, fondos, bordes) → `wf/wireframe.css`, al final, con un comentario que diga qué corrige.
2. Textos puntuales → directo en el `index.html` de esa página.
3. Layout o estructura → en el HTML o en el CSS del componente (`assets/css/` o `v1/assets/css/`), cuidando de no romper otras páginas que usen el mismo archivo.

---

## 2. Paleta (solo estos valores)

| Uso | Color |
|---|---|
| Fondo de página | `#d9d9d9` (`--wf-fondo`) |
| Placeholder de imagen / cards / acordeones | `#b3b3b3` (`--wf-ph`) |
| Gris medio (tarjeta de contacto, cards de talleres, Visión) | `#9b9b9b` (`--wf-2`) |
| Gris oscuro (Misión) | `#878787` (`--wf-3`) |
| Muy oscuro (blob del logo, franja de derechos, tags inclinados) | `#707070` (`--wf-4`) |
| Cards de "Por qué elegir" | `#c6c6c6` |
| Franja clara "Nuevo" | `#ececec` |
| Cruz de los placeholders | `#ececec` |
| Texto, títulos, botones rellenos, bordes | `#000` |
| Texto sobre fondo oscuro | `#fff` (o `#c4c4c4` en la franja de derechos) |

En `wireframe.css` todas las variables de color del sitio (`--verde`, `--rosa`, `--naranja`, `--amarillo`, sus `-oscuro` y `-pastel`, `--blanco`, `--negro`, degradados) ya están pisadas con estos grises. **No agregues colores nuevos** ni uses los hex de marca (`#355241`, `#955450`, `#F2BFBA`, etc.).

**Contraste:** fondo oscuro → letra clara; fondo claro → letra negra. Siempre verificá que el texto se lea, sobre todo en etiquetas inclinadas y franjas.

---

## 3. Reglas del modo wireframe

**Imágenes**
- Toda foto, ilustración, video, mapa o imagen faltante = **recuadro gris `#b3b3b3` con una cruz blanca de líneas rectas y continuas** (de esquina a esquina, nunca punteadas), con el mismo border-radius del elemento.
- Se hace con la clase `wf-ph` (en `<img>`) o `wf-ph-bg` (en contenedores). `wireframe.js` las aplica solo; si aparece un caso nuevo que no se convierte, agregalo en `wireframe.js` o en el CSS, no lo dejes con foto.
- Íconos (Phosphor), banderas y el logo **no** se convierten.

**Logo**
- Siempre el original de Agos: `wf/logo.png`. **Nunca recrearlo** con tipografías ni dibujarlo.

**Tipografías** (las del sitio, cargadas localmente desde `wf/fonts/`)
- Títulos: Bricolage Grotesque
- Subtítulos, menú, botones: Lexend
- Texto: Atkinson Hyperlegible Next

**Agenda**
- Nunca se muestra la grilla de horarios. Va como placeholder de imagen.
- En mobile, el recuadro de la agenda es más bajo (240 px).

**Menú**
- Links: Apoyo escolar, Especialidades, Nosotros, Novedades, Sumate. **Sin "Doná"** (la página existe, pero no va en el menú).
- Sin efecto de trazo, sin link activo resaltado, sin animación blob en los botones (eso no existía en etapa de boceto).

**Sin efectos de diseño final**
- Sin animaciones ni transiciones, sin degradés, sin overlays oscuros sobre fotos, sin emojis de color.

---

## 4. Contenido de boceto (ya aplicado, mantenerlo así)

- **Bajadas del hero** de cada página: lorem ipsum con unas palabras más o menos que el texto real, para que se vea natural. Si se agrega una página nueva, hacer lo mismo.
- **Se mantienen con el texto real:** las descripciones de los servicios y el agradecimiento de Nosotros.
- **Noticias (cards):** título "Titulo de la nota" (así, sin tilde), texto "Acompañamos el aprendizaje de niños y estudiantes, desde nivel inicial hasta secundario." y botón negro "Consultar".
- **Equipo (Nosotros):** todas las cards dicen "Ana Rinaldi". La primera lleva el cargo "Fundadora y maestra de apoyo escolar nivel primario" y el resto "Apoyo escolar". Solo foto (placeholder) y texto negro, **sin recuadro de color detrás del nombre**.
- **Talleres:** todas las cards del mismo gris; la etiqueta inclinada (ej. "Octubre rosa") en `#707070` con letra blanca; la franja "Nuevo" en `#ececec` con letra negra.

---

## 5. Exportar las capturas

Las capturas de página completa se sacan en **JPG de alta**:
- Desktop: viewport de 1440 px de ancho, a 2x (sale de 2880 px).
- Mobile: viewport de 393 px de ancho, a 3x (sale de 1179 px).
- Antes de capturar, recorrer la página entera para que carguen las imágenes lazy.
- Nombres: `<página>-desktop.jpg` y `<página>-mobile.jpg` (las notas: `novedades_<slug>-desktop.jpg`).

Con Playwright, por ejemplo:
```python
page = browser.new_page(viewport={'width':1440,'height':900}, device_scale_factor=2)
page.goto('http://localhost:5500/sumate/', wait_until='networkidle')
page.screenshot(path='sumate-desktop.png', full_page=True)   # después convertir a JPG
```

---

## 6. Checklist antes de entregar una corrección

- [ ] ¿Quedó algún color que no esté en la paleta?
- [ ] ¿Alguna foto, ilustración o video sin convertir en placeholder?
- [ ] ¿Las cruces de los placeholders son líneas rectas y continuas?
- [ ] ¿El logo es `wf/logo.png`?
- [ ] ¿Todo el texto se lee (contraste)?
- [ ] ¿El menú sigue sin "Doná" y sin efectos?
- [ ] ¿Lo revisaste en desktop **y** en mobile?
- [ ] ¿Las páginas que no tocaste siguen igual?
