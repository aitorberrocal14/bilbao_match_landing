# Pasar la web a WordPress

Qué haría falta para que esta web dejara de ser código y pasara a ser una
página gestionable desde WordPress.

Este documento no vende la idea ni la desaconseja: pone encima de la mesa lo
que cuesta cada parte, porque hay tres piezas baratas y una cara, y la cara no
es la que parece.

---

## La pregunta de debajo

Antes de los pasos conviene decir qué problema se está intentando resolver,
porque de eso depende si la respuesta es WordPress o es otra cosa.

El problema es este: **hoy, para cambiar una coma, hace falta un programador.**
No hay pantalla de edición. Un texto, una fecha, un folleto nuevo: todo pasa
por quien tenga acceso al repositorio.

WordPress resuelve eso. Pero lo resuelve **para una parte de la web, no para
toda**, y conviene saber para cuál antes de empezar.

---

## Lo que hay hoy, en cuatro piezas

| Pieza | Qué es | Quién la mantiene hoy |
|---|---|---|
| **Las páginas** | Portada con nueve secciones y cuatro páginas legales | Un programador |
| **El programa** | Cinco días, dos itinerarios el miércoles, y su descarga al calendario | Un programador |
| **Los expositores** | Las fichas de las empresas, traídas solas desde Meetmaps cada noche | **Nadie: se mantiene solo** |
| **Los textos legales** | Privacidad, cookies, aviso legal, accesibilidad | Una abogada, y un programador que lo escriba |

Esa tercera fila es la clave de todo lo que viene después.

---

## Pieza 1 · Las páginas — fácil

Es la parte que WordPress hace bien y para la que existe.

La portada son nueve secciones (cabecera, portada, ediciones anteriores,
Bilbao Bizkaia, programa, expertos, descubre, contacto, pie) más cuatro
páginas legales y la de acceso a la plataforma. Todo eso son páginas normales.

**Lo que hay que hacer:**

- Montar el diseño: el rojo de la casa (`#ae0000`), la tipografía Bariol de
  los titulares y Roboto del texto, la rejilla, los botones. O con un tema a
  medida, o con un constructor tipo Elementor.
- Pasar los textos y las fotos (2,8 MB de imágenes).
- Rehacer los detalles que hoy están cuidados a mano: las flechas que encadenan
  una sección con la siguiente, el menú que se pliega a 1275 px, el vídeo que
  solo se carga cuando lo pides.

**Lo que se gana:** a partir de aquí, cambiar un texto, una foto o un folleto
lo hace cualquiera desde el navegador. Que es justo el motivo de todo esto.

**Esfuerzo:** días, no semanas. Es trabajo de verdad, pero es trabajo conocido.

---

## Pieza 2 · El programa — medio

Esto ya no es una página: es una estructura de datos con cinco días, unas
ochenta entradas, horas de inicio y de fin, lugares, etiquetas, entradas
destacadas, y **dos itinerarios en paralelo el miércoles** (Ura y Lurra) con su
selector. Además se enseña de dos maneras —resumen y día a día— y **se descarga
al calendario**: 57 citas en un archivo `.ics`, por día, por grupo o entero.

En WordPress eso no se configura: se programa. Normalmente con un tipo de
contenido propio más campos repetibles (ACF Pro, que es de pago), plantillas a
medida para las dos vistas, y código propio para la descarga al calendario.

**Y aquí está la trampa:** después de pagar ese desarrollo, **cambiar una hora
sigue siendo cosa de quien sepa**, salvo que se construyan también los
formularios de edición. Se puede hacer. Pero es más trabajo, y es el trabajo
que nadie presupuesta porque desde fuera «el programa» parece una página más.

**Esfuerzo:** de una a dos semanas si se quiere con todo, incluida la descarga
al calendario.

---

## Pieza 3 · Los expositores — **la cara, y la que importa**

Esta es la pieza que decide si la mudanza sale bien o sale mal.

Hoy funciona así, sola, cada noche: se llama a la API de Meetmaps, se quedan
**solo** las empresas que cumplen la regla de expositor, se descarga el
logotipo de cada una, **se comprueba que el archivo es de verdad una imagen**
—hubo tres empresas que subieron un PDF—, se genera una ficha por empresa, la
rejilla con sus filtros y su buscador, los «ver más expositores» y el mapa del
sitio.

