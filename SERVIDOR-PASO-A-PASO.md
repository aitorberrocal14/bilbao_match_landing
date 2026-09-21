# Conectar el servidor al repositorio, paso a paso

Sin dar nada por sabido. Cada punto es una sola acción.

Cuando termines, **la web se actualizará sola**: tú cambias algo en GitHub y el
servidor lo recoge. Se acabó subir archivos a mano.

**Tiempo:** una hora, de la cual media es esperar a que se ejecuten las tareas.

---

# PENDIENTE — lo que falta para que el directorio esté completo

*Anotado el 2026-09-21. Cuando estas dos cosas estén, bórrese esta sección.*

El servidor ya publica los expositores solos: quién sale, su ficha y su página.
Lo comprobado ese día, en el registro del propio servidor:

```
3 de 5 inscritos son expositores.
2 expositores (0 ocultos en la plataforma)
Hecho: 2 páginas de expositor y el sitemap.
```

Faltan dos datos, y los dos se ponen en `/home/matchbilbaobizkaia/config.php`.

## 1. Las categorías del filtro

El formulario de inscripción pregunta **«What kind of company are you?»** y sus
tres respuestas son los tres filtros de la web. La API no devuelve el texto de
la respuesta, solo un número, así que hay que decirle cuál es cuál.

Lo que ya se sabe: el campo es el **372592** —es el único que ven los
expositores; el 372361 es su equivalente para compradores y no sirve—. Y de sus
opciones, una está confirmada:

| Desplegable | Número | Categoría | |
|---|---|---|---|
| 1. Accommodation | `213999` | `accommodation` | deducido |
| 2. Basque DMC | `214000` | `dmc` | confirmado |
| 3. Boutique Experience in Bilbao Bizkaia | `214001` | `activities` | confirmado |

Los números van seguidos en el orden del desplegable, así que el de
Accommodation se deduce de los otros dos. Está puesto en `config.php`.

**Por qué se puede poner sin haberlo visto:** el mapa exige coincidencia
exacta. Un número equivocado no coincide con nada y no hace nada — no puede
colocar a una empresa en la categoría que no es. Como mucho, esa empresa
aparece bajo «All» y el registro del sync escribe el número correcto:

```
Respuestas del formulario sin categoría en config.php:
  "2140XX"
```

Si eso llega a salir, se sustituye la línea del `213999` por la buena. Para
confirmarlo antes basta con una inscripción de prueba que elija Accommodation
y volver a lanzar `--field 372592`.

**Qué hacer**, con gente de la oficina para poder inscribir pruebas:

1. Inscribir **tres asistentes de prueba**, eligiendo *Exhibitor* y una
   categoría distinta en cada uno. Anotar cuál lleva cuál.
2. Ejecutar, desde una tarea programada:
   `php /home/matchbilbaobizkaia/repo/server/sync.php --field 372592`
   Dice qué empresa eligió cada número.
3. Escribir el mapa en `config.php`:

```php
    'categories_from' => [
        'field_id' => '372592',
        'map' => [
            'NUMERO-DE-Accommodation'     => 'accommodation',
            'NUMERO-DE-Basque-DMC'        => 'dmc',
            'NUMERO-DE-Boutique-Experience' => 'activities',
        ],
    ],
```

Si falta alguna, no se rompe nada: esa empresa sale bajo «All» y el registro
escribe su número para poder añadirlo.

## 2. Los logotipos — RESUELTO el 2026-09-21

El campo **Logo** es el **372389** y los archivos no están en Meetmaps: están
en Google Cloud Storage, en una carpeta propia de este evento. Por eso ninguna
ruta de `apiv1.meetmaps.com` funcionaba.

La dirección se saca del panel de administración de Meetmaps, en el listado de
asistentes: la columna **Logo** enseña un chip azul **«File»**, y con el botón
derecho → *Copiar dirección del enlace* sale la dirección completa.

En `config.php`:

```php
    'logo_from' => ['field_id' => '372389'],
    'img_base'  => 'https://storage.googleapis.com/e-file/EV6a8ea32ab042b0ac3c6ff10108404b6bb4ffc/af/',
```

Comprobado que esa base sirve para todos los archivos del evento, no solo para
uno, y que el logotipo llega a la web y se publica.

**Para años siguientes:** ese `EV6a8e…` es el identificador de ESTE evento. Con
un evento nuevo cambia, y hay que sacarlo otra vez de la misma manera. Si no se
cambia, los logotipos dejan de aparecer sin que nada dé error — el sync lo dirá
en su registro, nombrando a cada empresa afectada.

---

## Lo que vamos a montar

