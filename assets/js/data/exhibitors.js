/* =============================================================================
   EXHIBITORS
   -----------------------------------------------------------------------------
   GENERADO — no editar a mano.

   Vacío a propósito. Los expositores de la edición 2026 llegan desde Meetmaps
   según se van registrando las empresas: server/sync.php consulta la
   plataforma, escribe este archivo, descarga los logotipos y genera una página
   por empresa en exhibitors/.

   Los 39 que había antes eran los de la web anterior y se retiraron el
   2026-09-17 para no publicar una lista que no corresponde a esta edición.

   Lo que la plataforma no trae —la categoría, la persona de contacto, la
   dirección postal— sale de exhibitors-local.json, que sí se edita a mano y que
   el sync respeta.
   ========================================================================== */

window.MBB = window.MBB || {};

/* Categories as on the original site */
// Las etiquetas son, palabra por palabra, las tres respuestas de la pregunta
// «What kind of company are you?» del formulario de inscripción. Quien se
// inscribe elige una y se reconoce después en el filtro de la web: si aquí
// pusiera otra cosa, tendría que traducir mentalmente entre las dos.
//
// Los `id` son internos y no se tocan: los usa el sync para clasificar y las
// direcciones para filtrar. Cambiar una etiqueta es seguro; cambiar un id
// obliga a cambiarlo también en config.php del servidor.
window.MBB.exhibitorCategories = [
  { id: 'all',           label: 'All' },
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'dmc',           label: 'Basque DMC' },
  { id: 'activities',    label: 'Boutique Experience in Bilbao Bizkaia' }
];

window.MBB.exhibitors = [];
