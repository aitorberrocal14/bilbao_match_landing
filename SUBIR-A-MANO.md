# Subir la web a mano, desde el explorador del panel

Para cuando el FTP está bloqueado por la red y solo funciona el navegador.

**No son 124 subidas.** Son **12 carpetas**, y en cada una se suben todos sus
archivos de una vez. Si el explorador del panel deja seleccionar varios archivos
en el diálogo de subida —casi todos lo hacen, con `Ctrl + A`— esto son doce
operaciones y unos 20 minutos.

---

## Antes de empezar

1. Descomprime el ZIP en tu ordenador.
2. Abre la carpeta que se ha creado. Tienes que ver `index.html` a la vista.
   Si solo ves otra carpeta dentro, entra en ella.
3. En el Explorador de Windows: **Vista → Mostrar → Elementos ocultos**.
   Hay un archivo que empieza por punto y sin esto no lo verás.
4. En el panel del hosting, entra en el explorador de ficheros y ve a **`www`**.

> Si dentro de `www` hay una carpeta con el nombre del dominio, la web va
> **dentro de esa**, no en `www`.

---

## Cómo se hace cada paso

Siempre lo mismo:

1. En el panel, **crea la carpeta** (botón *Nuevo* → *Carpeta* o *Directorio*).
2. **Entra** en ella con doble clic.
3. **Sube** los archivos: icono de subir → en el diálogo, `Ctrl + A` para
   seleccionarlos todos → Abrir.
4. **Cuenta** que estén todos antes de pasar al siguiente.
5. **Vuelve atrás** para crear la siguiente carpeta.

---

## Las carpetas van unas dentro de otras

Cuando abajo pone `assets/img/brand`, **no es una carpeta llamada así**. Son
tres, metidas una dentro de la otra: dentro de `assets` está `img`, y dentro de
`img` está `brand`. La barra `/` significa "entra".

Esto es lo que tiene que quedar:

```
www/
├── index.html          ← sueltos aquí
├── robots.txt
├── sitemap.xml
│
├── assets/
│   ├── css/            1 archivo
│   ├── fonts/          2 archivos
│   ├── js/             2 archivos
│   │   └── data/       6 archivos
│   └── img/            1 archivo suelto aquí
│       ├── brand/      6 archivos
│       ├── photos/     3 archivos
│       ├── exhibitors/ 39 archivos  ← los logotipos
│       └── brochures/  16 archivos
│
├── exhibitors/         39 archivos  ← las páginas .html
└── admin/              6 archivos
```

> ⚠️ **Hay dos carpetas llamadas `exhibitors`** y no son la misma. Para
> rematarlo, los archivos se llaman igual en las dos —
> `aktiba.jpg` y `aktiba.html` — así que la única diferencia visible es la
> **extensión**:
>
> · `assets/img/exhibitors` → los **`.jpg`**, que son los logotipos
> · `exhibitors` (colgando de `www`) → los **`.html`**, que son las páginas
>
> Si se cruzan, la web sale con los logos rotos y las fichas en blanco.

Las carpetas pequeñas, por si quieres comprobar que subes lo que toca:

| Carpeta | Lo que lleva dentro |
|---|---|
| `assets/css` | `styles.css` |
| `assets/fonts` | `bariol-bold.ttf`, `bariol-regular.ttf` |
| `assets/js` | `components.js`, `main.js` |
| `assets/js/data` | `site.js`, `content.js`, `programme.js`, `exhibitors.js`, `discover.js`, `exhibitors-local.json` |
| `assets/img` (suelto) | `social-card.jpg` |

---

## La lista, en orden

Son **12 carpetas que crear**. Ve tachando.

### En `www`

- [ ] Crea **`assets`** y entra

### Dentro de `assets`, crea estas cuatro

