<?php
/**
 * EL TURNO: QUE DEPLOY Y SYNC NO SE PISEN
 * -----------------------------------------------------------------------------
 * Los dos escriben en la misma carpeta pública y hay uno que depende del otro:
 *
 *   · deploy.php copia lo que hay en el repositorio, y en el repositorio la
 *     lista de expositores está VACÍA a propósito.
 *   · sync.php la rellena desde Meetmaps.
 *
 * Por eso el orden es siempre deploy primero, sync después. Si se solapan —dos
 * tareas programadas puestas en el mismo minuto, o una que tarda más de la
 * cuenta— puede pasar que el sync escriba la lista y el deploy la sobrescriba
 * con la vacía un segundo más tarde. La web se queda sin expositores hasta la
 * vuelta siguiente, y en el registro no aparece nada raro.
 *
 * Con esto no puede pasar: solo uno de los dos trabaja a la vez. El que llega y
 * encuentra al otro dentro espera un poco, y si el otro sigue ocupado se va sin
 * hacer nada y lo dice en su registro. No pierde el viaje: el cron vuelve a
 * llamarle enseguida.
 *
 * El candado es un archivo vacío en la carpeta de la cuenta. Si se borra no pasa
 * nada, se vuelve a crear solo.
 */

/**
 * Coge el turno. Devuelve una de tres cosas, y hay que mirar cuál:
 *
 *   · un manejador de archivo → turno cogido, adelante. Hay que guardarlo en
 *     una variable que viva hasta el final del script: cuando PHP la suelta, el
 *     candado se abre solo.
 *   · true  → no se ha podido crear el candado, pero se sigue igualmente.
 *   · false → el otro está trabajando. NO se sigue: hay que salir.
 *
 * @param string   $quien   'deploy' o 'sync', solo para el mensaje.
 * @param callable $avisar  Función con la que escribir en el registro.
 * @param int      $espera  Segundos que se espera al otro antes de rendirse.
 * @return resource|bool
 */
function mbb_coger_turno($quien, $avisar, $espera = 90)
{
    $archivo = dirname(__DIR__) . '/.turno';          // /home/<cuenta>/repo/.turno

    $f = @fopen($archivo, 'c');
    if ($f === false) {
        // Sin candado se sigue adelante: es mejor publicar con un riesgo pequeño
        // que no publicar nunca porque la carpeta no deja escribir.
        call_user_func($avisar, 'Aviso: no se ha podido usar ' . $archivo . '. Se sigue sin turno.');
        return true;
    }

    $limite = time() + $espera;
    while (!flock($f, LOCK_EX | LOCK_NB)) {
        if (time() >= $limite) {
            call_user_func(
                $avisar,
                'El otro proceso sigue trabajando después de ' . $espera . ' segundos. ' .
                $quien . ' se retira sin tocar nada; volverá en la siguiente vuelta del cron.'
            );
            fclose($f);
            return false;
        }
        sleep(2);
    }

    return $f;
}

/** Suelta el turno. Le da igual lo que le pasen. */
function mbb_soltar_turno($f)
{
    if (is_resource($f)) {
        flock($f, LOCK_UN);
        fclose($f);
    }
}
