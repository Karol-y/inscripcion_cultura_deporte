import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { validarPostulacion } from '@bienestar/compartido';
import type { Comprobante, Oferta } from '@bienestar/compartido';
import { enviarPostulacion, ErrorApi } from '../api/tps';
import type { Errores } from '../api/tps';

const campos = [
  { id: 'nombre', etiqueta: 'Nombre completo', maxLength: 120, autoComplete: 'name' },
  { id: 'documento', etiqueta: 'Documento o código estudiantil', maxLength: 40 },
  { id: 'correo', etiqueta: 'Correo institucional', maxLength: 254, type: 'email', autoComplete: 'email' },
  { id: 'programa', etiqueta: 'Programa académico', maxLength: 120 },
  { id: 'promedio', etiqueta: 'Promedio (0 a 5)', maxLength: 8, inputMode: 'decimal' as const },
] as const;

interface Props {
  oferta: Oferta;
  disciplinaId: string;
  seleccionar: (id: string) => void;
}

export function Formulario({ oferta, disciplinaId, seleccionar }: Props) {
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [comprobante, setComprobante] = useState<Comprobante>();
  const resumen = useRef<HTMLParagraphElement>(null);
  const confirmacion = useRef<HTMLParagraphElement>(null);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (Object.keys(errores).length) resumen.current?.focus();
  }, [errores]);

  useEffect(() => {
    if (comprobante) confirmacion.current?.focus();
  }, [comprobante]);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    const form = evento.currentTarget;
    const datos = Object.fromEntries(new FormData(form));
    const promedio = String(datos.promedio ?? '').trim();
    const resultado = validarPostulacion(oferta.dominioInstitucional).safeParse({
      ...datos,
      promedio: /^\d+(?:[.,]\d+)?$/.test(promedio) ? Number(promedio.replace(',', '.')) : undefined,
    });
    if (!resultado.success) {
      const camposInvalidos: Errores = {};
      for (const { path, message } of resultado.error.issues) camposInvalidos[String(path[0])] ??= message;
      setErrores(camposInvalidos);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      setComprobante(await enviarPostulacion(resultado.data));
      form.reset();
      seleccionar('');
    } catch (error) {
      const api = error instanceof ErrorApi ? error : new ErrorApi('No se pudo enviar la postulación.');
      setErrores({ formulario: api.message, ...api.errores });
    } finally {
      setEnviando(false);
    }
  }

  function atributos(id: string) {
    return {
      id,
      name: id,
      required: true,
      className: 'campo',
      'aria-invalid': Boolean(errores[id]),
      'aria-describedby': [id === 'correo' && 'ayuda-correo', errores[id] && `error-${id}`].filter(Boolean).join(' ') || undefined,
    };
  }

  function errorCampo(id: string) {
    return errores[id] && <p id={`error-${id}`} className="mt-1 text-sm text-red-800">{errores[id]}</p>;
  }

  if (comprobante && !disciplinaId) return <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50 p-5">
    <p ref={confirmacion} tabIndex={-1} role="status" className="text-lg font-bold">Recibimos tu postulación.</p>
    <p>Estado · Recibida</p>
    <p className="break-all">Número de radicado · {comprobante.id}</p>
    <button type="button" className="secundario" onClick={() => {
      setComprobante(undefined);
      requestAnimationFrame(() => formulario.current?.querySelector('input')?.focus());
    }}>Hacer otra postulación</button>
  </div>;

  return <form ref={formulario} noValidate onSubmit={enviar}>
    <p className="mb-4 text-slate-700">Todos los campos son obligatorios.</p>
    {Object.keys(errores).length > 0 && <p ref={resumen} tabIndex={-1} role="alert" className="mb-4 rounded-lg bg-red-50 p-3 font-semibold text-red-800">
      {errores.formulario ?? 'Revisa los campos indicados para continuar.'}
    </p>}
    <fieldset disabled={enviando} className="grid gap-5 sm:grid-cols-2">
      <legend className="sr-only">Datos de la postulación</legend>
      {campos.map(({ id, etiqueta, ...opciones }) => <div key={id}>
        <label htmlFor={id} className="mb-1.5 block font-semibold">{etiqueta}</label>
        <input {...atributos(id)} {...opciones} />
        {id === 'correo' && <p id="ayuda-correo" className="mt-1 text-sm text-slate-700">Usa un correo @{oferta.dominioInstitucional}.</p>}
        {errorCampo(id)}
      </div>)}
      <div>
        <label htmlFor="disciplinaId" className="mb-1.5 block font-semibold">Disciplina de interés</label>
        <select {...atributos('disciplinaId')} value={disciplinaId} onChange={(evento) => {
          setComprobante(undefined);
          seleccionar(evento.target.value);
        }}>
          <option value="">Selecciona una disciplina</option>
          {oferta.disciplinas.map(({ id, nombre }) => <option key={id} value={id}>{nombre}</option>)}
        </select>
        {errorCampo('disciplinaId')}
      </div>
      <button className="boton justify-self-start" type="submit">{enviando ? 'Enviando…' : 'Enviar postulación'}</button>
    </fieldset>
  </form>;
}
