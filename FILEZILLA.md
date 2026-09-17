# Subir la web con FileZilla, paso a paso

Guía sin nada por sabido. Cada punto es una sola acción.

FileZilla es un programa gratuito para copiar archivos de tu ordenador al
servidor. Hace lo que el explorador del panel no sabe hacer: **subir carpetas
enteras con todo lo que llevan dentro**, crear los directorios solo, y continuar
si la conexión se corta.

**Tiempo:** unos 20 minutos la primera vez, de los cuales 10 son esperar.

---

## Antes de empezar

Necesitas dos cosas:

**1. El archivo de la web.** Uno de estos dos, según lo que vayas a hacer:

| Archivo | Para qué | Dónde va |
|---|---|---|
| `web-de-prueba.zip` | Probar sin que Google la vea | `www/pruebas/` |
| `web-para-subir.zip` | La web definitiva | `www/` |

Si es tu primera vez, empieza por el de pruebas. No puedes estropear nada.

**2. Los datos de FTP.** Entra en el panel del hosting y busca **Configuración
del FTP**. Apunta:

- **Servidor** (algo como `ftp.matchbilbaobizkaia.eus` o una serie de números)
- **Usuario**
- **Contraseña**

---

## Paso 1 · Instalar FileZilla

1. Abre el navegador y ve a **https://filezilla-project.org**
2. Pincha en **Download FileZilla Client**. *Client*, no *Server* — el Server
   es otra cosa y no te sirve.
3. La página ofrece varias versiones en columnas. Coge la de la izquierda, la
   gratuita. **No hace falta pagar nada.**
4. Descarga, abre el archivo descargado e instala dándole a *Siguiente*.
5. Durante la instalación **puede ofrecerte instalar otros programas** —
   navegadores, antivirus, barras de herramientas. **Rechaza todo.** Busca la
   opción de *Decline*, *Rechazar* o *Instalación personalizada* y desmarca lo
   que no sea FileZilla.
6. Termina y abre FileZilla.

---

## Paso 2 · Entender lo que ves

La ventana está partida. Con esto basta:

```
┌───────────────────────────────────────────────────┐
│  Barra de arriba: mensajes del servidor           │
├────────────────────────┬──────────────────────────┤
│                        │                          │
│   TU ORDENADOR         │   EL SERVIDOR            │
│   "Sitio local"        │   "Sitio remoto"         │
│   (izquierda)          │   (derecha)              │
│                        │                          │
├────────────────────────┴──────────────────────────┤
│  Abajo: la cola de archivos pendientes de subir   │
└───────────────────────────────────────────────────┘
```

**Izquierda = tu ordenador. Derecha = la web.** Subir es arrastrar de izquierda
a derecha. Ya está, no hay más.

---

## Paso 3 · Guardar la conexión

Se hace una vez y queda guardada para siempre.

1. Menú **Archivo** → **Gestor de sitios…**
2. Botón **Nuevo sitio**
3. Ponle de nombre `Match Bilbao Bizkaia` y pulsa Intro
4. A la derecha, rellena:

| Campo | Qué poner |
|---|---|
| **Protocolo** | `FTP - Protocolo de transferencia de archivos` |
| **Servidor** | El que apuntaste del panel |
| **Puerto** | Déjalo vacío |
| **Cifrado** | `Requiere FTP explícito sobre TLS` |
| **Modo de acceso** | `Normal` |
| **Usuario** | El que apuntaste |
| **Contraseña** | La que apuntaste |

5. Pulsa **Conectar**

**Si da error de cifrado**, vuelve al Gestor de sitios y cambia *Cifrado* a
`Usar FTP simple` o `Conexión FTP no segura`. No es lo ideal, pero algunos
hostings antiguos no admiten otra cosa.

**Si sale un aviso de certificado**, marca *Confiar siempre en este
certificado* y acepta.

Cuando conecte, el panel de la derecha se llenará de carpetas. Ya estás dentro.

---

## Paso 4 · Encontrar la carpeta de la web

En el panel **derecho** verás las carpetas de tu cuenta: `Maildir`, `logs`,
`ftp`, `www`…

1. **Haz doble clic en `www`.** Es la única que se publica en internet.
2. Mira qué hay dentro:
   - Si ves archivos de una web antigua → sigue al paso 5.
   - Si ves **una carpeta con el nombre del dominio** (`matchbilbaobizkaia.eus`)
     → entra también en ella. La web va ahí dentro, no en `www` directamente.
   - Si está vacía → perfecto, sigue.

3. Menú **Servidor** → **Forzar mostrar archivos ocultos**. Aparecerán los
   archivos que empiezan por punto.
4. Si ves un **`.htaccess`**, arrástralo al panel izquierdo para guardarte una
   copia antes de tocar nada. Puede llevar configuración del correo.

---

