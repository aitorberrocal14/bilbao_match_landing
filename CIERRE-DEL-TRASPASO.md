# Cierre del traspaso

Cómo pasar de *"la web funciona porque yo estoy aquí"* a *"la web funciona"*.

Este documento es lo último que se hace. Cuando esté completo, la web no
depende de ninguna cuenta personal, de ningún servicio externo y de ninguna
persona en concreto.

---

## El estado final

```
/home/matchbilbaobizkaia/                 ← cuenta de Bilbao Ekintza
│
├── config.php                            la clave de Meetmaps
├── repo/                                 el código, ya traído
│   └── server/sync.php                   ← la ÚNICA tarea programada
│
└── www/                                  la web publicada
    ├── index.html  assets/  exhibitors/
    └── admin/                            ← donde se edita el contenido
```

**Una sola tarea programada:**

| Hora | Comando |
|---|---|
| 05:00 | `php /home/matchbilbaobizkaia/repo/server/sync.php` |

Y nada más. Ni GitHub, ni FTP, ni nadie subiendo archivos.

### Lo que hace cada pieza cuando ya no estés

| Quién | Qué mantiene | Cómo |
|---|---|---|
| **El personal de Bilbao Ekintza** | Textos, programa, folletos, contacto | `tu-web/admin/` → editar → Publicar |
| **Meetmaps** | Los expositores y sus páginas | Solo. Cada noche a las 5 |
| **Nadie** | El diseño | No cambia. Si alguna vez hay que tocarlo, hace falta un informático |

---

## La pieza que hay que retirar: el despliegue desde GitHub

Durante el desarrollo hay **dos** tareas programadas: `deploy.php`, que trae los
cambios del repositorio, y `sync.php`, que trae los expositores.

**`deploy.php` se retira el día del traspaso.** No es un olvido, es el diseño:

- Sirve para que quien desarrolla publique sin subir archivos. Cuando el
  desarrollo termina, no tiene nada que traer.
- Y si el repositorio deja de existir —porque estaba en una cuenta personal que
  se cierra— la tarea fallaría **cada noche, para siempre**, llenando el
  registro de errores que nadie sabrá interpretar.

Una web que depende de un repositorio que puede desaparecer no está traspasada.
Una web que ya tiene sus archivos en su servidor, sí.

> **Si el repositorio se transfiere a Bilbao Ekintza** (ver abajo), `deploy.php`
> puede quedarse: entonces apunta a algo de la entidad y no a algo tuyo. Es la
> opción mejor, pero es una decisión de ellos, no tuya.

---

## Antes del día del traspaso

### 1 · Decidir qué pasa con el código fuente

El repositorio es el código y el historial: el porqué de cada decisión. La web
funciona sin él, pero **nadie podrá volver a cambiar el diseño sin él**.

| Opción | Qué implica |
|---|---|
| **A. Transferir a una organización de GitHub de Bilbao Ekintza** | Lo mejor. Gratis, no se pierde nada, y `deploy.php` puede seguir funcionando |
| **B. Entregar un archivo del proyecto** | Aceptable. Se pierde el historial. Se guarda donde la entidad archive este material |
| **C. Dejarlo en la cuenta personal** | **No es una opción.** El día que se cierre, el código desaparece |

- [ ] Decidido: A / B
- [ ] Ejecutado

### 2 · Cerrar las titularidades

Del [documento de traspaso](TRASPASO.md), punto 1. Es lo más lento porque
depende de terceros, así que se empieza por aquí:

- [ ] **Dominio** `matchbilbaobizkaia.eus` a nombre de Bilbao Ekintza
- [ ] **Hosting** a nombre de Bilbao Ekintza, con correo institucional
- [ ] **Meetmaps** a nombre de Bilbao Ekintza
- [ ] El buzón `welcome@matchbilbaobizkaia.eus` lo lee más de una persona

### 3 · Crear los accesos de la entidad

- [ ] **Panel del hosting:** *Panel de acceso → Acceso independiente*, uno por
      persona. No una cuenta compartida
- [ ] **Panel de edición** (`/admin/`): la contraseña de publicación, en el
      gestor de contraseñas de la entidad
