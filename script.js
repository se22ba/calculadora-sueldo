(function () {
  const els = {
    sueldo: document.getElementById('sueldo'),
    fechaIngreso: document.getElementById('fechaIngreso'),
    hs50: document.getElementById('hs50'),
    hs100: document.getElementById('hs100'),
    art65: document.getElementById('art65'),
    aumento: document.getElementById('aumento'),
    antiguedadAnios: document.getElementById('antiguedadAnios'),
    antiguedadMonto: document.getElementById('antiguedadMonto'),
    guardias: document.getElementById('guardias'),
    hs50Monto: document.getElementById('hs50Monto'),
    hs100Monto: document.getElementById('hs100Monto'),
    art65Monto: document.getElementById('art65Monto'),
    bruto: document.getElementById('bruto'),
    retenciones: document.getElementById('retenciones'),
    retLabel: document.getElementById('retLabel'),
    neto: document.getElementById('neto'),
    netoAumentado: document.getElementById('netoAumentado'),
    art65TarifaLabel: document.getElementById('art65TarifaLabel'),
    // Config
    antigFijo: document.getElementById('antigFijo'),
    antigPorAnio: document.getElementById('antigPorAnio'),
    antigPctPorAnio: document.getElementById('antigPctPorAnio'),
    retFijo: document.getElementById('retFijo'),
    retFijoValor: document.getElementById('retFijoValor'),
    retPorc: document.getElementById('retPorc'),
    retPorcentaje: document.getElementById('retPorcentaje'),
    horasBase: document.getElementById('horasBase'),
    art65ValorHora: document.getElementById('art65ValorHora'),
  };

  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  });

  function parseNum(v) {
    const n = typeof v === 'string' ? parseFloat(v) : Number(v);
    return isNaN(n) ? 0 : n;
  }

  function calcularAniosAntiguedad(fechaStr) {
    if (!fechaStr) return 0;
    // Asegurar interpretación sin problemas de zona horaria (YYYY-MM-DD)
    const [y, m, d] = fechaStr.split('-').map(Number);
    const ingreso = new Date(y, m - 1, d);  // Local date
    const hoy = new Date();
    let anios = hoy.getFullYear() - ingreso.getFullYear();
    const mes = hoy.getMonth() - ingreso.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < ingreso.getDate())) anios--;
    return Math.max(0, anios);
  }

  function recompute() {
    const sueldoNum = parseNum(els.sueldo.value);
    const hs50Num = parseNum(els.hs50.value);
    const hs100Num = parseNum(els.hs100.value);
    const art65Num = parseNum(els.art65.value);
    const aumentoPct = parseNum(els.aumento.value);
    const horasBase = Math.max(1, parseNum(els.horasBase.value));
    const art65ValorHora = parseNum(els.art65ValorHora.value);

    const anios = calcularAniosAntiguedad(els.fechaIngreso.value);
    els.antiguedadAnios.textContent = anios;

    // Antigüedad
    let antiguedad = 0;
    if (els.antigFijo.checked) {
      antiguedad = sueldoNum * 0.07; // como el original
    } else {
      const pct = parseNum(els.antigPctPorAnio.value) / 100; // ej 1% por año
      antiguedad = sueldoNum * pct * anios;
    }

    // Guardias pasivas (12.84%)
    const guardiasPasivas = sueldoNum * 0.1284;

    // Valor hora extra y horas
    const valorHoraExtra = (sueldoNum + antiguedad) / horasBase;
    const hs50Monto = hs50Num * valorHoraExtra * 1.5;
    const hs100Monto = hs100Num * valorHoraExtra * 2;

    // ART 65
    const art65Monto = art65Num * art65ValorHora;
    // Etiqueta con separador argentino
    els.art65TarifaLabel.textContent = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(art65ValorHora);

    // Bruto
    const bruto = sueldoNum + antiguedad + guardiasPasivas + hs50Monto + hs100Monto + art65Monto;

    // Retenciones
    let retenciones = 0;
    if (els.retFijo.checked) {
      retenciones = parseNum(els.retFijoValor.value);
      els.retLabel.textContent = '(fijo)';
    } else {
      const pct = parseNum(els.retPorcentaje.value) / 100;
      retenciones = bruto * pct;
      els.retLabel.textContent = `(${(pct * 100).toFixed(2)}% de bruto)`;
    }

    // Neto
    const neto = bruto - retenciones;
    const netoAumentado = neto * (1 + (aumentoPct / 100));

    // Pintar
    els.antiguedadMonto.textContent = formatter.format(antiguedad);
    els.guardias.textContent = formatter.format(guardiasPasivas);
    els.hs50Monto.textContent = formatter.format(hs50Monto);
    els.hs100Monto.textContent = formatter.format(hs100Monto);
    els.art65Monto.textContent = formatter.format(art65Monto);
    els.bruto.textContent = formatter.format(bruto);
    els.retenciones.textContent = formatter.format(retenciones);
    els.neto.textContent = formatter.format(neto);
    els.netoAumentado.textContent = formatter.format(netoAumentado);
  }

  // Eventos21231232131231
  [
    'sueldo','fechaIngreso','hs50','hs100','art65','aumento',
    'antigFijo','antigPorAnio','antigPctPorAnio',
    'retFijo','retFijoValor','retPorc','retPorcentaje',
    'horasBase','art65ValorHora'
  ].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', recompute);
    el.addEventListener('change', recompute);
  });

  // Inicial
  recompute();
})();