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
mantenerla: los scripts que regeneran las páginas de expositor, el plugin de
WordPress, la sincronización con Meetmaps y el historial de por qué cada cosa
está como está.

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

Si se llega a configurar el despliegue por FTP desde GitHub
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), las
credenciales del FTP se guardan en los *Secrets* del repositorio.

**Esos secretos tienen que vivir en el repositorio de la organización, no en el
personal.** Si se configuran antes de la transferencia, hay que volver a
crearlos después: los secretos no viajan con el repositorio.

Conviene además que el FTP que se use ahí sea **un usuario creado para esto**,
no el usuario principal de la cuenta. Así se puede revocar sin tocar nada más.

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

**⟨pendiente de la decisión entre WordPress y el panel estático⟩**

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
3. Decidir cómo se va a mantener la web (WordPress o panel estático).
4. Dejarla funcionando de esa forma y con gente de la entidad entrando.
5. Transferir el repositorio.
6. Recrear los secretos de publicación, si procede.
7. Entregar las contraseñas.
8. Completar la sección 5 de este documento.
9. Comprobar, con la persona que se va todavía disponible, que alguien de
   Bilbao Ekintza hace un cambio de principio a fin sin ayuda.

El paso 9 es el que de verdad cierra el traspaso. Los ocho anteriores son
preparativos.
