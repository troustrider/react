# Arquitectura final — Práctica 4

## Resumen del proyecto

Este documento cubre las decisiones de diseño y las herramientas de TypeScript que he utilizado a lo largo de los tres módulos de la práctica. El objetivo es explicar cómo el uso de tipos estrictos, genéricos, uniones discriminadas y utility types reduce los errores en runtime comparado con JavaScript estándar.

## Módulo 1: Lógica pura con tipos estrictos

El primer módulo es un conjunto de funciones estadísticas (`calcularMedia`, `calcularMediana`, `filtrarAtipicos`) tipadas con `strict: true`.

Lo que más me sirvió aquí fue el tipo de retorno `number | null`. En JavaScript puro, si pasas un array vacío a una función que calcula la media, obtienes `NaN` (porque divides `0 / 0`) y el programa sigue como si nada — `NaN` es técnicamente un `number`, así que nada se queja. Con TypeScript, al declarar que la función devuelve `number | null`, quien la use está **obligado** a comprobar si el resultado es `null` antes de operar con él. El compilador no te deja multiplicar un `null` por dos. Es un error que en JS descubres en producción y en TS descubres mientras escribes.

También aprendí que `[...array].sort()` es mejor que `array.sort()` porque `.sort()` muta el array original. Crear una copia con spread antes de ordenar es una buena práctica para evitar efectos secundarios.

## Módulo 2: Modelado de datos y genéricos

### Interfaces vs type

Usé `interface` para las entidades del dominio (`Estudiante`, `Asignatura`) porque representan la forma de un objeto — tienen propiedades fijas con tipos concretos, y las interfaces están pensadas para eso. En cambio, usé `type` para `EstadoMatricula` porque es una unión (`A | B | C`), y las uniones solo se pueden definir con `type`.

No es que uno sea mejor que el otro. Son herramientas distintas para cosas distintas.

### Uniones discriminadas

En vez de modelar la matrícula como una sola interfaz con propiedades opcionales, la separé en tres interfaces (`MatriculaActiva`, `MatriculaSuspendida`, `MatriculaFinalizada`) con una propiedad discriminante `tipo`. Esto hace que sea imposible construir un estado inválido: no puedes tener una matrícula activa con nota media ni una finalizada con asignaturas. TypeScript no te deja.

Dentro de un `switch` por `estado.tipo`, el compilador hace narrowing automático: en el `case "ACTIVA"` sabe que `estado.asignaturas` existe, en `"FINALIZADA"` sabe que `estado.notaMedia` existe. No necesitas casteos (`as`) ni comprobaciones manuales con `typeof`.

### Exhaustiveness check con never

En la función `generarReporte`, el bloque `default` asigna el valor a una variable `never`. Si en el futuro se añade un cuarto estado a la unión pero alguien se olvida de manejar el nuevo caso en el switch, TypeScript da error de compilación. En JS esto pasaría desapercibido hasta que el caso no manejado ocurriese en producción.

### Genéricos

La interfaz `RespuestaAPI<T>` usa un genérico para el campo `datos`. Cuando llamas a `obtenerRecurso<Estudiante>(...)`, TypeScript sustituye `T` por `Estudiante` en toda la estructura, así que `respuesta.datos.nombreCompleto` está protegido por el compilador. Si escribes mal el nombre de la propiedad, te avisa al instante.

La alternativa sería usar `any`, que también acepta cualquier tipo, pero la diferencia es que `any` desactiva el sistema de tipos para esa variable. Con genéricos mantienes la flexibilidad (reutilizas la misma interfaz para cualquier entidad) sin renunciar a la seguridad.

## Módulo 3: React con TypeScript

### Componente DataTable genérico

`DataTable<T extends { id: string }>` es un componente que renderiza una tabla para cualquier tipo de datos, siempre que tenga un `id` de tipo `string`. La restricción genérica (`extends { id: string }`) es necesaria porque el componente necesita una propiedad `id` para las keys de React y para la lógica de edición.

Las columnas se definen con `clave: keyof T`, que significa "cualquier nombre de propiedad de T". Así el compilador impide que definas una columna con una clave que no existe en la entidad. Si `T` es `Estudiante`, solo puedes usar `"id"`, `"nombreCompleto"`, `"email"`, `"fechaIngreso"` o `"carrera"`.

