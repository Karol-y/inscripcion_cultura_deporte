import { validarPostulacion } from '@bienestar/compartido';
import type { Comprobante, Oferta } from '@bienestar/compartido';
import { entorno } from '../config/entorno';
import { consultarDisciplinas, guardarPostulacion } from '../repositorios/tps';

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const esquema = validarPostulacion(entorno.dominioInstitucional);

export async function obtenerOferta(): Promise<Oferta> {
  const disciplinas = await consultarDisciplinas();
  return {
    dominioInstitucional: entorno.dominioInstitucional,
    disciplinas: disciplinas.map(({ horarios, _count, ...disciplina }) => ({
      ...disciplina,
      cuposDisponibles: Math.max(0, disciplina.cupoMaximo - _count.postulaciones),
      horarios: horarios.map(({ dia, inicio, fin }) => ({
        dia: dias[dia - 1],
        inicio: inicio.toISOString().slice(11, 16),
        fin: fin.toISOString().slice(11, 16),
      })),
    })),
  };
}

export async function registrarPostulacion(entrada: unknown): Promise<
  { comprobante: Comprobante } | { errores: Record<string, string>; cupoAgotado?: true }
> {
  const validacion = esquema.safeParse(entrada);
  if (!validacion.success) {
    const errores: Record<string, string> = {};
    for (const { path, message } of validacion.error.issues) {
      errores[String(path[0] ?? 'formulario')] ??= path.length ? message : 'Envía los datos del formulario.';
    }
    return { errores };
  }

  const guardado = await guardarPostulacion(validacion.data);
  if (guardado.resultado === 'inexistente') {
    return { errores: { disciplinaId: 'La disciplina seleccionada ya no está disponible.' } };
  }
  if (guardado.resultado === 'agotado') {
    return { cupoAgotado: true, errores: { disciplinaId: 'No quedan cupos en esta disciplina. Elige otra.' } };
  }
  const { registro, cuposDisponibles } = guardado;
  return { comprobante: { ...registro, creadaEn: registro.creadaEn.toISOString(), cuposDisponibles } };
}
