import { useEffect, useRef, useState } from 'react';
import type { Oferta } from '@bienestar/compartido';
import { cargarOferta } from '../api/tps';
import { Catalogo } from '../catalogo/Catalogo';
import { Formulario } from '../postulaciones/Formulario';

export function Portal() {
  const [oferta, setOferta] = useState<Oferta>();
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);
  const [disciplinaId, setDisciplinaId] = useState('');
  const tituloFormulario = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const solicitud = new AbortController();
    cargarOferta(solicitud.signal).then(setOferta).catch((fallo: Error) => {
      if (!solicitud.signal.aborted) setError(fallo.message);
    });
    return () => solicitud.abort();
  }, [intento]);

  return <>
    <a className="sr-only focus:not-sr-only focus:block focus:p-3" href="#contenido">Saltar al contenido</a>
    <header className="border-b border-white/20 bg-[#092f33] text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <p className="font-bold">Bienestar Universitario</p>
        <nav aria-label="Principal" className="flex flex-wrap gap-5 text-sm font-semibold">
          <a className="underline-offset-4 hover:underline" href="#oferta">Disciplinas</a>
          <a className="underline-offset-4 hover:underline" href="#postulacion">Postulación</a>
        </nav>
      </div>
    </header>
    <main id="contenido">
      <section className="bg-[#092f33] text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
            Portal de Inscripción a Bienestar Universitario
          </h1>
          <p className="mt-5 max-w-xl text-lg text-teal-100">Consulta las disciplinas deportivas y culturales, revisa sus horarios y envía tu postulación.</p>
          <a className="mt-7 inline-flex rounded-lg bg-teal-200 px-5 py-3 font-bold text-teal-950 hover:bg-teal-100" href="#oferta">Ver disciplinas</a>
        </div>
      </section>
      <div className="mx-auto max-w-6xl space-y-12 px-5 py-10 sm:px-8 sm:py-14">
        <section id="oferta" aria-labelledby="titulo-oferta">
          <h2 id="titulo-oferta" className="mb-5 text-3xl font-bold tracking-tight">Disciplinas disponibles</h2>
          {error ? <div className="rounded-xl bg-white p-5">
            <p role="alert" className="mb-3 text-red-800">{error}</p>
            <button type="button" className="secundario" onClick={() => {
              setError('');
              setIntento(intento + 1);
            }}>Reintentar</button>
          </div> : !oferta ? <p role="status">Cargando disciplinas…</p> :
            <Catalogo disciplinas={oferta.disciplinas} seleccionar={(id) => {
              setDisciplinaId(id);
              tituloFormulario.current?.focus();
            }} />}
        </section>
        <section id="postulacion" aria-labelledby="titulo-postulacion" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <h2 id="titulo-postulacion" ref={tituloFormulario} tabIndex={-1} className="mb-4 text-3xl font-bold tracking-tight">Postulación</h2>
          {oferta?.disciplinas.length ? <Formulario oferta={oferta} disciplinaId={disciplinaId} seleccionar={setDisciplinaId} /> :
            <p>El formulario estará disponible cuando se cargue la oferta de disciplinas.</p>}
        </section>
      </div>
    </main>
  </>;
}