```
/home/matchbilbaobizkaia/
│
├── config.php          ← la contraseña de Meetmaps. Fuera de la web
├── repo/               ← copia del repositorio. Fuera de la web
│
└── www/                        ← la carpeta pública
    └── pruebasbilbaoekintza26/ ← aquí aparece la web
```

**El repositorio va FUERA de `www`.** Esto no es un capricho: si estuviera
dentro, cualquiera podría descargarse la carpeta `.git` desde internet y con
ella todo el historial del proyecto. Hay robots que se dedican a buscarla.

El repositorio **copia** hacia tu carpeta de pruebas. Tú ves la web donde
querías; el historial queda a salvo.

---

## Antes de empezar: dónde se hace cada cosa

Vas a moverte por tres sitios. Ten los tres abiertos en pestañas distintas:

| Sitio | Para qué |
|---|---|
| **github.com** → tu repositorio | Cambiar la rama por defecto |
| **Panel del hosting** → *Servidor → Tareas programadas* | Lanzar los comandos |
| **Panel del hosting** → *Explorador de ficheros* | Crear archivos y leer los logs |

**Importante sobre los logs:** cuando una tarea escribe un log, el archivo NO
aparece donde tú escribes el nombre. Aparece siempre en:

```
/home/matchbilbaobizkaia/logs/cron_logs/
```

Ahí es donde tienes que ir a leer los resultados. En el campo del formulario se
pone **solo el nombre**, sin rutas: `clone.txt`, no `/home/…/clone.txt`.

---

# PARTE 1 · Preparar GitHub

## Paso 1.1 · Poner `main` como rama por defecto

1. Abre **github.com/aitorberrocal14/bilbao_match_landing**
2. Arriba, en la fila de pestañas (*Code · Issues · Pull requests · …*), pincha
   la última de la derecha: **⚙️ Settings**
3. En el menú de la izquierda, la primera opción: **General**
4. Baja hasta el bloque **Default branch**. Pondrá
   `claude/match-bilbao-2026-redesign-77pjwf`
5. Pincha el icono de las **dos flechas** (⇄) a la derecha del nombre
6. En el desplegable elige **`main`**
7. **Update** → te pedirá confirmar → **I understand, update the default branch**

**Por qué:** al clonar, el servidor se trae la rama por defecto. Si la dejas
como está, se traerá una rama con nombre de sesión de IA, que no es lo que
quieres que herede nadie.

## Paso 1.2 · Decidir cómo entra el servidor al repositorio

Esto tienes que decidirlo tú. Hay dos opciones:

**A. Repositorio público.** El comando de clonado no lleva contraseña y todo es
más simple. Dentro del repositorio **no hay ningún secreto**: la clave de
Meetmaps y las contraseñas viven solo en tu servidor, y está comprobado. Lo que
sería público es el código y los textos de una web que va a ser pública de todas
formas.

**B. Repositorio privado con token.** Más cerrado, pero hay que generar un token
en GitHub y guardarlo en el servidor, y es una credencial más que custodiar y
que traspasar.

> **Si eliges A**, sigue directamente al Paso 2.1.
>
> **Si eliges B**, dímelo antes de continuar y te doy los pasos del token: son
> distintos y no quiero que te quedes a medias.

Para ponerlo público: **Settings → General →** baja del todo hasta **Danger
Zone → Change repository visibility → Change to public**.

---

# PARTE 2 · Traer el repositorio al servidor

## Paso 2.1 · Crear la tarea de clonado

Ve al panel: **Servidor → Tareas programadas**.

Rellena el formulario **Crear tarea** con exactamente esto:

| Campo | Qué escribir |
|---|---|
| **Comando a ejecutar** | `git clone https://github.com/aitorberrocal14/bilbao_match_landing.git /home/matchbilbaobizkaia/repo` |
| **Hora** | Cada hora |
| **Minuto** | Cada 5 minutos |
| **Día de la semana** | Todos los días |
| **Día del mes** | Todos |
| **Mes** | Todos |
| **Fichero de log de resultados** | `clone.txt` |

Pulsa **Crear**.

## Paso 2.2 · Esperar

Cinco minutos. La tarea se ejecutará sola.

## Paso 2.3 · Comprobar que ha funcionado

1. Ve al **Explorador de ficheros**
2. Entra en `logs` → `cron_logs`
3. Abre **`clone.txt`**

**Si ha ido bien**, verás algo como:

```
Cloning into '/home/matchbilbaobizkaia/repo'...
```

**Si dice `already exists and is not an empty directory`**, también está bien:
significa que ya se clonó en un intento anterior. Sigue adelante.

**Si dice `Authentication failed` o `Repository not found`**, el repositorio
sigue siendo privado. Vuelve al Paso 1.2.

