import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { 
  ArrowLeft, 
  Binary, 
  ArrowRightLeft, 
  Calculator, 
  Thermometer, 
  Ruler, 
  Weight, 
  Clock, 
  HardDrive,
  Activity,
  Zap,
  Check
} from 'lucide-react';

type UnitCategory = 'temperature' | 'length' | 'weight' | 'time' | 'data';

export default function UnitConverterPage() {
  const [activeTab, setActiveTab] = useState<'converter' | 'formulas'>('converter');
  
  // Converter States
  const [unitCategory, setUnitCategory] = useState<UnitCategory>('temperature');
  const [valFrom, setValFrom] = useState<string>('100');
  const [unitFrom, setUnitFrom] = useState<string>('celsius');
  const [unitTo, setUnitTo] = useState<string>('fahrenheit');

  // Formula States
  const [formulaType, setFormulaType] = useState<'speed' | 'force' | 'kinetic' | 'ohm' | 'pythagoras' | 'circle'>('speed');
  
  // Formula inputs
  const [fInputs, setFInputs] = useState<Record<string, string>>({
    s: '100', t: '10', // speed
    m: '5', a: '9.8', // force
    v: '20', // kinetic
    i: '2', r: '10', // ohm
    sideA: '3', sideB: '4', // pythagoras
    radius: '7' // circle
  });

  // Unit conversion calculations
  const calculateConversion = (): string => {
    const val = parseFloat(valFrom);
    if (isNaN(val)) return '-';

    if (unitCategory === 'temperature') {
      // Convert to Celsius first
      let c = val;
      if (unitFrom === 'fahrenheit') c = (val - 32) * (5 / 9);
      else if (unitFrom === 'kelvin') c = val - 273.15;
      else if (unitFrom === 'reamur') c = val * (5 / 4);

      // Convert from Celsius to Target
      if (unitTo === 'celsius') return c.toFixed(2);
      if (unitTo === 'fahrenheit') return (c * (9 / 5) + 32).toFixed(2);
      if (unitTo === 'kelvin') return (c + 273.15).toFixed(2);
      if (unitTo === 'reamur') return (c * (4 / 5)).toFixed(2);
    }

    if (unitCategory === 'length') {
      // Base: meter
      const toMeters: Record<string, number> = { km: 1000, m: 1, cm: 0.01, mm: 0.001, inch: 0.0254, feet: 0.3048 };
      const meters = val * (toMeters[unitFrom] || 1);
      const res = meters / (toMeters[unitTo] || 1);
      return res >= 0.0001 ? res.toFixed(4) : res.toExponential(4);
    }

    if (unitCategory === 'weight') {
      // Base: kilogram
      const toKg: Record<string, number> = { ton: 1000, kg: 1, gram: 0.001, mg: 0.000001, lbs: 0.453592 };
      const kg = val * (toKg[unitFrom] || 1);
      const res = kg / (toKg[unitTo] || 1);
      return res >= 0.0001 ? res.toFixed(4) : res.toExponential(4);
    }

    if (unitCategory === 'time') {
      // Base: second
      const toSec: Record<string, number> = { hari: 86400, jam: 3600, menit: 60, detik: 1 };
      const sec = val * (toSec[unitFrom] || 1);
      const res = sec / (toSec[unitTo] || 1);
      return res.toFixed(2);
    }

    if (unitCategory === 'data') {
      // Base: Megabyte
      const toMb: Record<string, number> = { TB: 1048576, GB: 1024, MB: 1, KB: 0.0009765625 };
      const mb = val * (toMb[unitFrom] || 1);
      const res = mb / (toMb[unitTo] || 1);
      return res >= 0.0001 ? res.toFixed(4) : res.toExponential(4);
    }

    return '-';
  };

  // Units list per category
  const unitsByCategory: Record<UnitCategory, { id: string; label: string }[]> = {
    temperature: [
      { id: 'celsius', label: 'Celsius (°C)' },
      { id: 'fahrenheit', label: 'Fahrenheit (°F)' },
      { id: 'kelvin', label: 'Kelvin (K)' },
      { id: 'reamur', label: 'Reamur (°R)' },
    ],
    length: [
      { id: 'km', label: 'Kilometer (km)' },
      { id: 'm', label: 'Meter (m)' },
      { id: 'cm', label: 'Centimeter (cm)' },
      { id: 'mm', label: 'Milimeter (mm)' },
      { id: 'inch', label: 'Inci (in)' },
      { id: 'feet', label: 'Kaki (ft)' },
    ],
    weight: [
      { id: 'ton', label: 'Ton' },
      { id: 'kg', label: 'Kilogram (kg)' },
      { id: 'gram', label: 'Gram (g)' },
      { id: 'mg', label: 'Miligram (mg)' },
      { id: 'lbs', label: 'Pound (lbs)' },
    ],
    time: [
      { id: 'hari', label: 'Hari' },
      { id: 'jam', label: 'Jam' },
      { id: 'menit', label: 'Menit' },
      { id: 'detik', label: 'Detik' },
    ],
    data: [
      { id: 'TB', label: 'Terabyte (TB)' },
      { id: 'GB', label: 'Gigabyte (GB)' },
      { id: 'MB', label: 'Megabyte (MB)' },
      { id: 'KB', label: 'Kilobyte (KB)' },
    ],
  };

  const handleCategoryChange = (cat: UnitCategory) => {
    setUnitCategory(cat);
    const available = unitsByCategory[cat];
    setUnitFrom(available[0].id);
    setUnitTo(available[1]?.id || available[0].id);
  };

  // Formula Calculation logic
  const calculateFormulaResult = () => {
    if (formulaType === 'speed') {
      const s = parseFloat(fInputs.s) || 0;
      const t = parseFloat(fInputs.t) || 1;
      const v = s / t;
      return {
        formula: 'v = s / t',
        res: `${v.toFixed(2)} m/s`,
        detail: `v = ${s} m / ${t} s = ${v.toFixed(2)} m/s (${(v * 3.6).toFixed(2)} km/jam)`
      };
    }
    if (formulaType === 'force') {
      const m = parseFloat(fInputs.m) || 0;
      const a = parseFloat(fInputs.a) || 0;
      const f = m * a;
      return {
        formula: 'F = m · a',
        res: `${f.toFixed(2)} N (Newton)`,
        detail: `F = ${m} kg × ${a} m/s² = ${f.toFixed(2)} N`
      };
    }
    if (formulaType === 'kinetic') {
      const m = parseFloat(fInputs.m) || 0;
      const v = parseFloat(fInputs.v) || 0;
      const ek = 0.5 * m * Math.pow(v, 2);
      return {
        formula: 'Ek = ½ · m · v²',
        res: `${ek.toFixed(2)} Joule`,
        detail: `Ek = 0.5 × ${m} kg × (${v} m/s)² = ${ek.toFixed(2)} Joule`
      };
    }
    if (formulaType === 'ohm') {
      const i = parseFloat(fInputs.i) || 0;
      const r = parseFloat(fInputs.r) || 0;
      const volt = i * r;
      return {
        formula: 'V = I · R',
        res: `${volt.toFixed(2)} Volt`,
        detail: `Tegangan (V) = ${i} Ampere × ${r} Ohm = ${volt.toFixed(2)} V`
      };
    }
    if (formulaType === 'pythagoras') {
      const a = parseFloat(fInputs.sideA) || 0;
      const b = parseFloat(fInputs.sideB) || 0;
      const c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
      return {
        formula: 'c = √(a² + b²)',
        res: `c = ${c.toFixed(2)}`,
        detail: `c = √(${a}² + ${b}²) = √(${Math.pow(a,2)} + ${Math.pow(b,2)}) = ${c.toFixed(2)}`
      };
    }
    // Circle
    const r = parseFloat(fInputs.radius) || 0;
    const luas = Math.PI * Math.pow(r, 2);
    const keliling = 2 * Math.PI * r;
    return {
      formula: 'L = π · r²  |  K = 2 · π · r',
      res: `Luas = ${luas.toFixed(2)} | Keliling = ${keliling.toFixed(2)}`,
      detail: `r = ${r} -> Luas = π × ${r}² = ${luas.toFixed(2)}, Keliling = 2 × π × ${r} = ${keliling.toFixed(2)}`
    };
  };

  const formulaResult = calculateFormulaResult();

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft size={14} /> Kembali ke Dashboard
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200 mb-2">
            <Binary size={13} /> Alat Bantu Belajar
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kalkulator Sains & Konverter Satuan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Konversi besaran fisika dan pecahkan rumus eksakta secara real-time.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8 max-w-sm">
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === 'converter' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            <ArrowRightLeft size={14} /> Konverter Satuan
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === 'formulas' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Calculator size={14} /> Rumus Fisika & Matematika
          </button>
        </div>

        {activeTab === 'converter' ? (
          <div className="space-y-6">
            {/* Category selection */}
            <div className="grid grid-cols-5 gap-2.5">
              {[
                { id: 'temperature', label: 'Suhu', icon: Thermometer },
                { id: 'length', label: 'Panjang', icon: Ruler },
                { id: 'weight', label: 'Massa / Berat', icon: Weight },
                { id: 'time', label: 'Waktu', icon: Clock },
                { id: 'data', label: 'Digital Data', icon: HardDrive },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.id as UnitCategory)}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    unitCategory === c.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <c.icon size={18} />
                  <span className="text-xs font-bold">{c.label}</span>
                </button>
              ))}
            </div>

            {/* Converter Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-6 items-center">
                {/* From Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Nilai & Satuan Awal</label>
                  <input
                    type="number"
                    value={valFrom}
                    onChange={(e) => setValFrom(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-lg font-black outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Masukkan angka"
                  />
                  <select
                    value={unitFrom}
                    onChange={(e) => setUnitFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    {unitsByCategory[unitCategory].map((u) => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>

                {/* To Output */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Hasil Konversi</label>
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-indigo-600 flex items-center min-h-[54px] select-all">
                    {calculateConversion()}
                  </div>
                  <select
                    value={unitTo}
                    onChange={(e) => setUnitTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    {unitsByCategory[unitCategory].map((u) => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Formula Chooser */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { id: 'speed', title: 'Kecepatan', formula: 'v = s / t' },
                { id: 'force', title: 'Gaya (Hukum II Newton)', formula: 'F = m · a' },
                { id: 'kinetic', title: 'Energi Kinetik', formula: 'Ek = ½ · m · v²' },
                { id: 'ohm', title: 'Hukum Ohm Listrik', formula: 'V = I · R' },
                { id: 'pythagoras', title: 'Teorema Pythagoras', formula: 'c = √(a² + b²)' },
                { id: 'circle', title: 'Luas & Keliling Lingkaran', formula: 'π · r²  |  2 · π · r' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormulaType(f.id as any)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    formulaType === f.id
                      ? 'bg-indigo-50/80 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 mb-1">{f.title}</div>
                  <div className="text-[11px] font-mono font-bold text-indigo-600">{f.formula}</div>
                </button>
              ))}
            </div>

            {/* Formula Interactive Calculator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-4">Parameter Rumus</h3>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {formulaType === 'speed' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Jarak (s) dalam meter:</label>
                      <input
                        type="number"
                        value={fInputs.s}
                        onChange={(e) => setFInputs({ ...fInputs, s: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Waktu (t) dalam detik:</label>
                      <input
                        type="number"
                        value={fInputs.t}
                        onChange={(e) => setFInputs({ ...fInputs, t: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </>
                )}

                {formulaType === 'force' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Massa benda (m) dalam kg:</label>
                      <input
                        type="number"
                        value={fInputs.m}
                        onChange={(e) => setFInputs({ ...fInputs, m: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Percepatan (a) dalam m/s²:</label>
                      <input
                        type="number"
                        value={fInputs.a}
                        onChange={(e) => setFInputs({ ...fInputs, a: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </>
                )}

                {formulaType === 'kinetic' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Massa benda (m) dalam kg:</label>
                      <input
                        type="number"
                        value={fInputs.m}
                        onChange={(e) => setFInputs({ ...fInputs, m: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Kecepatan (v) dalam m/s:</label>
                      <input
                        type="number"
                        value={fInputs.v}
                        onChange={(e) => setFInputs({ ...fInputs, v: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </>
                )}

                {formulaType === 'ohm' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Kuat Arus (I) dalam Ampere:</label>
                      <input
                        type="number"
                        value={fInputs.i}
                        onChange={(e) => setFInputs({ ...fInputs, i: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Hambatan (R) dalam Ohm (Ω):</label>
                      <input
                        type="number"
                        value={fInputs.r}
                        onChange={(e) => setFInputs({ ...fInputs, r: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </>
                )}

                {formulaType === 'pythagoras' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Sisi Tegak a:</label>
                      <input
                        type="number"
                        value={fInputs.sideA}
                        onChange={(e) => setFInputs({ ...fInputs, sideA: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Sisi Alas b:</label>
                      <input
                        type="number"
                        value={fInputs.sideB}
                        onChange={(e) => setFInputs({ ...fInputs, sideB: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </>
                )}

                {formulaType === 'circle' && (
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Jari-jari (r):</label>
                    <input
                      type="number"
                      value={fInputs.radius}
                      onChange={(e) => setFInputs({ ...fInputs, radius: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Solution Card */}
              <div className="p-5 bg-slate-900 text-white rounded-2xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Hasil Perhitungan</div>
                <div className="text-2xl font-black text-emerald-400 mb-2">
                  {formulaResult.res}
                </div>
                <div className="text-xs font-mono text-slate-300 pt-2 border-t border-slate-800">
                  Langkah: {formulaResult.detail}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
