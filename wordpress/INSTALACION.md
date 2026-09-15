# Instalar y configurar la web en WordPress

Guía completa, de principio a fin, para dejar Match Bilbao Bizkaia 2026
funcionando en un WordPress instalado en el hosting propio.

Está escrita para hacerse **una sola vez**, siguiendo los pasos en orden. No
hace falta saber programar. Cuando termine, la web estará publicada y cualquier
persona de Bilbao Ekintza podrá editarla desde `wp-admin`.

**Tiempo:** entre hora y media y dos horas la primera vez.

---

## Antes de empezar

### Ten esto a mano

| Dato | De dónde sale |
|---|---|
| Acceso al panel del hosting | `paneles.gestiondecuenta.com` |
| Datos de FTP | Panel → *Configuración del FTP* |
| Un correo institucional de Bilbao Ekintza | Para el administrador de WordPress |
| La URL de Meetmaps | La plataforma a la que apunta el botón Login |
| El archivo `match-bilbao-bizkaia.zip` | El plugin |

El correo **no debe ser personal**. Es a donde llegan los avisos y por donde se
recupera la contraseña: si es el de alguien que se va, el día que se vaya nadie
puede recuperar el acceso. Esto es el punto 1 del [documento de
traspaso](../TRASPASO.md).

### Guarda lo que haya ahora

Aunque la web esté casi vacía, conéctate por FTP a la carpeta pública y
**descárgate todo lo que haya** a tu ordenador. Dos minutos, y cierra la única
puerta por la que esto se puede torcer.

Mira especialmente si existe un archivo llamado **`.htaccess`**. Está oculto: en
FileZilla se ve con *Servidor → Forzar mostrar archivos ocultos*. Si existe,
guárdalo aparte y ábrelo con el Bloc de notas antes de seguir. Puede contener
redirecciones o configuración del correo que WordPress va a sobrescribir.

---

## Paso 1 · Instalar WordPress

En el panel del hosting, en la lista de aplicaciones autoinstalables, pincha en
**WordPress** — el tercero, el que dice *"El gestor de blogs con más difusión"*.
No los dos de arriba con estrella: esos son las versiones promocionadas de la
empresa.

Te pedirá estos datos:

| Campo | Qué poner |
|---|---|
| **Dominio** | `matchbilbaobizkaia.eus` |
| **Directorio / carpeta** | **Déjalo vacío** para instalar en la raíz |
| **Base de datos** | No hay nada que hacer: el instalador la crea solo |
| **Nombre del sitio** | `Match Bilbao Bizkaia` |
| **Descripción** | `The professional meeting point of the Bilbao Bizkaia destination` |
| **Usuario administrador** | Cualquier cosa **menos `admin`** |
| **Contraseña** | Larga. La que proponga el instalador sirve: cópiala y guárdala |
| **Correo del administrador** | El institucional |
| **Idioma** | Español, de momento |

**Sobre el directorio:** dejarlo vacío instala WordPress en la raíz, que es lo
que quieres si no hay nada publicado que perder. Si pones una carpeta, WordPress
queda en `matchbilbaobizkaia.eus/esa-carpeta`, y moverlo después a la raíz **no
es arrastrar archivos**: la dirección queda grabada dentro de la base de datos y
hay que reescribirla entera. Mejor acertar ahora.

**Sobre el usuario:** `admin` es el primer nombre que prueban los ataques
automáticos. Usa algo como `mbb-gestion` o el nombre del área.

Dale a instalar y espera. Al terminar te dará la dirección de acceso:
`matchbilbaobizkaia.eus/wp-admin`.

> ⚠️ **No subas el ZIP de la web estática a la raíz.** Los dos quieren ser la
> portada, y en casi todos los servidores `index.html` gana a `index.php`.
> Subirías WordPress, lo configurarías, entrarías en el dominio y seguirías
> viendo la web antigua sin entender por qué.

---

## Paso 2 · Los primeros ajustes de WordPress

Entra en `matchbilbaobizkaia.eus/wp-admin` con el usuario y la contraseña del
paso anterior.

### 2.1 · Enlaces permanentes

**Ajustes → Enlaces permanentes** → elige **Nombre de la entrada** → *Guardar*.

Esto hace que las direcciones sean legibles
(`/exhibitors/gran-hotel-domine/` en lugar de `?p=123`). **Es obligatorio**: sin
esto, las páginas de los expositores dan error 404. Tendrás que volver a darle a
*Guardar* una vez más después de instalar el plugin.

### 2.2 · Idioma