Son **1.766 líneas** de código, y no son 1.766 líneas de adorno. Dentro están:

- **La regla de quién se publica.** La API devuelve a todo el mundo:
  expositores, compradores internacionales y prensa. **Publicar a un comprador
  o a un periodista sería una brecha de datos personales.** Esa regla no es una
  preferencia de diseño: es lo que separa una web correcta de una denuncia.
- **La guardia de encogimiento.** Si la plataforma contesta con media lista por
  un fallo de red, el sync se para y avisa en vez de borrar expositores.
- **El filtro de logotipos.** Lo que no es una imagen no se publica, y queda
  dicho en el registro con el nombre de la empresa.

En WordPress esto se rehace como un **plugin a medida**: tarea programada,
tipo de contenido propio, importación a la biblioteca de medios, y las mismas
tres salvaguardas. No hay plugin de tienda que haga esto, porque es específico
de Meetmaps y de la regla de este evento.

**Esfuerzo:** parecido al que costó la primera vez, pero escrito otra vez.

**Y el riesgo:** si esa regla se traduce mal, la web publica datos de personas
que no han dado permiso para aparecer. Es el único punto de toda la mudanza
donde un error no se ve en pantalla y además es un problema legal.

> Si se hace la mudanza, esta pieza se prueba **con datos reales y mirando la
> lista empresa por empresa** antes de publicar nada. No basta con que «se vean
> expositores».

---

## Pieza 4 · Los textos legales — barato en horas, caro en descuidos

Hoy la web tiene una propiedad que casi ninguna tiene, y está escrita en sus
páginas legales:

> **No pone ni una cookie, y no contacta con nadie para dibujarse.**

Ni Google Fonts, ni analítica, ni píxeles. Las letras se sirven desde el propio
servidor. Por eso no hay banner de cookies: no hace falta, y eso se dice en la
política de cookies y en el aviso legal.

**Un WordPress corriente rompe eso casi seguro.** Un tema que pide tipografías
a Google, un constructor que carga librerías de fuera, cualquier plugin de
estadísticas: cada uno de ellos convierte en falsa una frase que hoy es cierta
en dos páginas legales.

**Si pasa eso, hay que:**

1. Rehacer la política de cookies y el aviso legal.
2. Poner un banner de consentimiento de verdad, con rechazo tan fácil como la
   aceptación.
3. Volver a pasarlo por la abogada.

No es caro de hacer. Es caro de **olvidar**, porque nadie se da cuenta hasta
que llega una reclamación.

> **Además, siguen pendientes ocho datos** que la abogada marcó y que la
> organización no ha dado todavía (están listados en las propias páginas y los
> recoge la suite de pruebas). Esos viajan igual, se mude la web o no.

---

## Los pasos, en orden

### Antes de tocar nada

1. **Preguntar al hosting qué versión de PHP ofrece.** Hoy la web va con PHP
   7.4, y **PHP 7.4 dejó de recibir parches de seguridad en 2022**. WordPress
   funciona, pero muchos plugins ya piden PHP 8. Si el alojamiento no da PHP 8,
   eso se arregla **antes** y no después.
2. **Apuntar todas las direcciones actuales.** Las fichas viven en
   `exhibitors/<empresa>.html`; WordPress usaría `/exhibitors/<empresa>/`.
   Cambian todas. Hay que dejar preparadas las redirecciones 301 o se pierde
   lo poco o mucho que Google haya indexado.
3. **Decidir qué se va a poder editar sin programador**, y escribirlo. Si no se
   escribe antes, se descubre al final, que es cuando ya no hay presupuesto.

### El montaje

4. **WordPress en una carpeta aparte**, no encima de la web buena. La actual
   sigue publicada y funcionando mientras se construye la nueva.
5. **El diseño y las páginas** (pieza 1).
6. **El programa** (pieza 2), con su descarga al calendario si se quiere
   conservar.
7. **El plugin de expositores** (pieza 3). Lo último, porque es lo más largo y
   lo que más hay que probar.
