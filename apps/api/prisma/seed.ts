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

const deportesSinHorario = [
  'Ajedrez',
  'Atletismo',
  'Bádminton',
  'Fútbol Sala',
  'Karate-do',
  'Kickball',
  'Levantamiento de pesas',
  'Softbol',
  'Taekwondo',
  'Tenis',
  'Tenis de mesa',
  'Rugby',
];

const culturaSinHorario = [
  'Banda sabanera 6 octubre',
  'Cine clubes',
  'Comité cultural de medicina',
  'Coral societas',
  'Coro San Agustín',
  'Danzas modernas semillero',
  'Danzas modernas base',
  'Danzas y música folclóricas de la UdeC',
  'Grupo musical folclórico Corinche',
  'Grupo Gaita, Maraca y Tambó',
  'Grupo logístico "Gente pa yá"',
  'Grupo de dibujo exmedi',
  'Grupo de fotografía y lettering',
  'Grupo musical pop rock',
  'Grupo de teatro Utopía',
  'Grupo de teatro TEUC',
  'Grupo Vallenato UdeC',
  'Grupo pop rock',
  'Orquesta tropical UdeC',
  'Grupo de porrismo',
  'Taller de guitarra',
  'Taller de ritmo y tambora',
];

const cupoInicial = 20;

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
    await tx.disciplina.createMany({
      data: [
        ...deportesSinHorario.map((nombre) => ({
          nombre, tipo: 'DEPORTE' as const, descripcion: 'Disciplina deportiva de Bienestar Universitario.', cupoMaximo: cupoInicial,
        })),
        ...culturaSinHorario.map((nombre) => ({
          nombre, tipo: 'CULTURA' as const, descripcion: 'Actividad cultural de Bienestar Universitario.', cupoMaximo: cupoInicial,
        })),
      ],
      skipDuplicates: true,
    });
  });
  console.log('Oferta de disciplinas disponible.');
}

cargarOferta().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
