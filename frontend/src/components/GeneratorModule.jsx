import React, { useEffect, useRef, useState } from 'react';
import { PrinterIcon, BoltIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { useGenerate } from '../hooks/useGenerate';
import { useToast } from './ui/RetroToast';

function formatCardNumber(num) {
  return num.replace(/(.{4})/g, '$1 ').trim();
}

function formatExp(month, year) {
  const m = String(month).padStart(2, '0');
  const y = String(year).slice(-2);
  return `${m}/${y}`;
}

function cardsToCSV(cards) {
  const header = 'number,exp_month,exp_year,cvv,brand,type';
  const rows = cards.map(
    (c) => `${c.number},${c.exp_month},${c.exp_year},${c.cvv},${c.brand},${c.type}`
  );
  return [header, ...rows].join('\n');
}

export const GeneratorModule = () => {
  const [count, setCount] = useState(10);
  const [brand, setBrand] = useState('visa');
  const [cardType, setCardType] = useState('credit');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bin, setBin] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const { cards, loading, error, generate, clearCards } = useGenerate();
  const prevCardCountRef = useRef(0);
  const { success, error: notifyError, info } = useToast();

  useEffect(() => {
    if (!error) return;
    notifyError('Generation failed', typeof error === 'string' ? error : JSON.stringify(error));
  }, [error]);

  useEffect(() => {
    if (cards.length <= prevCardCountRef.current) {
      prevCardCountRef.current = cards.length;
      return;
    }

    const newCards = cards.length - prevCardCountRef.current;
    prevCardCountRef.current = cards.length;
    success('Cards generated', `${newCards} new cards added to console`);
  }, [cards]);

  async function handleGenerate() {
    const safeCount = Math.max(1, Math.min(50, count));
    const payload = {};
    if (bin.trim()) payload.bin = bin.trim();
    if (expMonth.trim() || expYear.trim()) {
      payload.exp_month = parseInt(expMonth, 10);
      payload.exp_year = parseInt(expYear, 10);
    }
    if (cvv.trim()) payload.cvv = cvv.trim();
    await generate(safeCount, brand, cardType, payload);
  }

  function handleCopyAll() {
    if (cards.length === 0) return;
    const text = cards
      .map((c) => `${formatCardNumber(c.number)} | ${formatExp(c.exp_month, c.exp_year)} | ${c.cvv}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    success('Card batch copied', `${cards.length} cards copied to clipboard`);
  }

  function handleDownloadCSV() {
    if (cards.length === 0) return;
    const csv = cardsToCSV(cards);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardsentry_generated_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success('CSV downloaded', `${cards.length} cards exported`);
  }

  function handleClearConsole() {
    clearCards();
    info('Console cleared');
  }

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end border-b border-surface-container-high pb-4 w-full">
        <div>
          <h1 className="text-display-lg font-display uppercase tracking-tighter text-white leading-none mb-1">Card Generator</h1>
          <p className="text-label-md font-mono text-gray-500 uppercase">Generate Luhn-valid test cards for development</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-label-md font-mono text-gray-500 uppercase">GENERATED</span>
          <span className="text-primary font-mono text-lg">{cards.length}</span>
        </div>
      </header>

      {/* Generator Form */}
      <div className="bg-surface-container noise-overlay clip-punch outline-variant border border-outline-variant p-8 relative flex flex-col lg:flex-row gap-8 lg:gap-16 max-w-5xl mx-auto">
        {/* Left Side: Setup */}
        <div className="flex-1 space-y-8">
          <div>
            <label className="text-label-md font-mono text-gray-400 uppercase tracking-widest mb-2 block">QUANTITY</label>
            <div className="relative">
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
                min={1}
                max={50}
                className="w-full bg-surface-container-lowest text-primary text-4xl font-mono p-4 outline-none border border-outline-variant"
              />
              <div className="flex justify-between text-[0.65rem] font-mono text-gray-600 mt-1 uppercase">
                <span>MIN: 01</span>
                <span>MAX: 50</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 uppercase tracking-widest text-xs font-mono">BRAND</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-surface-container-lowest text-primary font-mono text-sm p-3 outline-none border border-outline-variant cursor-pointer appearance-none"
              >
                <option value="visa">VISA</option>
                <option value="mastercard">MASTERCARD</option>
                <option value="amex">AMEX</option>
                <option value="discover">DISCOVER</option>
                <option value="jcb">JCB</option>
                <option value="diners_club">DINER'S CLUB</option>
                <option value="maestro">MAESTRO</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 uppercase tracking-widest text-xs font-mono">TYPE</label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full bg-surface-container-lowest text-primary font-mono text-sm p-3 outline-none border border-outline-variant cursor-pointer appearance-none"
              >
                <option value="credit">CREDIT</option>
                <option value="debit">DEBIT</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
            >
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 uppercase tracking-widest text-xs font-mono">BIN</label>
                  <input
                    type="text"
                    value={bin}
                    onChange={(e) => setBin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="e.g. 453211"
                    className="w-full bg-surface-container-lowest text-primary font-mono text-sm p-3 outline-none border border-outline-variant"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 uppercase tracking-widest text-xs font-mono">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="3 or 4 digits"
                    className="w-full bg-surface-container-lowest text-primary font-mono text-sm p-3 outline-none border border-outline-variant"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 uppercase tracking-widest text-xs font-mono">EXP MONTH</label>
                  <input
                    type="number"
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                    min={1}
                    max={12}
                    placeholder="MM"
                    className="w-full bg-surface-container-lowest text-primary font-mono text-sm p-3 outline-none border border-outline-variant"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 uppercase tracking-widest text-xs font-mono">EXP YEAR</label>
                  <input
                    type="number"
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    min={2000}
                    max={2100}
                    placeholder="YYYY"
                    className="w-full bg-surface-container-lowest text-primary font-mono text-sm p-3 outline-none border border-outline-variant"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Action */}
        <div className="w-full lg:w-72 space-y-6 pt-4 flex flex-col justify-end">
          <Button
            variant="success"
            className="w-full py-4 text-lg flex items-center justify-center gap-2"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'GENERATING...' : 'EXECUTE_BATCH'} <BoltIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Console Output */}
      {cards.length > 0 && (
        <div className="max-w-5xl mx-auto pt-8">
          <h3 className="flex items-center gap-3 text-label-md font-mono text-gray-300 uppercase tracking-widest mb-4">
            <PrinterIcon className="w-5 h-5" />
            CONSOLE OUTPUT // {cards.length} CARDS
            <span className="flex-1 border-t border-dashed border-surface-container-high ml-4 block" />
          </h3>

          <div className="border border-surface-container-high bg-[#0a0a09] p-6 lg:p-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 font-mono text-sm text-primary tracking-wider leading-loose max-h-96 overflow-y-auto">
              {cards.map((card, idx) => (
                <div key={idx} className="flex justify-between hover:bg-surface-container px-2 -mx-2 transition cursor-default">
                  <span>{formatCardNumber(card.number)}</span>
                  <span className="text-gray-500">{formatExp(card.exp_month, card.exp_year)} | {card.cvv}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <Button variant="secondary" className="text-xs py-1 px-4 border border-outline-variant" onClick={handleCopyAll}>COPY_ALL</Button>
              <Button variant="secondary" className="text-xs py-1 px-4 border border-outline-variant" onClick={handleDownloadCSV}>DOWNLOAD_CSV</Button>
              <Button variant="secondary" className="text-xs py-1 px-4 border border-tertiary text-tertiary bg-transparent hover:bg-tertiary/10" onClick={handleClearConsole}>CLEAR_CONSOLE</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