8. **Copias de seguridad automáticas.** Esto es nuevo: una web de archivos no
   se corrompe sola, una con base de datos sí.

### Las pruebas, antes de publicar

9. **La lista de expositores, empresa por empresa**, contra lo que dice
   Meetmaps. Que no sobre nadie es más importante que que no falte nadie.
10. **Qué pide la web al cargarse**, con las herramientas del navegador. Si
    aparece algún dominio de fuera, o hay que quitarlo, o hay que rehacer los
    textos legales y poner banner.
11. **Que se vea bien en móvil**, que es donde se consulta un programa.
12. **Que las páginas legales siguen diciendo la verdad** después de todo lo
    anterior.

### El cambio

13. Apuntar el dominio a la instalación nueva.
14. Activar las redirecciones de las direcciones viejas.
15. **Quitar la tarea del sync antiguo.** Si se quedan las dos, dos programas
    distintos escriben expositores en el mismo sitio.
16. Dejar por escrito quién actualiza WordPress y cada cuánto.

---

## Lo que se gana y lo que se pierde

**Se gana:** que una persona de Bilbao Ekintza cambie textos, fotos, folletos y
fechas desde el navegador, sin llamar a nadie. Eso era el objetivo desde el
principio.

**Se pierde:**

- **El mantenimiento cero.** WordPress hay que actualizarlo —núcleo, plugins,
  tema— y quien no lo actualiza acaba con la web comprometida. No es una
  posibilidad remota: es la causa número uno de webs hackeadas.
- **La velocidad.** Hoy son archivos estáticos: no hay base de datos que
  consultar. WordPress siempre será más lento, aunque con caché se note poco.
- **La tranquilidad legal de no tener cookies**, salvo que se cuide
  expresamente.
- **Código que ya está escrito y probado.** El sync, el programa con su
  descarga al calendario y las tres suites de pruebas suman cerca de cinco mil
  líneas. Habría que escribirlas otra vez, y volver a equivocarse en las mismas
  cosas: el PDF disfrazado de logotipo, la lista que llega a medias, el
  esquema `javascript:` en la web de una empresa. Cada una de esas se descubrió
  con la web ya publicada.

---

## Lo que yo pondría sobre la mesa antes de decidir

**La mudanza entera cuesta dinero para que lo editable sean las piezas 1 y 4.**
Las dos caras —el programa y los expositores— seguirían necesitando un
programador, antes y después.

Así que hay tres caminos, no uno:

### A. Mudarse a WordPress

Lo descrito aquí. Tiene sentido si Bilbao Ekintza va a **tocar la web a
menudo** —varias veces al mes— y quiere independencia real para los textos.

### B. Publicar el panel que ya está hecho

**Y esto conviene saberlo:** en este mismo repositorio, sin publicar, hay un
panel de edición terminado (`admin/`). Se descartó en septiembre de 2026
porque se decidió que los cambios los haría un programador.

Edita exactamente las mismas piezas que WordPress dejaría editar —los textos,
el programa, los folletos, los expositores escritos a mano— desde el navegador
y con contraseña. **Está escrito y probado.**

Tiene una condición, que está documentada en
[`CIERRE-DEL-TRASPASO.md`](CIERRE-DEL-TRASPASO.md): el panel y el despliegue
automático **no pueden convivir**, porque los dos escriben los mismos cuatro
archivos. Hay que elegir uno. Hoy el despliegue ya está retirado, así que ese
conflicto ya no existe.

**Coste: unas horas.** Copiar la carpeta, poner contraseña y proteger el
directorio.

### C. Dejarlo como está y contratar horas

Si la web se toca dos o tres veces al año —que es lo normal en un evento
anual—, unas horas de programador al año salen más baratas que una mudanza más
el mantenimiento de WordPress.

---

## En una línea

Si el objetivo es **no depender de nadie para editar**, el camino más corto y
más barato no es WordPress: es **publicar el panel que ya existe** (camino B), y
dejar WordPress para el día en que la web crezca de verdad y haga falta algo
que hoy no hace.

Si aun así se decide WordPress, el orden de los pasos está arriba, y lo único
que no admite prisa es la pieza 3: **la regla de quién se publica y quién no.**
