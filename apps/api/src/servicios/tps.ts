import { validarPostulacion } from '@bienestar/compartido';
import type { Comprobante, Oferta } from '@bienestar/compartido';
import { Prisma } from '@prisma/client';
import { entorno } from '../config/entorno';
import { consultarDisciplinas, guardarPostulacion } from '../repositorios/tps';

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const esquema = validarPostulacion(entorno.dominioInstitucional);

export async function obtenerOferta(): Promise<Oferta> {
  const disciplinas = await consultarDisciplinas();
  return {
    dominioInstitucional: entorno.dominioInstitucional,
    disciplinas: disciplinas.map(({ horarios, ...disciplina }) => ({
      ...disciplina,
      horarios: horarios.map(({ dia, inicio, fin }) => ({
        dia: dias[dia - 1],
        inicio: inicio.toISOString().slice(11, 16),
        fin: fin.toISOString().slice(11, 16),
      })),
    })),
  };
}

export async function registrarPostulacion(entrada: unknown): Promise<
  { comprobante: Comprobante } | { errores: Record<string, string> }
> {
  const validacion = esquema.safeParse(entrada);
  if (!validacion.success) {
    const errores: Record<string, string> = {};
    for (const { path, message } of validacion.error.issues) {
      errores[String(path[0] ?? 'formulario')] ??= path.length ? message : 'Envía los datos del formulario.';
    }
    return { errores };
  }

  try {
    const registro = await guardarPostulacion(validacion.data);
    return { comprobante: { ...registro, creadaEn: registro.creadaEn.toISOString() } };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return { errores: { disciplinaId: 'La disciplina seleccionada ya no está disponible.' } };
    }
    throw error;
  }
}
