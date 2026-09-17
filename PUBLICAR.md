# Publicar la web desde el panel del hosting

Cómo pasar de un hosting vacío a la web funcionando en
`matchbilbaobizkaia.eus`, usando solo el panel de
`paneles.gestiondecuenta.com`.

Hay **dos formas**, y no se pueden hacer las dos a la vez. Elige una, síguela
entera, y deja la otra como respaldo.

---

## Cuál elegir

|  | **A · WordPress** | **B · Archivos** |
|---|---|---|
| Qué subes tú | **Un archivo** de 2,8 MB | Un ZIP de 3,1 MB, que luego se descomprime |
| Tiempo la primera vez | 1 – 2 horas | 10 minutos |
| Cambiar textos después | Desde `wp-admin` | Desde `/admin/` de la web |
| **Subir fotos nuevas** | Desde el navegador | **Por FTP** |
| Usuarios con su contraseña | Sí, uno por persona | No, una común |
| Mantenimiento | Actualizar y copias | Ninguno |
| Quién sabrá manejarlo dentro de dos años | Mucha gente | Quien lea la documentación |

**Recomendada: la A.** Pesa más el traspaso que la comodidad de hoy. La web va
a quedar en manos de gente que no ha trabajado con esto, y WordPress es lo que
más probabilidades tiene de que alguien sepa continuar. Además sube **un solo
archivo**, que evita el problema de mover 136 de golpe.

**La B es buena si** hay prisa por tener algo publicado, o si WordPress da
guerra. La web es exactamente la misma: lo que cambia es cómo se edita después.

---

## A · WordPress

Resumen. Los pasos completos, con todos los campos y qué hacer si algo falla,
están en **[`wordpress/INSTALACION.md`](wordpress/INSTALACION.md)**.

1. Panel → **aplicaciones autoinstalables** → **WordPress** (el tercero, el que
   dice *"El gestor de blogs con más difusión"* — no los dos de arriba con
   estrella, que son las versiones promocionadas).
2. **Directorio: vacío**, para que se instale en la raíz. La base de datos se
   crea sola; no hay que tocar la sección *Bases de datos*.
3. Correo del administrador: **uno institucional de Bilbao Ekintza**. Usuario:
   cualquier cosa **menos `admin`**.
4. Entrar en `matchbilbaobizkaia.eus/wp-admin` → **Plugins → Añadir nuevo →
   Subir plugin** → `match-bilbao-bizkaia.zip` → instalar y activar.
5. Sale el aviso **"Import the starting content"** → importar. Crea los 39
   expositores, los 16 folletos y los 62 tramos del programa.
6. El resto —tema, ajustes, la página, el menú, las comprobaciones— en la guía.

Y al terminar, panel → **Bases de datos → Programar Backups**.

---

## B · Los archivos, desde el gestor del panel

El paquete es **`dist/web-para-subir.zip`**: 3,1 MB, 136 archivos, y en su raíz
está exactamente lo que tiene que quedar en la carpeta pública.

```
index.html      robots.txt      sitemap.xml
assets/         exhibitors/     admin/
```

### 1 · Guarda lo que haya ahora

Panel → **Administrador de archivos** → entra en la carpeta pública (`www`,
`public_html` o `htdocs`, dentro de `/home/matchbilbaobizkaia`).

Si hay algo, descárgalo antes de tocar nada. Mira sobre todo si existe un
**`.htaccess`** — suele estar oculto, y el gestor tendrá una opción de *mostrar
archivos ocultos*. Si existe, guárdalo y ábrelo: puede llevar redirecciones o
configuración del correo.

### 2 · Sube el ZIP

En esa misma carpeta, **Subir** → `web-para-subir.zip`. Es un archivo de 3,1 MB;
el límite de subida es de 100 MB, así que va sobrado.

### 3 · Descomprímelo **en el servidor**

Selecciona el ZIP ya subido y busca **Extraer** / *Descomprimir* / *Unzip*.

**Este es el paso que lo cambia todo.** Descomprimir en el servidor convierte
una subida de un archivo en 136 archivos ya colocados. Si en vez de eso
descomprimes en tu ordenador y arrastras las carpetas por el gestor web, son
136 transferencias por el navegador y ahí es donde falla.

Comprueba que los archivos han caído **en la carpeta pública directamente** y no
dentro de una subcarpeta. Tiene que quedar `index.html` a la vista, no
`web-para-subir/index.html`. Si ha creado subcarpeta, entra y mueve el contenido
un nivel arriba.

### 4 · Borra el ZIP

Ya no pinta nada ahí, y es 3 MB que cualquiera podría descargarse.

### Si el gestor del panel no sabe descomprimir

Entonces la vía es **FileZilla**, que sube carpetas enteras con todo lo que
llevan dentro y reanuda si la conexión se corta — las dos cosas que el gestor
del navegador no hace.