Aquí hay un detalle que no es evidente. La web es **en inglés**, pero quien la
gestiona habla castellano. WordPress permite separarlo:

- **Ajustes → Generales → Idioma del sitio** → **English (United States)**. Esto
  afecta a lo que ve el visitante.
- **Usuarios → Perfil → Idioma** → **Español**. Esto afecta solo a tu panel de
  administración.

Cada persona que entre a gestionar puede poner el suyo en su perfil.

### 2.3 · Zona horaria

**Ajustes → Generales → Zona horaria** → `Madrid`. Importa para las fechas del
programa.

### 2.4 · Comentarios

**Ajustes → Comentarios** → desmarca **"Permitir que la gente envíe
comentarios"**. Esta web no tiene blog y los comentarios abiertos solo traen
spam.

### 2.5 · Visibilidad en buscadores

**Ajustes → Lectura** → comprueba que **"Disuade a los motores de búsqueda"**
esté **desmarcado**. Algunos instaladores lo dejan marcado y la web no aparece
en Google nunca. Si vas a estar montándola varios días y no quieres que se
indexe a medias, déjalo marcado ahora y **acuérdate de desmarcarlo al
terminar** — apúntalo, porque es el olvido más común.

---

## Paso 3 · El tema

El plugin dibuja las secciones de la web, pero **la cabecera, el menú y el pie
los pone el tema**. Necesitas uno que sepa mostrar una página a todo el ancho,
sin barra lateral y sin repetir el título.

**Apariencia → Temas → Añadir nuevo**, busca **Astra** e instálalo y actívalo.
Es gratuito, lo usa muchísima gente —lo cual importa para el traspaso: cualquiera
que venga después lo conoce— y trae justo esas opciones.

Después, al editar la página del paso 7, en la columna de la derecha aparecerá
un bloque de ajustes de Astra donde hay que poner:

- **Sidebar / Barra lateral:** `No Sidebar`
- **Content Layout / Diseño:** `Full Width / Stretched`
- **Disable Sections:** marcar **Title**

Los nombres bailan un poco según la versión, pero son esas tres ideas: sin barra
lateral, a todo el ancho, sin título.

> Si prefieres otro tema, vale cualquiera que ofrezca una plantilla de página a
> ancho completo. Lo único que no funciona bien es un tema con barra lateral
> fija.

---

## Paso 4 · Instalar el plugin

**Plugins → Añadir nuevo → Subir plugin** → *Seleccionar archivo* →
`match-bilbao-bizkaia.zip` → **Instalar ahora** → **Activar**.

El menú del plugin aparece en inglés — *Match Bilbao Bizkaia*, *Exhibitors*,
*Brochures*, *Programme*, *Settings* — aunque tu panel esté en castellano. Es
normal: el plugin está escrito en el idioma de la web.

---

## Paso 5 · Importar el contenido

Al activar el plugin sale un aviso arriba: **"Import the starting content"**.
Pínchalo y luego **Import now**.

Eso crea de una vez:

- los **39 expositores**, con su logotipo, su bloque de contacto y su texto,
- los **16 folletos** en inglés, con sus portadas y sus enlaces de Issuu,
- el **programa completo**: 5 días y 62 sesiones.

Tarda un minuto o dos, porque está subiendo unas 60 imágenes a la biblioteca de
medios. **No cierres la pestaña.**

La importación se puede repetir sin miedo: lo que ya existe se salta, así que
nunca pisa lo que hayas editado tú.

Cuando acabe, entra en **Match Bilbao Bizkaia → Exhibitors** y comprueba que
salen 39 con sus logotipos. Si salen menos, o sin imagen, ve al final de esta
guía.

---

## Paso 6 · Los ajustes del plugin

**Match Bilbao Bizkaia → Settings**. Está dividido en cinco bloques.

### The event
Edición, fechas y, día a día, la etiqueta, la fecha, el tema y el resumen de los
cinco días. Los campos **First day** y **Last day** no se ven en la web: los lee
Google para mostrar el evento con sus fechas en los resultados. Mantenlos en
sintonía con la línea de fechas de arriba.

### Hero
El titular, la entradilla, la fotografía de portada y hasta cuatro cifras
destacadas.

### Links — **este es el importante**
| Campo | Qué poner |
|---|---|
| **Login / meeting platform** | La URL de Meetmaps. **Si lo dejas vacío, los botones de Login no aparecen** |
| **Login button text** | `Login` |
| **Issuu profile** | `https://issuu.com/turismobilbao` |
| **Newsletter form endpoint** | Déjalo vacío hasta que se decida dónde llegan las suscripciones |