- [ ] **`css`** → entra, sube **1 archivo**, vuelve atrás
- [ ] **`fonts`** → entra, sube **2 archivos**, vuelve atrás
- [ ] **`js`** → entra, sube **2 archivos** *(los de `data` todavía no)*
  - [ ] dentro de `js`, crea **`data`** → entra, sube **6 archivos**
  - [ ] vuelve atrás dos veces, hasta `assets`
- [ ] **`img`** → entra y sube **1 archivo** *(el que está suelto en `img`)*

### Dentro de `img`, crea estas cuatro

- [ ] **`brand`** → **6 archivos**
- [ ] **`photos`** → **3 archivos**
- [ ] **`exhibitors`** → **39 archivos** *(logotipos)*
- [ ] **`brochures`** → **16 archivos**

### Vuelve a `www`

- [ ] Crea **`exhibitors`** → **39 archivos** *(páginas `.html`)*
- [ ] Crea **`admin`** → **6 archivos** ⚠️ *uno es `.htaccess`, oculto*
- [ ] Y sueltos en `www`: **3 archivos** — `index.html`, `robots.txt`,
      `sitemap.xml`

**Total: 124 archivos en 12 carpetas.** Déjate los tres últimos para el final:
hasta que `index.html` no esté arriba, nadie verá nada a medio hacer.

> Para no perderte: ten abierta en tu ordenador la misma carpeta que estás
> creando en el panel. Si en el panel estás dentro de `assets/img/brand`, en tu
> ordenador tienes que estar dentro de esa misma. Así los archivos que subes son
> siempre los que tienes delante.

---

## El archivo oculto

La carpeta `admin` lleva un `.htaccess` que no aparece en los diálogos de
Windows si no has activado *Elementos ocultos* (paso 3 de arriba).

Sirve para que la contraseña del panel de edición no se pueda descargar nunca.
Si no consigues subirlo, no pasa nada grave **siempre que cierres la carpeta
`admin` con Protección de directorios** desde el panel del hosting, que es algo
que hay que hacer de todas formas.

---

## Comprobar que ha salido bien

Abre `matchbilbaobizkaia.eus` y repasa:

- [ ] Carga la portada **con sus colores y tipografías**
      → si sale el texto pelado, sin diseño: falta `assets/css`
- [ ] El programa muestra **5 días** y las pestañas cambian
      → si no aparece el programa: falta `assets/js` o `assets/js/data`
- [ ] Salen **39 logotipos**
      → si salen huecos: falta `assets/img/exhibitors`
- [ ] Al pinchar un logotipo se abre su ficha **sin error 404**
      → si da 404: falta `exhibitors`
- [ ] Salen **16 folletos** con su portada
      → si salen sin imagen: falta `assets/img/brochures`
- [ ] Se ve la **foto grande** de la portada
      → si no: falta `assets/img/photos`
- [ ] En el **móvil** funciona igual

Cada fallo apunta a una carpeta concreta. Si algo falla, sube esa carpeta otra
vez: no hay que repetir todo.

---

## Cuando termines

1. **Cierra el panel de edición**: panel del hosting → **Protección de
   directorios** → carpeta `admin` → usuario y contraseña.
2. Si has subido el paquete de pruebas a `www/pruebas`, **borra esa carpeta** en
   cuanto subas el definitivo. Dos copias de la misma web compitiendo en Google
   no le hacen bien a ninguna.

---

## ¿Merece la pena todo esto?

Sí, si la alternativa es el archivo único: la web completa carga en 1,6 segundos
en el móvil contra 9,6, tiene 40 direcciones reales en lugar de una, y se puede
seguir editando después subiendo archivos de 7 KB en vez de 4,7 MB.

Son veinte minutos una vez. Pero **mira antes si WordPress es viable**: su
instalador funciona dentro del servidor y el plugin es un único archivo que se
sube desde el navegador. Cero carpetas, cero FTP. Ver
[`wordpress/INSTALACION.md`](wordpress/INSTALACION.md).