Los pasos, sin dar nada por sabido, en **[`FILEZILLA.md`](FILEZILLA.md)**:
instalar, guardar la conexión, encontrar `www`, arrastrar y comprobar que ha
subido todo.

### 5 · Cierra el panel de edición

La web incluye su propio editor en `matchbilbaobizkaia.eus/admin/`. Ciérralo:
panel → **Protección de directorios** (o *Directory privacy*) → carpeta `admin`
→ crear usuario y contraseña.

Sin eso, quien encuentre la dirección ve los formularios. No puede escribir nada
—el servidor lo rechaza— pero no tiene por qué verlos.

---

## No hagas las dos a la vez

Si instalas WordPress en la raíz **y** subes los archivos, los dos quieren ser
la portada. En casi todos los servidores `index.html` gana a `index.php`:
verías la web estática y pensarías que WordPress no se ha instalado, cuando está
perfectamente instalado debajo.

Si te pasa: borra `index.html` de la carpeta pública y aparecerá WordPress.

---

## Comprueba que ha salido bien

Abre `matchbilbaobizkaia.eus` en una ventana nueva:

- [ ] Carga la portada con el titular sobre la fotografía
- [ ] El programa muestra **5 días** y las pestañas cambian
- [ ] Salen **39 logotipos** y el filtro por categoría funciona
- [ ] Al pinchar un logotipo se abre su página, **sin error 404**
- [ ] Salen **16 folletos** y uno abre el lector de Issuu
- [ ] El contacto muestra `welcome@matchbilbaobizkaia.eus` y el teléfono
- [ ] En el **móvil** sigue funcionando todo

**Los botones de Login no aparecen todavía, y es correcto.** Están ocultos
mientras no haya dirección de la plataforma, porque un botón que no lleva a
ningún sitio parece una web rota. En cuanto tengas la URL de Meetmaps aparecen
los cuatro.

---

## Mientras la subida sea a mano: qué archivo toca cada cambio

El sitio se edita en GitHub (o en el panel de `/admin/`) y se sube al hosting a
mano. Casi nunca hay que subirlo entero: cada tipo de cambio toca un archivo
concreto.

Para bajarte un archivo de GitHub: entra en él y pulsa **Download raw file**,
el icono de la flecha hacia abajo arriba a la derecha.

| Qué has cambiado | Qué subes |
|---|---|
| Menú, portada, login, contacto, pie | `assets/js/data/site.js` |
| Los textos de las secciones | `assets/js/data/content.js` |
| El programa | `assets/js/data/programme.js` |
| Los folletos | `assets/js/data/discover.js` |
| Los expositores | `assets/js/data/exhibitors.js` |
| Una foto o un logotipo | el archivo, a su carpeta de `assets/img/` |
| Colores, tipografías, maquetación | `assets/css/styles.css` |

Son archivos de entre 5 y 60 KB. Un cambio en el programa entero son 13 KB.

> ⚠️ **Dos excepciones que llevan también las 39 fichas de expositor.**
>
> Las páginas de `exhibitors/` llevan la cabecera y el pie **escritos dentro**,
> no los dibujan al vuelo como la portada. Así que si cambias algo del **menú,
> del botón de Login o del pie**, o si **añades, quitas o editas una empresa**,
> hay que volver a subir la carpeta `exhibitors` entera — una sola operación en
> bloque, 39 archivos.
>
> Si solo cambias el programa, los folletos o los textos de las secciones, no
> hace falta: esas partes solo existen en la portada.

### Esto se puede acabar hoy mismo

La subida a mano no es una condena: es la consecuencia de no haber configurado
todavía tres secretos. **El proxy que bloquea el FTP está en la red de la
oficina, no en el hosting** — y los servidores de GitHub no pasan por esa red.

Con `FTP_HOST`, `FTP_USER` y `FTP_PASSWORD` en *Settings → Secrets and variables
→ Actions*, cada cambio guardado en GitHub se publica solo, y la sincronización
diaria de expositores también. Ver [`deploy.yml`](.github/workflows/deploy.yml).

Si al probarlo el hosting rechaza la conexión, puede que limite el FTP por
dirección IP. En ese caso se pide al hosting que permita el acceso, o se crea
un usuario de FTP específico para esto.

## Después de publicar

| Qué | Dónde |
|---|---|
| Poner la URL de Meetmaps | Ruta A: *Settings → Login*. Ruta B: el panel de `/admin/` |
| Editar textos, programa, expositores | Ruta A: `wp-admin`. Ruta B: `/admin/` |
| Programar copias de seguridad | Panel → *Bases de datos* (ruta A) o copia de archivos (ruta B) |
| Poner las cuentas a nombre de la entidad | [`TRASPASO.md`](TRASPASO.md) |

Lo del traspaso no depende de la ruta que elijas y es lo único que no se puede
arreglar más tarde. Empieza por ahí en cuanto la web esté publicada.