4. Vuelve a la raíz del explorador y comprueba que existe la carpeta **`repo`**,
   y que dentro hay carpetas como `assets`, `admin`, `server`.

## Paso 2.4 · Borrar la tarea de clonado

**Esto es importante.** Si la dejas, intentará clonar cada cinco minutos para
siempre.

En **Tareas programadas**, abajo está la lista **Tareas actuales**. Marca la
casilla de la tarea del `git clone` y elimínala.

---

# PARTE 3 · La contraseña de Meetmaps

## Paso 3.1 · Crear el archivo

1. **Explorador de ficheros**
2. Ponte en la **raíz** de tu cuenta — donde ves `www`, `logs`, `repo`, `Maildir`.
   **No entres en `www`.**
3. Botón **Nuevo** → **Archivo** (o *Crear archivo*)
4. Nómbralo exactamente: **`config.php`**
5. Ábrelo para editar y pega esto:

```php
<?php
return [
    'api_key'  => 'AQUI-VA-LA-USER-KEY-DE-MEETMAPS',
    'api_url'  => 'https://apiv1.meetmaps.com/api/v1/',
    'event_id' => 15425,
    'site_url' => 'https://www.matchbilbaobizkaia.eus/',
    'web_dir'  => '/home/matchbilbaobizkaia/www/pruebasbilbaoekintza26',
];
```

6. **Cambia solo la primera línea**: sustituye `AQUI-VA-LA-USER-KEY-DE-MEETMAPS`
   por la clave que te dio Meetmaps. Deja las comillas.
7. Guarda.

**Comprueba que la ruta es esta y no otra:**

```
/home/matchbilbaobizkaia/config.php
```

Si acaba en `/www/config.php`, está en el sitio equivocado. Muévelo.

**Por qué ahí:** en la raíz de la cuenta no llega ninguna dirección de internet.
Nadie puede pedir ese archivo por la web porque no existe una URL que lleve a él.

> La línea `web_dir` es la que hace que la web se publique en tu carpeta de
> pruebas. El día que la web pase a producción, borras esa línea y pasará a
> publicarse en `www` directamente.

---

# PARTE 4 · Publicar la web

## Paso 4.1 · Ensayo

Nueva tarea programada:

| Campo | Qué escribir |
|---|---|
| **Comando** | `php /home/matchbilbaobizkaia/repo/server/deploy.php --dry-run` |
| **Hora** | Cada hora |
| **Minuto** | Cada 5 minutos |
| **Los tres siguientes** | Todos |
| **Fichero de log** | `deploy.txt` |

**Crear**, espera cinco minutos, y lee `logs/cron_logs/deploy.txt`.

Debe decir algo como:

```
ENSAYO: se copiarían 46 archivos, 0 ya estaban iguales.
Ensayo terminado. No se ha tocado nada.
```

**Si dice que no encuentra la carpeta pública**, revisa la línea `web_dir` del
`config.php` del Paso 3.1.

## Paso 4.2 · De verdad

1. Edita esa misma tarea
2. **Quita `--dry-run`** del comando. Queda así:
   ```
   php /home/matchbilbaobizkaia/repo/server/deploy.php
   ```
3. Guarda, espera cinco minutos, y vuelve a leer `deploy.txt`.

Debe decir:

```
Copiados 46 archivos, 0 ya estaban iguales.
Web actualizada en /home/matchbilbaobizkaia/www/pruebasbilbaoekintza26
```

## Paso 4.3 · Mírala

Abre en el navegador:

```
matchbilbaobizkaia.eus/pruebasbilbaoekintza26/
```

Comprueba:

- [ ] Carga con sus colores y su fotografía
- [ ] El programa muestra **5 días** y las pestañas cambian
- [ ] En **Exhibitors** sale un bloque que dice *"The exhibitor directory opens
      as companies register"* con un botón de Login
- [ ] Salen **16 folletos** y uno abre el lector
- [ ] En el **móvil** funciona igual

> Que no haya expositores es **correcto**: los retiramos a propósito y los
> repondrá Meetmaps en la Parte 5.

## Paso 4.4 · Dejar el despliegue en automático

Edita la tarea otra vez y cambia la frecuencia:

| Campo | Qué escribir |
|---|---|
| **Hora** | `4` |
| **Minuto** | `0` |

Así se ejecuta una vez al día, a las 4 de la mañana. Ya no hace falta más.

---

# PARTE 5 · Traer los expositores de Meetmaps

## Paso 5.1 · Ensayo

Nueva tarea:

