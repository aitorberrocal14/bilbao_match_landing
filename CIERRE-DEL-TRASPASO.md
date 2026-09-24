# Cierre del traspaso

Cómo pasar de *"la web funciona porque yo estoy aquí"* a *"la web funciona"*.

Este documento es lo último que se hace.

> **Decisión tomada (24 de septiembre de 2026).** Bilbao Ekintza **no** va a
> editar la web por su cuenta: el panel de administración no se publica, y los
> cambios de contenido los hará un programador contratado para ello. Eso
> cambia dos cosas de este documento respecto a como estaba escrito:
>
> - El panel `/admin/` **no se instala**. Nada de contraseñas ni de proteger
>   carpetas: se queda sin publicar, como está hoy.
> - `deploy.php` **se queda**. Era la pieza a retirar cuando el panel iba a
>   ser la vía de edición; sin panel, es la única vía que queda para que un
>   cambio llegue al servidor.
>
> A cambio, la web **sí depende de una cuenta personal**: la del repositorio.
> Eso es aceptable si es el trato, pero tiene que estar dicho, y está más
> abajo en «Lo que esta decisión implica».

---

## El estado final

```
/home/matchbilbaobizkaia/                 ← cuenta de Bilbao Ekintza
│
├── config.php                            la clave de Meetmaps
├── repo/                                 el código, traído de GitHub
│   ├── server/deploy.php                 ← tarea 1: publica los cambios
│   └── server/sync.php                   ← tarea 2: trae los expositores
│
└── www/                                  la web publicada
    └── index.html  assets/  exhibitors/
```

Sin carpeta `admin/`: el despliegue la retira en cada pasada, a propósito.

**Dos tareas programadas, y en este orden:**

| Hora | Comando |
|---|---|
| 04:00 | `php /home/matchbilbaobizkaia/repo/server/deploy.php` |
| 05:00 | `php /home/matchbilbaobizkaia/repo/server/sync.php` |

El orden importa: el despliegue deja la web como está en el repositorio, donde
la lista de expositores está vacía; la sincronización la vuelve a llenar desde
Meetmaps. Al revés, cada noche la web se quedaría sin expositores una hora.

### Lo que hace cada pieza cuando ya no estés

| Quién | Qué mantiene | Cómo |
|---|---|---|
| **Un programador** | Textos, programa, folletos, diseño | Edita el repositorio; el despliegue lo baja solo |
| **Meetmaps** | Los expositores y sus páginas | Solo. Cada noche a las 5 |
| **Bilbao Ekintza** | Nada por su cuenta | Por decisión propia: ver el recuadro del principio |

### Lo que esta decisión implica

Conviene que Bilbao Ekintza lo sepa antes de firmar nada, porque es lo que
cambia respecto a una web que se traspasa del todo:

- **Para cambiar una coma hace falta un programador.** No hay pantalla de
  edición. Un texto, una fecha del programa, un folleto nuevo: todo pasa por
  quien tenga acceso al repositorio.
- **El repositorio está en una cuenta personal.** Mientras exista y sea
  accesible, el despliegue funciona. Si se cierra, se borra o se hace privado
  sin dar acceso, los cambios dejan de llegar.
- **La web NO se cae por eso.** Sus archivos ya están en el servidor y ahí se
  quedan; Meetmaps sigue trayendo expositores cada noche. Lo que se pierde es
  la capacidad de CAMBIARLA, no la web.
- **Y se puede recuperar.** Con el zip del proyecto, otro programador crea un
  repositorio nuevo, cambia la dirección en `repo/` con un `git remote
  set-url`, y todo vuelve a funcionar. Eso hay que dejarlo escrito en la
  entrega, porque nadie lo adivina.

---

## La pieza que se queda: el despliegue desde GitHub

Hay **dos** tareas programadas: `deploy.php`, que trae los cambios del
repositorio, y `sync.php`, que trae los expositores. Las dos se quedan.

Este apartado decía lo contrario, y el motivo de que lo dijera era el panel de
administración: si Bilbao Ekintza iba a editar desde el navegador, `deploy.php`
tenía que irse, porque el panel guarda en `www/assets/js/data/` y **el
despliegue pisa exactamente esos cuatro archivos** en cada pasada. Los dos
juntos significan que cada cambio hecho en el panel desaparece en un cuarto de
hora, y el registro dice que todo ha ido bien.

Sin panel, ese conflicto no existe, y `deploy.php` pasa de estorbo a ser la
única vía que hay: un programador cambia el repositorio y el servidor lo recoge
solo. Quitarlo dejaría la web congelada para siempre.