### Latest editions (video)
Los vídeos de ediciones anteriores. Acepta la URL entera de YouTube o solo el
ID. Los vídeos no cargan hasta que el visitante pincha, así que no añaden nada
al aviso de cookies.

### Contact
Hasta cuatro vías de contacto. Ahora mismo van dos:

- **Canal 1** — Email · `welcome@matchbilbaobizkaia.eus`
- **Canal 2** — Telephone · `+34 944 205 377`

Los canales 3 y 4 se dejan vacíos y no se muestran.

Guarda.

---

## Paso 7 · La página y la portada

### 7.1 · Crear la página

**Páginas → Añadir nueva.**

- Título: `Match Bilbao Bizkaia 2026`
- En el cuerpo, escribe **esto y nada más**:

  ```
  [mbb_landing]
  ```

  Si el editor te lo convierte en algo raro, usa el bloque **Shortcode**: el
  botón `+` → busca *Shortcode* → pega ahí dentro.

- En la columna derecha, los ajustes de Astra del paso 3.
- **Publicar.**

### 7.2 · Ponerla de portada

**Ajustes → Lectura → Tu página de inicio muestra** → **Una página estática** →
en *Página de inicio* elige **Match Bilbao Bizkaia 2026** → *Guardar*.

### 7.3 · Volver a guardar los enlaces permanentes

**Ajustes → Enlaces permanentes → Guardar cambios.** Sin tocar nada más, solo
guardar. Esto activa las direcciones de los expositores, que el plugin acaba de
registrar.

Ahora abre `matchbilbaobizkaia.eus` en otra pestaña. Debería verse la web.

---

## Paso 8 · El menú

El menú lo pone el tema, no el plugin. **Apariencia → Menús** (o *Apariencia →
Personalizar → Menús* en algunos temas).

Crea un menú llamado `Principal` y añádele **Enlaces personalizados**:

| Texto | Dirección |
|---|---|
| Home | `/` |
| Match Bilbao Bizkaia 2026 | `/#event` |
| Meet BB's Experts | `/#experts` |
| Discover | `/#discover` |
| Contact | `/#contact` |
| Login | La URL de Meetmaps |

Asígnalo a la ubicación principal del tema y guarda.

En el enlace de **Login**, si el tema lo permite, márcalo para que abra en una
pestaña nueva: la gente que va a la plataforma no debería perder la web.

---

## Paso 9 · Comprobación final

Abre la web en una ventana nueva y repasa:

- [ ] La portada carga y se ve el titular sobre la fotografía
- [ ] El programa muestra **5 días** y las pestañas cambian de día
- [ ] Los botones de **vista** (detalle / resumen) funcionan
- [ ] El botón de **añadir al calendario** descarga un archivo
- [ ] Salen **39 logotipos** de expositores
- [ ] El **filtro por categoría** funciona
- [ ] El **buscador** de expositores encuentra empresas
- [ ] Pinchando un logotipo se abre la página de esa empresa, **sin error 404**
- [ ] Salen **16 folletos** y al pinchar uno se abre el lector de Issuu
- [ ] Los botones de **Login** aparecen y llevan a Meetmaps
- [ ] El contacto muestra el email y el teléfono correctos
- [ ] **En el móvil** todo lo anterior sigue funcionando
- [ ] **Ajustes → Lectura**: "Disuade a los motores de búsqueda" está desmarcado

---

## Paso 10 · Las personas de Bilbao Ekintza

**Usuarios → Añadir nuevo**, uno por cada persona que vaya a editar.

- **Rol Editor**, no Administrador. Un Editor puede cambiar todo el contenido
  pero no puede instalar plugins, cambiar el tema ni romper la instalación.
  Deja Administrador para una o dos personas como mucho.
- Cada uno con **su correo institucional y su propia contraseña**. Nada de una
  cuenta compartida: cuando alguien se va, se desactiva la suya y ya está.

Y el último paso del traspaso, que es el que de verdad cierra esto:
**que una de esas personas haga un cambio de principio a fin, sin ayuda**,
mientras todavía hay alguien a quien preguntar.

---

## Mantenimiento

### Copias de seguridad

Una web con contenido y sin copia es una web que se puede perder entera. Y hay
que entender que **WordPress guarda sus cosas en dos sitios a la vez**, así que
una copia completa son dos copias:

| Dónde | Qué hay ahí | Cómo se copia |
|---|---|---|
| **La base de datos** | Los textos, los expositores, el programa, los ajustes, los usuarios | Panel del hosting → *Bases de datos* → **Programar Backups** |
| **Los archivos** | Las imágenes de la biblioteca de medios, el plugin, el tema | Copia del hosting, o descargar `wp-content/` por FTP |

Una copia de la base de datos **sin los archivos** te devuelve la web con todos
los textos y sin ninguna foto. Hacen falta las dos.

**Prográmalo nada más terminar la instalación**, no "cuando haya tiempo". El
apartado *Bases de datos* del panel programa las copias periódicas solo, en
ficheros SQL dentro del propio hosting, y es lo más cómodo porque no depende de
ningún plugin.

Si el hosting no copia los archivos, instala **UpdraftPlus** (gratuito), que
hace las dos cosas a la vez y las puede dejar en Google Drive o Dropbox.

### Seguridad de la base de datos

En ese mismo apartado, **limita el acceso a `localhost`**. Significa que a la
base de datos solo se puede llegar desde la propia web, no desde internet. Lo
recomienda el propio hosting y es un minuto.

Si la aplicación te pregunta alguna vez por el servidor de base de datos, la
respuesta es `localhost`.

**Actualizaciones.** WordPress avisa cuando hay. Las de seguridad se aplican
solas; las demás, cada pocas semanas, y con una copia reciente hecha antes.

**El plugin de Match Bilbao Bizkaia** no se actualiza solo: si hay una versión
nueva, se sube igual que en el paso 4 y WordPress pregunta si reemplazar.

---

## Si algo falla

Esta parte importa: el plugin se escribió y se probó contra un WordPress
simulado, porque el entorno donde se desarrolló no podía ejecutar uno de
verdad. Lo que está verificado es el dibujado de todas las secciones y el
comportamiento de las pestañas, el filtro y el lector de folletos. Lo que **solo
se puede confirmar en una instalación real** son justo tres cosas: las pantallas
de administración, la importación escribiendo en la biblioteca de medios, y los
enlaces permanentes. Si algo va a dar guerra, será ahí.

| Síntoma | Qué pasa y cómo se arregla |
|---|---|
| **Entro en el dominio y veo la web antigua** | Hay un `index.html` en la raíz haciendo sombra a WordPress. Bórralo por FTP |
| **La página sale con `[mbb_landing]` escrito tal cual** | El plugin no está activo. Plugins → Activar |
| **Los expositores dan error 404** | Faltan los enlaces permanentes. Ajustes → Enlaces permanentes → Guardar |
| **La importación se queda a medias o da error 500** | Falta memoria de PHP. En el panel del hosting, sube `memory_limit` a `256M` y `max_execution_time` a `300`. Repite la importación: continúa donde lo dejó |
| **Faltan logotipos** | Lo mismo de arriba. Repite la importación, que salta lo ya creado |
| **La web se ve sin estilos** | El tema está metiendo la página en una plantilla estrecha. Revisa el paso 3 |
| **Sale el título "Match Bilbao Bizkaia 2026" repetido arriba** | Falta desactivar el título en los ajustes de Astra de esa página |
| **Pantalla en blanco** | Un error de PHP. En el panel del hosting busca el registro de errores, o desactiva el plugin renombrando su carpeta por FTP en `wp-content/plugins/` |

Si te topas con algo que no está en esta tabla, anota **qué paso estabas
haciendo y qué pone exactamente en pantalla**. Con eso se resuelve; sin eso, se
adivina.

---

## Dónde se edita cada cosa, a partir de ahora

| Qué | Dónde |
|---|---|
| Expositores: logotipo, categoría, contacto, texto, orden | **Match Bilbao Bizkaia → Exhibitors** |
| Las categorías del filtro | **Exhibitors → Categories** |
| Folletos: portada, subtítulo, enlace | **Match Bilbao Bizkaia → Brochures** |
| Programa: día, hora, título, lugar | **Match Bilbao Bizkaia → Programme** |
| Portada, fechas, cifras, vídeos, Login, contacto | **Match Bilbao Bizkaia → Settings** |
| Los textos largos de las secciones | Dentro de la propia página |

**Para añadir un expositor:** *Exhibitors → Add exhibitor*. El título es el
nombre de la empresa, la **imagen destacada** es el logotipo, el editor grande
es la descripción, y los campos de *Details* son el bloque de contacto. El
*Orden*, en *Atributos de página*, coloca la empresa en la rejilla. Nada más: la
rejilla, el filtro y la página propia de la empresa se actualizan solas.