| Campo | Qué escribir |
|---|---|
| **Comando** | `php /home/matchbilbaobizkaia/repo/server/sync.php --dry-run` |
| **Hora** | Cada hora |
| **Minuto** | Cada 15 minutos |
| **Los tres siguientes** | Todos |
| **Fichero de log** | `sync.txt` |

**Este es el momento de la verdad**: la primera vez que el código habla con
Meetmaps. Como va en ensayo, **no puede estropear nada** — solo cuenta lo que
encontraría.

Espera y lee `logs/cron_logs/sync.txt`.

**Si va bien**, dirá cuántos expositores hay en la plataforma.

**Si dice algo distinto**, pásamelo tal cual y lo miramos. Los mensajes posibles
y lo que significan:

| Lo que diga | Qué pasa |
|---|---|
| `No hay configuración` | Falta el `config.php`, o está en otra carpeta. Paso 3.1 |
| `La plataforma rechazó la petición` | La user key no es correcta, o no tiene permiso |
| `No se ha podido contactar` | La dirección de la API no responde |
| `La respuesta no traía la lista` | Meetmaps contestó otra cosa. Pásame el log |
| `rechazó la petición en los dos formatos` | La clave o el evento. Vuelve a lanzarlo añadiendo `--debug` al final y pásame lo que imprima: dice cuánto mide la clave, si lleva espacios pegados y qué contesta exactamente la plataforma. **No enseña la clave.** |

## Paso 5.2 · De verdad, la primera vez

Cuando el ensayo salga bien, edita la tarea y cambia el comando a:

```
php /home/matchbilbaobizkaia/repo/server/sync.php --allow-shrink
```

**`--allow-shrink` solo hace falta esta vez.** Existe una protección que impide
que la lista de expositores se desplome de golpe — para que un fallo de la
plataforma no vacíe el directorio en pleno evento. Como ahora pasamos de cero a
los que haya, hay que autorizarlo expresamente una vez.

Espera, lee el log, y mira la web: los expositores deberían estar ahí, cada uno
con su página.

## Paso 5.3 · Dejarlo en automático

Edita la tarea por última vez:

| Campo | Qué escribir |
|---|---|
| **Comando** | `php /home/matchbilbaobizkaia/repo/server/sync.php` |
| **Hora** | `5` |
| **Minuto** | `0` |

Sin `--allow-shrink` y sin `--dry-run`. Una vez al día, a las 5 de la mañana.

**Fíjate en las horas:** el despliegue a las 4, la sincronización a las 5. Ese
orden importa. El despliegue deja la web como está en el repositorio, donde la
lista de expositores está vacía; la sincronización la vuelve a llenar desde
Meetmaps. Al revés, cada noche la web se quedaría sin expositores durante una
hora.

**Mientras se está trabajando en la web** conviene que las dos vayan más
seguidas. Se pueden poner cada 15 minutos, pero **no en el mismo minuto**:

| Comando | Minuto |
|---|---|
| `php /home/matchbilbaobizkaia/repo/server/deploy.php` | `*/15` |
| `php /home/matchbilbaobizkaia/repo/server/sync.php` | `5,20,35,50` |

Así la sincronización entra siempre cinco minutos después del despliegue. Si el
panel no acepta la lista con comas, pon la sincronización en el minuto `5` y
que se ejecute una vez por hora: para lo que hace, sobra.

Aunque se solaparan, no romperían nada: los dos piden turno antes de escribir
—`server/turno.php`— y el que llega y encuentra al otro dentro se espera, y si
sigue ocupado se retira y vuelve en la siguiente vuelta. Lo dice en su registro.
Pero es un seguro, no una excusa para ponerlas a la vez.

---

# PARTE 6 · Cerrar el panel de edición

La web incluye su propio editor en `/admin/`. Ciérralo:

1. Panel → busca **Protección de directorios** (o *Directory privacy*)
2. Elige la carpeta `www/pruebasbilbaoekintza26/admin`
3. Crea un usuario y una contraseña

Sin esto, quien encuentre la dirección ve los formularios. No puede guardar nada
—el servidor lo rechaza— pero no tiene por qué verlos.

---

# Cómo queda al final

**Dos tareas programadas**, y nada más:

| Hora | Comando |
|---|---|
| 04:00 | `php /home/matchbilbaobizkaia/repo/server/deploy.php` |
| 05:00 | `php /home/matchbilbaobizkaia/repo/server/sync.php` |

**A partir de aquí:**

- Cambias un texto en GitHub → a las 4 de la mañana está en la web
- Una empresa se registra en Meetmaps → a las 5 está publicada con su página
- **Tú no subes nada nunca más**

Y si algo va mal, los dos logs están siempre en
`/home/matchbilbaobizkaia/logs/cron_logs/`, con la fecha y la hora de cada
ejecución.
