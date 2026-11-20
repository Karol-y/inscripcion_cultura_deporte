import type { Postulacion } from '@bienestar/compartido';
import { prisma } from '../config/prisma';

export function consultarDisciplinas() {
  return prisma.disciplina.findMany({
    orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    select: {
      id: true, nombre: true, tipo: true, descripcion: true,
      horarios: {
        orderBy: [{ dia: 'asc' }, { inicio: 'asc' }],
        select: { dia: true, inicio: true, fin: true },
      },
    },
  });
}

export function guardarPostulacion(datos: Postulacion) {
  return prisma.postulacion.create({
    data: datos,
    select: { id: true, estado: true, creadaEn: true },
  });
}
