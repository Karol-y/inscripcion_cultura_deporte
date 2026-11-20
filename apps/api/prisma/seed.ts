import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const oferta = [
  { nombre: 'Fútbol', tipo: 'DEPORTE', descripcion: 'Practica fundamentos técnicos y juego en equipo en la cancha universitaria.', cupoMaximo: 24, dias: [2, 4], inicio: '16:00', fin: '18:00' },
  { nombre: 'Baloncesto', tipo: 'DEPORTE', descripcion: 'Entrena pases, lanzamientos y estrategias de juego colectivo.', cupoMaximo: 18, dias: [1, 3], inicio: '15:00', fin: '17:00' },
  { nombre: 'Voleibol', tipo: 'DEPORTE', descripcion: 'Desarrolla técnica de saque, recepción y ataque en equipo.', cupoMaximo: 18, dias: [2, 5], inicio: '14:00', fin: '16:00' },
  { nombre: 'Danza', tipo: 'CULTURA', descripcion: 'Explora ritmos colombianos y expresión corporal en grupo.', cupoMaximo: 20, dias: [1, 3], inicio: '17:00', fin: '19:00' },
  { nombre: 'Teatro', tipo: 'CULTURA', descripcion: 'Trabaja improvisación, voz y creación escénica en colectivo.', cupoMaximo: 16, dias: [4], inicio: '16:00', fin: '18:00' },
  { nombre: 'Música', tipo: 'CULTURA', descripcion: 'Desarrolla habilidades musicales en un ensamble universitario.', cupoMaximo: 15, dias: [5], inicio: '15:00', fin: '17:00' },
] as const;

function hora(valor: string) {
  return new Date(`1970-01-01T${valor}:00Z`);
}

async function cargarOferta() {
  await prisma.$transaction(async (tx) => {
    for (const { dias, inicio, fin, ...datos } of oferta) {
      await tx.disciplina.upsert({
        where: { nombre: datos.nombre },
        update: {},
        create: {
          ...datos,
          horarios: { create: dias.map((dia) => ({ dia, inicio: hora(inicio), fin: hora(fin) })) },
        },
      });
    }
  });
  console.log('Oferta de ejemplo disponible.');
}

cargarOferta().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
