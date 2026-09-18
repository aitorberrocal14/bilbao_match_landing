# Single-file build

`match-bilbao-bizkaia-2026.html` is the whole site — the landing page and a
view per exhibitor — in one file, with the stylesheet, the scripts, the Bariol
fonts, the logos and the brochure covers inlined. Download it and open it: no
server, no folder of assets, works offline.

It is meant for review and handover. The real deployment is the repository
itself, which serves a proper HTML file per exhibitor (better for search
engines and for linking).

**It is generated, so it goes stale.** After changing anything under
`assets/`, rebuild it from the repository root:

```
node tools/build-standalone.js
```

---

# Panel de administración, en un archivo

`panel-match-bilbao-bizkaia.html` es el panel de `admin/` en un solo archivo,
con los cinco archivos de datos y las 62 imágenes que previsualiza incrustados.
Se abre con doble clic desde cualquier sitio: sin servidor, sin carpeta al lado.

Sirve para probar el panel y para preparar cambios. Al publicar descarga los
archivos modificados, que se suben por FTP a `assets/js/data/`.

**Lleva una copia de los datos del día que se generó**, así que publicar desde
un archivo viejo desharía lo que se haya cambiado por otra vía entretanto. El
propio panel lo advierte en su pantalla de publicación. El que siempre ve el
contenido actual es el de `/admin/` en la web.

```
node tools/build-admin-standalone.js
```
