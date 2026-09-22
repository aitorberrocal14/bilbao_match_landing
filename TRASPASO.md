# Traspaso de la web a Bilbao Ekintza

Este documento existe por una razón concreta: la web se ha desarrollado desde
una cuenta personal de GitHub, durante un contrato que termina, y tiene que
poder seguir funcionando y editándose después, por personas que no manejan
estas herramientas.

Lo que sigue es el inventario de todo lo que hay que poner a nombre de la
entidad, en el orden en que conviene hacerlo. **Nada de esto es técnico**: son
titularidades, correos de contacto y contraseñas. La parte técnica se documenta
aparte, en [`README.md`](README.md) y [`admin/README.md`](admin/README.md).

> Las casillas marcadas con `[ ]` están pendientes de comprobar o de hacer.
> Las líneas con **⟨por confirmar⟩** son datos que no constan y hay que
> averiguar.

---

## 1. Antes de nada: comprobar a nombre de quién está cada cosa

Lo primero no es mover nada, es mirar. Estas cuatro comprobaciones se pueden
hacer en una mañana y determinan el resto del traspaso.

| Qué | Dónde se mira | Estado |
|---|---|---|
| **Dominio** `matchbilbaobizkaia.eus` | Panel del registrador: titular y contacto administrativo | **⟨por confirmar⟩** |
| **Hosting** `paneles.gestiondecuenta.com` | Datos de facturación y correo de contacto de la cuenta | **⟨por confirmar⟩** |
| **Cuenta de Meetmaps** | Quién figura como titular y quién recibe las facturas | **⟨por confirmar⟩** |
| **Buzón** `welcome@matchbilbaobizkaia.eus` | Quién lo administra y quién lo lee | **⟨por confirmar⟩** |

Si en alguna de las cuatro aparece un correo personal en lugar de uno
institucional de Bilbao Ekintza, **eso se cambia antes de terminar el
contrato**, no después. Un cambio de titularidad con la persona todavía
disponible es un trámite; el mismo cambio seis meses después, sin ella, puede
ser semanas de gestiones o directamente perder el dominio.

- [ ] Dominio a nombre de Bilbao Ekintza, con contacto institucional
- [ ] Hosting a nombre de Bilbao Ekintza, con contacto institucional
- [ ] Meetmaps a nombre de Bilbao Ekintza
- [ ] El buzón `welcome@` lo lee más de una persona de la entidad

---

## 2. El código fuente

Ahora mismo está en **`github.com/aitorberrocal14/bilbao_match_landing`**, una
cuenta personal. Ahí está no solo la web publicada, sino todo lo que permite
mantenerla: los scripts que regeneran las páginas de expositor, los dos que el
servidor ejecuta solo —el que publica y el que sincroniza con Meetmaps— y el
historial de por qué cada cosa está como está.

Hay dos salidas, según lo que Bilbao Ekintza quiera asumir:

**A. Transferir el repositorio** a una organización de GitHub de Bilbao
Ekintza. GitHub tiene una función de transferencia que conserva el historial,
las ramas y todo lo demás; la cuenta personal deja de tener nada que ver. Si la
entidad no tiene organización en GitHub, crearla es gratuito.

**B. Entregar un archivo completo** — una copia comprimida del proyecto entero,
con su documentación, guardada donde Bilbao Ekintza archive esta clase de
material. Vale si la entidad prefiere no depender de GitHub, pero se pierde el
historial y la posibilidad de que otra persona siga trabajando cómodamente.

La opción A es mejor. La B es aceptable. Lo que no es aceptable es dejarlo
donde está.

- [ ] Decidido A o B
- [ ] Ejecutado
- [ ] La cuenta personal ya no es necesaria para nada

---

## 3. La publicación automática

La publicación la hace **el propio servidor**, con dos tareas programadas que
llaman a `server/deploy.php` y a `server/sync.php`. No hay credenciales de FTP
en ninguna parte, ni nada que configurar en GitHub.

Hubo un camino anterior que publicaba por FTP desde GitHub Actions, y se ha
retirado. No por gusto: fallaba en cada push —más de ciento veinte ejecuciones
en rojo— y, peor, si alguien le hubiera puesto las credenciales habría subido
la lista de expositores VACÍA del repositorio encima de la que escribe la
plataforma. Dos sistemas publicando en la misma carpeta es el fallo que ya
tuvimos una vez, y no conviene dejarlo armado esperando.