### Partial<T> para el estado de edición

El estado de edición usa `Partial<T> | null`. `Partial<T>` convierte todas las propiedades de T en opcionales, lo cual tiene sentido porque cuando el usuario está editando una fila, puede que aún no haya rellenado todos los campos. Sin `Partial`, TypeScript te obligaría a tener todas las propiedades definidas desde el primer momento, lo cual no es realista en un formulario.

En la versión final del componente, `Partial<T>` tiene un papel real: el estado `editando` se va actualizando campo a campo mientras el usuario escribe en los inputs, y al guardar se aplica sobre la fila original con `{ ...fila, ...editando }`. En JS no habría forma de saber que `editando` es un objeto parcial de `Estudiante` — podrías meter cualquier propiedad inventada sin que nada se queje.

### import type

Un detalle que tuve que resolver fue usar `import type { Estudiante }` en vez de `import { Estudiante }` en App.tsx. Esto es porque Vite en desarrollo sirve los archivos TypeScript directamente al navegador sin compilarlos del todo, y las interfaces/types no existen como valores en JavaScript. Con `import type`, le dices explícitamente a Vite que ese import es solo para tipos y que no busque un valor exportado en runtime.

### Librería externa: date-fns

Integré `date-fns` para calcular la diferencia en días entre dos fechas. La función `calcularDiferenciaDias` tiene tipos de entrada y salida explícitos (`Date, Date → number`). `date-fns` ya trae sus propios tipos incluidos, así que no necesité instalar un paquete `@types/` aparte.

## Bonus: Ampliaciones del DataTable

### Ordenación por columnas

Añadí ordenación interactiva por columnas. Al hacer clic en una cabecera, la tabla se ordena por esa columna. Si haces clic otra vez en la misma, invierte el orden.

La implementación requirió dos estados nuevos: `columnaOrden` (de tipo `keyof T | null`) para saber por qué columna se ordena, y `ascendente` (booleano) para la dirección. Antes de renderizar las filas, se hace una copia del array con `[...datos]` (para no mutar las props, que es un principio básico de React) y se ordena con `.sort()` comparando los valores de la columna seleccionada.

Lo interesante a nivel de tipos es que `columnaOrden` es `keyof T | null`, así que TypeScript garantiza que solo puedes ordenar por propiedades que realmente existen en la entidad. Las cabeceras muestran una flecha (▲/▼) al lado de la columna activa para dar feedback visual.

### Edición inline

También implementé edición real de los datos. Al hacer clic en "Editar", las celdas de esa fila se convierten en inputs de texto donde puedes modificar los valores. "Guardar" aplica los cambios y "Cancelar" los descarta.

Para esto los datos pasan a vivir en un estado local (`datosLocales`) en vez de usar directamente las props, porque en React las props son de solo lectura. La función `actualizarCampo` recibe `clave: keyof T` y el nuevo valor, y actualiza el estado `editando` campo a campo. Al guardar, se usa `.map()` sobre el array de datos para sustituir la fila editada manteniendo el resto intacto.

El componente también acepta una prop opcional `onGuardar` (callback) para que el padre pueda reaccionar a los cambios si lo necesita — por ejemplo, para enviar los datos actualizados a un servidor.

## Comparación con JavaScript

Si hubiese hecho este mismo proyecto en JavaScript estándar, estos son los errores que no habría detectado hasta runtime:

- Pasar un array vacío a `calcularMedia` y obtener `NaN` sin ningún aviso.
- Crear un objeto `Estudiante` al que le falta una propiedad o tiene una propiedad de más — JS no se queja.
- Definir un estado de matrícula con propiedades que no corresponden a ese estado (una matrícula activa con nota media, por ejemplo).
- Llamar a la API genérica y asumir que `datos` tiene ciertas propiedades sin ninguna garantía.
- Definir una columna del DataTable con un nombre de propiedad que no existe en la entidad.
- Olvidar manejar un nuevo caso en un switch — en JS el default se traga el error silenciosamente.

TypeScript no soluciona todos los problemas (no te protege de datos incorrectos que vengan de una API externa en runtime, por ejemplo), pero sí elimina toda una categoría de bugs que en JavaScript son muy comunes y muy silenciosos. La clave está en que los detectas mientras escribes, no cuando el usuario final se encuentra con un error.
