import React, { useState } from 'react';
import { AppView, PortfolioPosition, TickerAsset } from '../types/trading';
import {
  Briefcase,
  Plus,
  Minus,
  CandlestickChart,
  Calculator,
  AlertTriangle,
} from 'lucide-react';

interface PortfolioViewProps {
  positions: PortfolioPosition[];
  tickers: TickerAsset[];
  onUpdatePositionShares: (posId: string, delta: number) => void;
  onToggleOrderMode: (posId: string) => void;
  onAddTickerToPortfolio: (symbol: string, shares: number, orderMode: 'manual' | 'plan') => void;
  onOpenTickerInChart: (symbol: string) => void;
  onNavigate: (view: AppView) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  positions,
  tickers,
  onUpdatePositionShares,
  onToggleOrderMode,
  onAddTickerToPortfolio,
  onOpenTickerInChart,
  onNavigate,
}) => {
  const [newSymbol, setNewSymbol] = useState<string>('IBE.MC');
  const [newShares, setNewShares] = useState<number>(50);
  const [newOrderMode, setNewOrderMode] = useState<'manual' | 'plan'>('plan');

  const fmtEur = (v: number) => `${v.toFixed(2).replace('.', ',')} €`;

  const portfolioDetailed = positions.map((pos) => {
    const liveTicker = tickers.find((t) => t.symbol === pos.symbol);
    const currentPrice = liveTicker ? liveTicker.priceEur : pos.avgBuyPriceEur;
    const dayChangePct = liveTicker ? liveTicker.changePct : 0;
    const trFee = pos.orderMode === 'manual' ? 1.0 : 0.0;
    const costBasis = pos.shares * pos.avgBuyPriceEur + trFee;
    const marketVal = pos.shares * currentPrice;
    const pnlEur = marketVal - costBasis;
    const pnlPct = costBasis > 0 ? (pnlEur / costBasis) * 100 : 0;
    const annualDividendEur = pos.shares * pos.annualDividendPerShareEur;

    return {
      ...pos,
      currentPrice,
      dayChangePct,
      trFee,
      costBasis,
      marketVal,
      pnlEur,
      pnlPct,
      annualDividendEur,
    };
  });

  const totalPortfolioValue = portfolioDetailed.reduce((acc, p) => acc + p.marketVal, 0);
  const totalPortfolioCost = portfolioDetailed.reduce((acc, p) => acc + p.costBasis, 0);
  const totalPnlEur = totalPortfolioValue - totalPortfolioCost;
  const totalPnlPct = totalPortfolioCost > 0 ? (totalPnlEur / totalPortfolioCost) * 100 : 0;
  const totalAnnualDividends = portfolioDetailed.reduce((acc, p) => acc + p.annualDividendEur, 0);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#0F172A] px-6 py-6 lg:px-10 lg:py-8 select-none">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Top Summary Banner */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-1">
                <Briefcase className="w-4 h-4" />
                <span>MENÚ INDEPENDIENTE · VALORACIÓN TICK A TICK EN EUROS (€)</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Cartera en Vivo (Trade Republic)
              </h1>
              <p className="text-sm text-slate-300 mt-0.5">
                Valoración actualizada cada segundo multiplicando tus títulos por la cotización en directo del mercado.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('tax')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Ir a Calculadora Fiscal & IRPF</span>
              </button>
            </div>
          </div>

          {/* 4 Main Portfolio KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 font-mono tabular-nums">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="text-xs font-sans text-slate-400">Valor Total de Mercado</div>
              <div className="text-2xl font-bold text-white mt-1">{fmtEur(totalPortfolioValue)}</div>
              <div className="text-[11px] font-sans text-slate-400 mt-1">
                Coste adquisición (c/ comisiones): {fmtEur(totalPortfolioCost)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="text-xs font-sans text-slate-400">Plusvalía / Minusvalía Latente</div>
              <div
                className={`text-2xl font-bold mt-1 ${
                  totalPnlEur >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalPnlEur >= 0 ? '+' : ''}
                {fmtEur(totalPnlEur)}
              </div>
              <div
                className={`text-xs font-semibold mt-1 ${
                  totalPnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                Rentabilidad neta: {totalPnlPct >= 0 ? '+' : ''}
                {totalPnlPct.toFixed(2)}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="text-xs font-sans text-slate-400">Dividendos Anuales Estimados</div>
              <div className="text-2xl font-bold text-sky-400 mt-1">
                {fmtEur(totalAnnualDividends)}
              </div>
              <div className="text-[11px] font-sans text-slate-400 mt-1">
                Bruto anual antes de retención AEAT (19%)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="text-xs font-sans text-slate-400">Posiciones Activas</div>
              <div className="text-2xl font-bold text-white mt-1">
                {portfolioDetailed.length} activos
              </div>
              <div className="text-[11px] font-sans text-emerald-400 mt-1">
                Sincronizado con ticks en directo
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Positions Table */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  <th className="py-3.5 px-5">Posición / País</th>
                  <th className="py-3.5 px-4">Títulos en Cartera</th>
                  <th className="py-3.5 px-4 text-right">Precio Compra Medio</th>
                  <th className="py-3.5 px-4 text-right">Precio Tick en Vivo</th>
                  <th className="py-3.5 px-4">Modalidad Trade Republic</th>
                  <th className="py-3.5 px-4 text-right">Valor Mercado (€)</th>
                  <th className="py-3.5 px-4 text-right">P&L Latente Neto</th>
                  <th className="py-3.5 px-5 text-right">Gráfico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs font-mono tabular-nums">
                {portfolioDetailed.map((pos) => {
                  const weightPct =
                    totalPortfolioValue > 0 ? (pos.marketVal / totalPortfolioValue) * 100 : 0;

                  return (
                    <tr key={pos.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-5 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{pos.symbol}</span>
                          <span className="text-[11px] text-slate-400">({pos.countryCode})</span>
                          <span className="text-[11px] font-mono text-sky-400">
                            {weightPct.toFixed(1)}% cartera
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">{pos.name}</div>
                        {pos.recentLossSale && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Regla 2 Meses activa ({pos.recentLossSale.unlockDate})</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onUpdatePositionShares(pos.id, -5)}
                            title="Restar 5 títulos"
                            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold text-white min-w-[54px] text-center">
                            {pos.shares} tít.
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdatePositionShares(pos.id, 5)}
                            title="Añadir 5 títulos"
                            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right text-slate-300">
                        {fmtEur(pos.avgBuyPriceEur)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="text-sm font-bold text-white">
                          {fmtEur(pos.currentPrice)}
                        </div>
                        <div
                          className={`text-[10px] ${
                            pos.dayChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          Hoy: {pos.dayChangePct >= 0 ? '+' : ''}
                          {pos.dayChangePct.toFixed(2)}%
                        </div>
                      </td>

                      <td className="py-4 px-4 font-sans">
                        <button
                          type="button"
                          onClick={() => onToggleOrderMode(pos.id)}
                          title="Haz clic para cambiar entre Plan Periódico (0 €) y Orden Manual (1 €)"
                          className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            pos.orderMode === 'plan'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          {pos.orderMode === 'plan'
                            ? 'Plan Periódico (0,00 €)'
                            : 'Orden Manual (1,00 €)'}
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right text-sm font-bold text-white">
                        {fmtEur(pos.marketVal)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div
                          className={`text-sm font-bold ${
                            pos.pnlEur >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {pos.pnlEur >= 0 ? '+' : ''}
                          {fmtEur(pos.pnlEur)}
                        </div>
                        <div
                          className={`text-[11px] ${
                            pos.pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          ({pos.pnlPct >= 0 ? '+' : ''}
                          {pos.pnlPct.toFixed(2)}%)
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => onOpenTickerInChart(pos.symbol)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <CandlestickChart className="w-3.5 h-3.5" />
                          <span>Ver Gráfico</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Position Box */}
        <div className="p-6 rounded-2xl bg-slate-900/85 border border-slate-800/90">
          <h2 className="text-sm font-bold text-white mb-1">
            Incorporar Nueva Posición a la Cartera
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Selecciona un activo, número de títulos y modalidad de ejecución en Trade Republic para seguir su valoración en tiempo real.
          </p>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Activo (Ticker)</label>
              <select
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {tickers.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.symbol} — {t.name} ({t.priceEur.toFixed(2)} €)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Número de Títulos</label>
              <input
                type="number"
                min={1}
                max={10000}
                value={newShares}
                onChange={(e) => setNewShares(Math.max(1, Number(e.target.value)))}
                className="w-32 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Modalidad de Ejecución</label>
              <select
                value={newOrderMode}
                onChange={(e) => setNewOrderMode(e.target.value as 'manual' | 'plan')}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="plan">Plan de Inversión Periódico (0,00 €)</option>
                <option value="manual">Orden Manual Directa (1,00 €)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => onAddTickerToPortfolio(newSymbol, newShares, newOrderMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Posición</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