> **Si algún día se quiere el panel**, hay que hacer las dos cosas a la vez:
> retirar `deploy.php` del cron **y** copiar la carpeta `admin/` a la web con
> su `admin-config.php` y su protección de directorio. Una sin la otra no
> funciona, y falla en silencio.

---

## Antes del día del traspaso

### 1 · El código fuente

**Decidido:** el repositorio se queda en la cuenta personal de quien lo ha
desarrollado, y Bilbao Ekintza recibe **un zip con el proyecto completo**.

- [x] Decidido
- [ ] Zip entregado y archivado donde la entidad guarde este material
- [ ] Entregado por escrito, junto al zip, lo que dice «Lo que esta decisión
      implica» arriba: que para cambiar algo hace falta un programador, que el
      despliegue depende de un repositorio ajeno, que la web no se cae si ese
      repositorio desaparece, y cómo apuntar el servidor a uno nuevo
      (`git remote set-url` dentro de `repo/`)

> Mientras el repositorio siga existiendo y siendo accesible, `deploy.php`
> funciona sin credenciales. Si alguna vez se hace privado, hay que darle al
> servidor una forma de entrar, o el despliegue empezará a fallar cada noche.

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
- [ ] **Meetmaps:** al menos dos personas con acceso

El panel de edición no entra aquí: no se instala. Si algún día se instalara,
harían falta su contraseña de publicación y una protección de directorio sobre
la carpeta — ver el recuadro de «La pieza que se queda».

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

- [ ] **`deploy.php` se queda.** Comprueba que hay **dos** tareas y en su hora:
      despliegue a las 4, sincronización a las 5
- [ ] Comprueba que ninguna lleva `--dry-run` ni `--allow-shrink`
- [ ] Borra cualquier tarea de comprobación que quedara (`comprobacion.txt`,
      clonado, ensayos)
- [ ] Si creaste un usuario de FTP para ti, bórralo
- [ ] Si guardaste secretos en GitHub (`FTP_*`, `MBB_API_KEY`), bórralos: ya no
      se usan, y una credencial olvidada en un sitio que nadie mira es una
      credencial filtrada esperando su turno
- [ ] Quita tu correo personal de cualquier contacto del panel, del dominio y
      de Meetmaps

### 7 · La prueba que cierra el traspaso

Sin panel, la prueba ya no la hace Bilbao Ekintza: la hace el circuito. Lo que
tiene que demostrarse es que un cambio llega a la web sin que nadie entre en el
servidor.

- [ ] Cambia una palabra en el repositorio —desde la página de GitHub, sin
      clonar nada— y espera a que pase el despliegue
- [ ] Compruébalo en la web
- [ ] Hazlo **con alguien de Bilbao Ekintza delante**, para que vea cuánto
      tarda y qué hay que pedirle a quien se contrate
- [ ] Y deja escrito a quién se llama cuando haya que cambiar algo

Si eso sale, está traspasado. Si no sale, lo que falta no es un documento: es
una sesión de media hora con esa persona.

- [ ] Repetir con una segunda persona, para que no dependa de una sola

---

## Qué se podrá hacer después, y qué no

**Sin que nadie haga nada: los expositores.** Una empresa se registra en
Meetmaps y a la mañana siguiente está publicada con su página, su logotipo y
sus datos de contacto. Esa parte —la que más se mueve— se mantiene sola.

**Todo lo demás necesita un programador.** Textos, titulares, el programa, los
folletos, las vías de contacto, el pie, el menú, una fotografía nueva, el
diseño, una sección más. No hay pantalla de edición: se cambia el repositorio
y el servidor lo recoge en la siguiente pasada.

Conviene que esto esté claro antes del evento, porque el momento en que más se
va a querer cambiar algo —una hora del programa, un nombre mal escrito— es la
semana de antes. Si para entonces no hay nadie contratado, no se podrá.

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
| Un cambio del repositorio no aparece en la web | `deploy.txt`. Si dice que no encuentra el repositorio o que falla el `git pull`, es que el repositorio ya no está accesible: ver «Lo que esta decisión implica» |
| La web no carga | Panel del hosting → *Logs*, y *Herramienta de Diagnóstico* |
| Se publicó algo por error | El historial del repositorio tiene todas las versiones. Se revierte ahí y el despliegue lo baja solo |

Y la copia de seguridad: panel → **Backups**, y las copias programadas de la
base de datos si algún día se usa una.
