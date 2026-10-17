import { tool } from 'ai';
import { z } from 'zod';
import { tareaNueva } from './esquemas';
import { agregar, buscar } from './tareas';

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  Las herramientas del asistente.                              ║
   ║                                                               ║
   ║  Lo más importante de este archivo: el modelo NO ejecuta nada ║
   ║  de aquí. El modelo solo PIDE —te manda el nombre de la       ║
   ║  herramienta y los argumentos— y tu código decide si corre.   ║
   ║                                                               ║
   ║  El inputSchema no es decoración: el modelo lo lee para saber ║
   ║  qué mandarte, y el SDK lo usa para validar lo que mandó.     ║
   ╚═══════════════════════════════════════════════════════════════╝ */

export const herramientas = {
  buscarTareas: tool({
    description:
      'Busca tareas por título o por responsable. Úsala siempre antes de ' +
      'afirmar que algo existe o no existe.',
    inputSchema: z.object({
      texto: z
        .string()
        .describe('Qué buscar. Cadena vacía para traer todas.'),
    }),
    execute: async ({ texto }) => {
      const encontradas = buscar(texto);
      return {
        cuantas: encontradas.length,
        tareas: encontradas.map((t) => ({
          titulo: t.titulo,
          prioridad: t.prioridad,
          responsable: t.responsable,
          hecha: t.hecha,
        })),
      };
    },
  }),

  crearTarea: tool({
    description:
      'Crea una tarea nueva en la lista. Úsala cuando el usuario pida ' +
      'agregar, apuntar o recordar algo.',
    inputSchema: tareaNueva,
    execute: async (datos) => {
      const creada = agregar(datos, 'asistente');
      return { id: creada.id, titulo: creada.titulo };
    },

    // ╔═════════════════════════════════════════════════════════════╗
    // ║  HUECO 3a                                                   ║
    // ║                                                             ║
    // ║  Esta herramienta no tiene execute, así que el modelo la    ║
    // ║  puede pedir pero no pasa nada: la petición se queda en el  ║
    // ║  aire.                                                      ║
    // ║                                                             ║
    // ║  Escribe el execute. Recibe lo que el modelo mandó —ya      ║
    // ║  validado contra tareaNueva— y tiene que:                   ║
    // ║    1. guardarla con agregar(datos, 'asistente')             ║
    // ║    2. devolver algo que al modelo le sirva para contestar   ║
    // ║                                                             ║
    // ║  Lo que devuelvas vuelve al modelo como resultado y con eso ║
    // ║  redacta su respuesta. Devuelve el título y el id.          ║
    // ╚═════════════════════════════════════════════════════════════╝
  }),
};

/* Para cuando lo veas en producción: una herramienta que borra, cobra o
   manda correos lleva needsApproval, y entonces el usuario confirma antes
   de que corra:

     borrarTarea: tool({
       description: '…',
       inputSchema: z.object({ id: z.string() }),
       needsApproval: true,
       execute: async ({ id }) => { … },
     })

   La diferencia entre un asistente y un accidente suele ser esa línea. */