## Paso 5 · Preparar los archivos en tu ordenador

1. Busca el ZIP que descargaste.
2. **Botón derecho → Extraer todo** (Windows) o doble clic (Mac).
3. Se creará una carpeta. **Ábrela.** Tienes que ver esto:

```
index.html     robots.txt     assets/     exhibitors/     admin/
```

El paquete definitivo lleva además un `sitemap.xml`. El de pruebas no, y es
correcto: ese archivo sirve para que Google recorra la web, y la copia de
pruebas no debe salir en Google.

**Importante:** si al abrirla solo ves *otra carpeta* dentro, entra en esa. Lo
que necesitas es la carpeta donde está `index.html` a la vista.

---

## Paso 6 · Subirlo

1. En el panel **izquierdo** de FileZilla, navega hasta esa carpeta. Se hace
   igual que en el explorador de Windows: doble clic para entrar, y `..` arriba
   del todo para retroceder.
2. Cuando en el panel izquierdo veas `index.html`, `assets`, `exhibitors`…
   **selecciónalo todo**: pincha en el primero y pulsa `Ctrl + A` (`Cmd + A` en
   Mac).

   > Si vas a la carpeta de pruebas: primero, en el panel derecho, botón derecho
   > → **Crear directorio** → `pruebas`, y entra en ella con doble clic. Luego
   > sigue igual.

3. **Arrastra la selección al panel derecho** y suéltala.
4. Abajo verás cómo se van sumando archivos a la cola y bajando. **No cierres
   FileZilla.** Tarda unos minutos: son 135 archivos y 4 MB.
5. Si pregunta **"El archivo ya existe"**, elige **Sobrescribir** y marca
   **Aplicar siempre esta acción** y **Aplicar solo a la cola actual**.

---

## Paso 7 · Comprobar que ha subido todo

Esto es importante: FileZilla puede fallar algún archivo sin avisar a gritos.

1. Mira la parte de abajo. Hay tres pestañas: **Archivos en cola**,
   **Transferencias fallidas** y **Transferencias satisfactorias**.
2. **"Archivos en cola" tiene que estar vacía.**
3. **"Transferencias fallidas" tiene que estar vacía.** Si hay algo: botón
   derecho sobre ellos → **Restablecer y poner los archivos fallidos de nuevo en
   la cola**. Se reintentan solos.
4. En el panel derecho tienes que ver ahora `index.html`, `robots.txt`,
   `assets`, `exhibitors` y `admin` — más `sitemap.xml` si has subido el
   paquete definitivo.

---

## Paso 8 · Mirar la web

Abre el navegador y ve a:

- `matchbilbaobizkaia.eus/pruebas/` si has hecho la de pruebas
- `matchbilbaobizkaia.eus` si has subido la definitiva

Repasa:

- [ ] Carga la portada con la foto grande
- [ ] El programa muestra **5 días** y las pestañas cambian
- [ ] Salen **39 logotipos** de expositores
- [ ] Al pinchar un logotipo se abre su ficha, **sin error 404**
- [ ] Salen **16 folletos** y uno abre el lector
- [ ] En el **móvil** también funciona

**Los botones de Login no aparecen, y es correcto.** Están ocultos hasta que se
configure la dirección de la plataforma.

---

## Si algo va mal

| Qué ves | Qué pasa |
|---|---|
| **No conecta** | Revisa servidor, usuario y contraseña. Prueba a cambiar *Cifrado* a `Usar FTP simple` |
| **Conecta pero el panel derecho está vacío** | Menú **Transferencia** → **Modo de transferencia** → **Pasivo** |
| **"550 Permission denied"** | La carpeta `www` no tiene permisos. Arréglalos en el panel del hosting, o abre un ticket |
| **La web sale en blanco** | Falta `index.html`, o está dentro de una subcarpeta. Tiene que estar suelto en `www` |
| **Sale la web pero sin colores ni tipografías** | No subió la carpeta `assets` entera. Súbela otra vez sola |
| **Las fichas de expositor dan 404** | No subió la carpeta `exhibitors`. Igual |
| **Se corta a mitad** | Normal en conexiones lentas. Pestaña *Transferencias fallidas* → botón derecho → reintentar |

---

## Cuando la de pruebas esté bien

1. Sube `web-para-subir.zip` — el definitivo, **no el de pruebas** — a `www`
   directamente, repitiendo los pasos 5 y 6.
2. **Borra la carpeta `pruebas`**: botón derecho sobre ella en el panel derecho
   → *Eliminar*.
3. Cierra el panel de edición: panel del hosting → **Protección de
   directorios** → carpeta `admin` → usuario y contraseña.

No uses el paquete de pruebas como web definitiva: lleva una marca que le dice
a Google que no la muestre, y no aparecería nunca en las búsquedas. Son dos
archivos distintos a propósito.