- [ ] **Protección de directorios** sobre la carpeta `admin`, con usuario propio
- [ ] **Meetmaps:** al menos dos personas con acceso

---

## El día del traspaso

### 4 · Último despliegue

- [ ] Comprueba que el repositorio está al día y que `main` es la rama por defecto
- [ ] Ejecuta `deploy.php` una última vez, **sin `--dry-run`**
- [ ] Ejecuta `sync.php`, **sin `--dry-run`**
- [ ] Abre la web y repasa la lista de comprobación del
      [paso a paso](SERVIDOR-PASO-A-PASO.md), Parte 4.3

### 5 · Mover la web a producción

Si sigue en la carpeta de pruebas:

- [ ] Quita la línea `web_dir` de `/home/matchbilbaobizkaia/config.php`
- [ ] Ejecuta `deploy.php` y `sync.php` otra vez — ahora publican en `www`
- [ ] Comprueba `matchbilbaobizkaia.eus` a secas
- [ ] **Borra la carpeta de pruebas.** Dos copias de la misma web indexadas en
      Google se perjudican entre sí
- [ ] Comprueba que `robots.txt` y `sitemap.xml` están en la raíz

### 6 · Retirar lo que era tuyo

- [ ] **Elimina la tarea de `deploy.php`** (salvo que se haya transferido el
      repositorio, opción A)
- [ ] Comprueba que queda **una sola** tarea programada: la de `sync.php` a las 5
- [ ] Borra cualquier tarea de comprobación que quedara (`comprobacion.txt`,
      clonado, ensayos)
- [ ] Si creaste un usuario de FTP para ti, bórralo
- [ ] Si guardaste secretos en GitHub (`FTP_*`, `MBB_API_KEY`), bórralos: ya no
      se usan, y una credencial olvidada en un sitio que nadie mira es una
      credencial filtrada esperando su turno
- [ ] Quita tu correo personal de cualquier contacto del panel, del dominio y
      de Meetmaps

### 7 · La prueba que cierra el traspaso

Esto es lo único que de verdad demuestra que está hecho:

- [ ] **Una persona de Bilbao Ekintza, contigo delante mirando y sin ayudarle**,
      entra en `/admin/`, cambia un texto, lo publica, y lo ve en la web.

Si eso sale, está traspasado. Si no sale, lo que falta no es un documento: es
una sesión de media hora con esa persona.

- [ ] Repetir con una segunda persona, para que no dependa de una sola

---

## Qué se podrá hacer después, y qué no

**Sin ayuda de nadie, desde `/admin/`:**

Textos, titulares, el programa entero, los folletos y sus enlaces, las vías de
contacto, el pie, el menú, la dirección del botón de Login.

**Sin ayuda de nadie, desde el panel del hosting:**

Subir una fotografía o un logotipo nuevo a `assets/img/` y escribir su ruta en
el panel de edición.

**Solo con ayuda técnica:**

Cambiar el diseño, añadir una sección nueva, o cambiar cómo funciona algo. Para
eso está el código fuente, y por eso importa dónde acabe.

**Automáticamente, sin que nadie haga nada:**

Los expositores. Una empresa se registra en Meetmaps y a la mañana siguiente
está publicada con su página.

---

## Si algo falla cuando ya no estés

Los registros están en `/home/matchbilbaobizkaia/logs/cron_logs/` y en
`repo/server/sync.log`, con la fecha y hora de cada ejecución.

| Síntoma | Dónde mirar |
|---|---|
| No aparecen expositores nuevos | `sync.log`. Si dice que la plataforma rechaza la petición, la clave de Meetmaps ha caducado |
| El panel de edición no publica | Falta `admin-config.php`, o la carpeta de datos perdió permisos de escritura. El propio panel lo dice |
| La web no carga | Panel del hosting → *Logs*, y *Herramienta de Diagnóstico* |
| Se publicó algo por error | Cada archivo de datos guarda su versión anterior como `.bak` en `assets/js/data/` |

Y la copia de seguridad: panel → **Backups**, y las copias programadas de la
base de datos si algún día se usa una.
