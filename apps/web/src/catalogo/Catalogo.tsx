import type { Disciplina } from '@bienestar/compartido';

interface Props {
  disciplinas: Disciplina[];
  seleccionar: (id: string) => void;
}

export function Catalogo({ disciplinas, seleccionar }: Props) {
  if (disciplinas.length === 0) return <p>Por ahora no hay disciplinas disponibles.</p>;

  return <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {disciplinas.map(({ id, nombre, descripcion, tipo, horarios }) => (
      <li key={id} className="flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-5">
        <p className={`rounded-full px-3 py-1 text-sm font-semibold ${tipo === 'DEPORTE' ? 'bg-teal-100 text-teal-950' : 'bg-indigo-100 text-indigo-950'}`}>
          {tipo === 'DEPORTE' ? 'Deporte' : 'Cultura'}
        </p>
        <h3 className="mt-3 text-2xl font-bold">{nombre}</h3>
        <p className="mt-2 text-slate-700">{descripcion}</p>
        <p className="mt-4 text-sm font-bold">Horarios</p>
        {horarios.length ? <ul aria-label={`Horarios de ${nombre}`} className="mb-5 mt-1 space-y-1 text-sm text-slate-700">
          {horarios.map(({ dia, inicio, fin }) => <li key={`${dia}-${inicio}`}>{dia} · {inicio} a {fin}</li>)}
        </ul> : <p className="mb-5 text-sm text-slate-700">Por definir</p>}
        <button type="button" className="secundario mt-auto" aria-label={`Postularme a ${nombre}`} onClick={() => seleccionar(id)}>Postularme</button>
      </li>
    ))}
  </ul>;
}
