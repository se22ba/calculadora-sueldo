import { useMemo, useState } from 'react'

const nf = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2
})

function toNumberLocale(s) {
  if (s == null) return 0;
  s = String(s).trim().replace(/\s/g, '');
  if (!s) return 0;

  const hasComma = s.includes(',');
  const hasDot   = s.includes('.');

  if (hasComma && hasDot) {
    // Formato AR/EU: 1.234.567,89 -> 1234567.89
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    // Solo coma: 1234567,89 -> 1234567.89
    s = s.replace(',', '.');
  } else {
    // Solo punto o solo dígitos: 1234567.89 o 1234567 -> tal cual
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function round2(n){
  return Math.round((n + Number.EPSILON) * 100) / 100
}

function Row({ label, children }){
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 items-center py-2">
      <label className="text-sm text-muted">{label}</label>
      <div className="w-48">{children}</div>
    </div>
  )
}

function NumInput({ value, onChange, placeholder = '0', step = 'any' }){
  return (
    <input
      className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-right outline-none focus:border-accent focus:ring-4 focus:ring-accent/20"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode="decimal"
      step={step}
    />
  )
}

export default function App(){
  // Entradas principales
  const [sueldoBase, setSueldoBase] = useState('0')
  const [aumentoPct, setAumentoPct] = useState('0')
  const [aniosAnt, setAniosAnt] = useState('11')

  const [hs50, setHs50] = useState('0')
  const [hs100, setHs100] = useState('0')
  const [hs50n, setHs50n] = useState('0')
  const [hs100n, setHs100n] = useState('0')

  // Parámetros avanzados (pre-cargados con tus coeficientes)
  const [H, setH] = useState('10912.0933')
  const [coefAnt, setCoefAnt] = useState('0.00573881336')
  const [coefN50, setCoefN50] = useState('0.19995')
  const [coefN100, setCoefN100] = useState('0.26660')

  // Retenciones (editables)
  const [r_jub, setR_jub] = useState('11')
  const [r_ley, setR_ley] = useState('3')
  const [r_os, setR_os] = useState('3')
  const [r_uom, setR_uom] = useState('2')
  const [r_seg, setR_seg] = useState('0.22931')

  const { bruto, items, retenciones, totalRets, neto } = useMemo(() => {
    const SB  = toNumberLocale(sueldoBase)
    const A   = toNumberLocale(aumentoPct) / 100
    const yrs = toNumberLocale(aniosAnt)

    const vH    = toNumberLocale(H)
    const kAnt  = toNumberLocale(coefAnt)
    const kN50  = toNumberLocale(coefN50)
    const kN100 = toNumberLocale(coefN100)

    // Horas (numéricas)
    const vhs50   = toNumberLocale(hs50)
    const vhs100  = toNumberLocale(hs100)
    const vhs50n  = toNumberLocale(hs50n)
    const vhs100n = toNumberLocale(hs100n)

    // Sueldo ajustado + antigüedad
    const sueldoAdj = round2(SB * (1 + A))
    const antig     = round2(sueldoAdj * (yrs * kAnt))

    // Extras y plus nocturno
    const he50     = round2(vhs50  * 1.5 * vH)
    const he100    = round2(vhs100 * 2.0 * vH)
    const plus50n  = round2(vhs50n  * kN50  * vH)
    const plus100n = round2(vhs100n * kN100 * vH)

    const bruto = round2(sueldoAdj + antig + he50 + he100 + plus50n + plus100n)

    const items = [
      ['Sueldo (ajustado)', sueldoAdj],
      ['Antigüedad', antig],
      ['Horas extra 50%', he50],
      ['Horas extra 100%', he100],
      ['Plus nocturno 50%', plus50n],
      ['Plus nocturno 100%', plus100n],
    ]

    // Retenciones (editables)
    const rates = {
      'Jubilación':          toNumberLocale(r_jub) / 100,
      'Ley 19.032':          toNumberLocale(r_ley) / 100,
      'Obra Social':         toNumberLocale(r_os)  / 100,
      'Res. 227/01 UOM':     toNumberLocale(r_uom) / 100,
      'Seguro de Vida UOM':  toNumberLocale(r_seg) / 100,
    }

    const retenciones = Object.entries(rates).map(([k, rate]) => [k, round2(bruto * rate), rate])
    const totalRets   = round2(retenciones.reduce((acc, [,m]) => acc + m, 0))
    const neto        = round2(bruto - totalRets)

    return { bruto, items, retenciones, totalRets, neto }
  }, [
    sueldoBase, aumentoPct, aniosAnt,
    hs50, hs100, hs50n, hs100n,
    H, coefAnt, coefN50, coefN100,
    r_jub, r_ley, r_os, r_uom, r_seg
  ])

  // ⬇️ ESTE RETURN FALTABA
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
        Calculadora de Sueldo
      </h1>
      <p className="text-muted mt-1">
        Puto el que lee
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Panel de entradas */}
        <section className="bg-card/80 rounded-2xl shadow-soft p-4 md:p-5">
          <h2 className="text-lg font-medium mb-3">Datos de entrada</h2>

          <Row label="Sueldo base">
            <NumInput value={sueldoBase} onChange={setSueldoBase} />
          </Row>
          <Row label="Aumento (%)">
            <NumInput value={aumentoPct} onChange={setAumentoPct} />
          </Row>
          <Row label="Años de antigüedad">
            <NumInput value={aniosAnt} onChange={setAniosAnt} />
          </Row>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <Row label="HE 50% (hs)"><NumInput value={hs50} onChange={setHs50} /></Row>
            <Row label="HE 100% (hs)"><NumInput value={hs100} onChange={setHs100} /></Row>
            <Row label="Plus Noc 50% (hs)"><NumInput value={hs50n} onChange={setHs50n} /></Row>
            <Row label="Plus Noc 100% (hs)"><NumInput value={hs100n} onChange={setHs100n} /></Row>
          </div>

          <details className="mt-3">
            <summary className="cursor-pointer text-accent">Avanzado: parámetros de cálculo</summary>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <Row label="H (valor hora base)"><NumInput value={H} onChange={setH} /></Row>
              <Row label="Coef. Antigüedad/año"><NumInput value={coefAnt} onChange={setCoefAnt} /></Row>
              <Row label="Coef. Noc 50%"><NumInput value={coefN50} onChange={setCoefN50} /></Row>
              <Row label="Coef. Noc 100%"><NumInput value={coefN100} onChange={setCoefN100} /></Row>
            </div>

            <h3 className="text-base font-medium mt-4 mb-2">Retenciones estimadas</h3>
            <div className="grid grid-cols-2 gap-2">
              <Row label="Jubilación (%)"><NumInput value={r_jub} onChange={setR_jub} /></Row>
              <Row label="Ley 19.032 (%)"><NumInput value={r_ley} onChange={setR_ley} /></Row>
              <Row label="Obra Social (%)"><NumInput value={r_os} onChange={setR_os} /></Row>
              <Row label="Res. 227/01 UOM (%)"><NumInput value={r_uom} onChange={setR_uom} /></Row>
              <Row label="Seguro de Vida UOM (%)"><NumInput value={r_seg} onChange={setR_seg} /></Row>
            </div>
          </details>
        </section>

        {/* Panel de resultados */}
        <section className="bg-card/80 rounded-2xl shadow-soft p-4 md:p-5">
          <h2 className="text-lg font-medium mb-3">Resultado</h2>

          <div className="overflow-hidden rounded-xl border border-slate-700">
            <table className="w-full border-collapse">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left px-3 py-2 text-sm text-muted font-semibold">Concepto</th>
                  <th className="text-right px-3 py-2 text-sm text-muted font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {items.map(([k, v]) => (
                  <tr key={k} className="border-b border-slate-800">
                    <td className="px-3 py-2 text-sm">{k}</td>
                    <td className="px-3 py-2 text-sm text-right">{nf.format(v)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="px-3 py-2 text-sm font-semibold">Total Bruto</td>
                  <td className="px-3 py-2 text-sm text-right font-semibold">{nf.format(bruto)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-700 mt-4">
            <table className="w-full border-collapse">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left px-3 py-2 text-sm text-muted font-semibold">Retención</th>
                  <th className="text-right px-3 py-2 text-sm text-muted font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {retenciones.map(([k, v, rate]) => (
                  <tr key={k} className="border-b border-slate-800">
                    <td className="px-3 py-2 text-sm">
                      {k} <span className="text-xs text-muted">({(rate*100).toFixed(5).replace('.', ',')}%)</span>
                    </td>
                    <td className="px-3 py-2 text-sm text-right">{nf.format(v)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="px-3 py-2 text-sm font-semibold">Total Retenciones</td>
                  <td className="px-3 py-2 text-sm text-right font-semibold">{nf.format(totalRets)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm font-semibold">Neto</td>
                  <td className="px-3 py-2 text-sm text-right font-semibold text-good">{nf.format(neto)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}