Si algún día se guardaron secretos `FTP_*` o `MBB_API_KEY` en el repositorio,
**hay que borrarlos**: ya no se usan, y una credencial olvidada en un sitio que
nadie mira es una credencial filtrada esperando su turno.

- [ ] Usuario de FTP específico para la publicación
- [ ] Secretos creados en el repositorio de la organización
- [ ] Comprobado que una publicación funciona desde ahí

---

## 4. Las contraseñas de administración

Ninguna debería llamarse como una persona ni ser compartida por todos.

| Qué | Quién debe tenerla |
|---|---|
| Panel del hosting | Al menos dos personas de Bilbao Ekintza |
| FTP | Quien mantenga la web, más una copia en el gestor de contraseñas de la entidad |
| Panel de edición de la web (`/admin/`) | Las personas que editen contenido |
| Meetmaps | Quien gestione el evento |

**No compartáis una sola cuenta del panel.** El hosting tiene una sección
**Panel de acceso → Acceso independiente**, que permite dar acceso a personas
concretas sin repartir la contraseña principal. Eso es lo que hay que usar:

- Cada persona entra con lo suyo, y se le quita el acceso el día que cambia de
  puesto sin tener que cambiar la contraseña a todos los demás.
- Queda registro de quién hizo qué, que es justo lo que falta cuando algo se
  rompe y nadie sabe por qué.
- La cuenta principal queda para una o dos personas responsables, y no se usa a
  diario.

Hacerlo **antes** de que termine el contrato, no después: crear accesos requiere
estar dentro.

Si Bilbao Ekintza tiene gestor de contraseñas corporativo, ahí es donde van
todas. Si no, un sobre cerrado con el responsable del área es mejor que un
correo o un documento suelto.

- [ ] Todas las contraseñas en manos de la entidad, no de una persona
- [ ] Ninguna contraseña personal reutilizada en un sistema de la web

---

## 5. Quién edita la web a partir de ahora

Esto depende de la decisión pendiente entre las dos formas de mantener la web.
Sea cual sea, **el criterio es el mismo**: quien venga después tiene que poder
entrar, cambiar un texto y publicarlo sin llamar a nadie.

Cuando esté decidido, esta sección recoge:

- la dirección por la que se entra a editar,
- quién tiene acceso,
- qué se puede cambiar desde ahí y qué no,
- y qué hacer cuando algo no se puede cambiar desde ahí.

El panel de edición vive en `tu-web/admin/`. Se entra con la contraseña que
está en el punto 5, se edita en formularios y se publica; no hace falta tocar
GitHub ni conocerlo. Lo que se edita desde ahí son los textos, el programa, los
folletos y los datos de contacto. Lo que **no** se edita desde ahí son los
expositores: esos los escribe solo el servidor desde Meetmaps, y lo que se
cambie en la plataforma aparece en la web en la siguiente vuelta.

---

## 6. Lo que no se traspasa, y conviene saberlo

- **Los folletos de Issuu** están publicados en el perfil `issuu.com/turismobilbao`,
  que es de Bilbao Turismo y no forma parte de esta web. La web solo enlaza.
- **Los logotipos de los expositores** los aportaron las propias empresas. Si
  alguna se da de baja, su logotipo se retira.
- **Las fotografías del destino** proceden del archivo de promoción. Quien
  mantenga la web debería saber de dónde salen para poder pedir más.

---

## 7. El orden recomendado

1. Comprobar las cuatro titularidades del punto 1.
2. Corregir las que estén a nombre personal. *Esto es lo más lento porque
   depende de terceros: empezar por aquí.*
3. Dejar el panel de edición funcionando y con gente de la entidad entrando.
4. Transferir el repositorio.
5. Recrear los secretos de publicación, si procede.
6. Entregar las contraseñas.
7. Completar la sección 5 de este documento.
9. Comprobar, con la persona que se va todavía disponible, que alguien de
   Bilbao Ekintza hace un cambio de principio a fin sin ayuda.

El paso 9 es el que de verdad cierra el traspaso. Los ocho anteriores son
preparativos.
