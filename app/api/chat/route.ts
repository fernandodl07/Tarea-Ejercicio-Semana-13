import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import { herramientas } from '../../../lib/herramientas';
import { modelo } from '../../../lib/modelo';

export const maxDuration = 30;

const SISTEMA = `Eres el asistente de Tareas Pro, una aplicación de tareas de equipo.
Contestas en español, corto y directo: dos o tres frases, nunca párrafos.
Nunca inventes tareas que no hayas visto: si no sabes, búscalas primero.
Si el usuario pide agregar algo, agrégalo de verdad con la herramienta.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: modelo(),
    system: SISTEMA,

    // ╔═══════════════════════════════════════════════════════════╗
    // ║  HUECO 1                                                  ║
    // ║                                                           ║
    // ║  Así como está, el modelo contesta sin haber leído nada:  ║
    // ║  le estamos mandando una conversación vacía. Pruébalo —   ║
    // ║  el síntoma es que responde, pero no a lo que preguntaste.║
    // ║                                                           ║
    // ║  useChat manda UIMessage[]: mensajes con PARTES (texto,   ║
    // ║  llamadas a herramientas, archivos). El modelo espera otra║
    // ║  forma, ModelMessage[]. Hay una función importada arriba  ║
    // ║  que hace exactamente esa traducción. Úsala.              ║
    // ╚═══════════════════════════════════════════════════════════╝
    messages: await convertToModelMessages(messages),

    // ╔═══════════════════════════════════════════════════════════╗
    // ║  HUECO 3b                                                 ║
    // ║                                                           ║
    // ║  El asistente todavía no tiene manos. Pídele que agregue  ║
    // ║  una tarea y te va a decir que ya la agregó. Es mentira,  ║
    // ║  y vale la pena verlo con tus ojos antes de arreglarlo.   ║
    // ║                                                           ║
    // ║  Faltan dos cosas aquí:                                   ║
    // ║    tools: las herramientas de lib/herramientas.ts         ║
    // ║    stopWhen: hasta dónde puede seguir el bucle de pasos   ║
    // ║              (isStepCount está importado arriba)          ║
    // ║                                                           ║
    // ║  Sin stopWhen el modelo pide la herramienta, el SDK la    ║
    // ║  corre… y ahí se queda: nunca vuelve a hablar para        ║
    // ║  contarte cómo le fue.                                    ║
    // ╚═══════════════════════════════════════════════════════════╝
    tools: herramientas,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}

// herramientas y stepCountIs quedan importados a propósito: los vas a usar
// en el hueco 3b. Si tu editor los marca como no usados, tiene razón… por ahora.
void herramientas;
void stepCountIs;
