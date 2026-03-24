import React, { useEffect, useRef, useState } from 'react';
import { CreditCardIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useValidate } from '../hooks/useValidate';
import { useToast } from './ui/RetroToast';

function parseCardLines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length < 3) return null;

      const number = parts[0].replace(/\s+/g, '');
      const expParts = parts[1].split('/').map((s) => s.trim());
      if (expParts.length !== 2) return null;

      const exp_month = parseInt(expParts[0], 10);
      let exp_year = parseInt(expParts[1], 10);
      if (exp_year < 100) exp_year += 2000;

      const cvv = parts[2];
      if (!number || isNaN(exp_month) || isNaN(exp_year) || !cvv) return null;

      return { number, exp_month, exp_year, cvv };
    })
    .filter(Boolean);
}

function parseCsvCards(text) {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) return [];

  const header = rows[0].toLowerCase();
  const hasHeader =
    header.includes('number') ||
    header.includes('exp_month') ||
    header.includes('exp_year') ||
    header.includes('cvv');

  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows
    .map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      if (cols.length < 4) return null;

      const number = cols[0].replace(/\s+/g, '');
      const exp_month = parseInt(cols[1], 10);
      let exp_year = parseInt(cols[2], 10);
      const cvv = cols[3];

      if (exp_year < 100) exp_year += 2000;
      if (!number || isNaN(exp_month) || isNaN(exp_year) || !cvv) return null;

      return { number, exp_month, exp_year, cvv };
    })
    .filter(Boolean);
}

function cardsToInputText(cards) {
  return cards
    .map((card) => `${card.number} | ${String(card.exp_month).padStart(2, '0')}/${String(card.exp_year).slice(-2)} | ${card.cvv}`)
    .join('\n');
}

function formatNumber(num) {
  return num.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(month, year) {
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
}

function brandIcon(brand) {
  if (brand === 'amex') return <ShieldCheckIcon className="w-5 h-5 text-gray-400" />;
  return <CreditCardIcon className="w-5 h-5 text-gray-400" />;
}

export const ValidatorModule = () => {
  const [input, setInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [scanTotal, setScanTotal] = useState(0);
  const fileInputRef = useRef(null);
  const { results, loading, error, validate, clearResults } = useValidate();
  const { success, error: notifyError, info } = useToast();

  useEffect(() => {
    if (!error) return;
    notifyError('Validation failed', typeof error === 'string' ? error : JSON.stringify(error));
  }, [error]);

  useEffect(() => {
    if (loading || results.length === 0) return;
    const validCount = results.filter(
      (result) => result.valid_luhn && result.valid_exp && result.valid_cvv && result.valid_external === true
    ).length;
    const localOnlyCount = results.filter(
      (result) =>
        result.valid_luhn &&
        result.valid_exp &&
        result.valid_cvv &&
        (result.valid_external === null || typeof result.valid_external === 'undefined')
    ).length;
    success('Scan complete', `${validCount}/${results.length} cards passed all checks (${localOnlyCount} local-only)`);
  }, [loading, results]);

  async function copyCard(result) {
    const cardLine = `${formatNumber(result.number)} | ${formatExpiry(result.exp_month, result.exp_year)} | ${result.cvv}`;
    await navigator.clipboard.writeText(cardLine);
    success('Card copied', 'Card line copied to clipboard');
  }

  async function processFile(file) {
    const allowedExt = ['txt', 'csv'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExt.includes(extension)) {
      notifyError('Unsupported file type', 'Please use a .txt or .csv file.');
      return;
    }

    const text = await file.text();
    const parsed = extension === 'csv' ? parseCsvCards(text) : parseCardLines(text);

    if (parsed.length === 0) {
      notifyError('No valid card rows found', 'Expected format: number | MM/YY | CVV or CSV columns number,exp_month,exp_year,cvv');
      return;
    }

    setInput(cardsToInputText(parsed));
    success('Card list imported', `${parsed.length} rows loaded from ${file.name}`);
  }

  async function handleFileInputChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await processFile(file);
    } catch (err) {
      notifyError('File import failed', err?.message || 'Could not parse the file.');
    } finally {
      e.target.value = '';
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragOver(false);
  }

  async function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      await processFile(file);
    } catch (err) {
      notifyError('File import failed', err?.message || 'Could not parse the dropped file.');
    }
  }

  async function handleScan() {
    const cards = parseCardLines(input);
    if (cards.length === 0) {
      info('No valid cards found', 'Use format: number | MM/YY | CVV');
      return;
    }
    setScanTotal(cards.length);
    await validate(cards);
  }

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end border-b border-surface-container-high pb-4">
        <div>
          <h1 className="text-display-lg font-display uppercase tracking-tighter text-white">Card_Validation_Module</h1>
          <p className="text-label-md font-mono text-gray-500 mt-2 uppercase">Input Card Datasets for Verification Scan</p>
        </div>
        {loading && scanTotal > 0 ? (
          <div className="text-label-md font-mono text-primary bg-surface-container border border-primary/60 px-3 py-1 uppercase">
            VALIDATED: {results.length} OF {scanTotal}
          </div>
        ) : results.length > 0 && (
          <div className="text-label-md font-mono text-gray-400 bg-surface-container border border-outline-variant px-3 py-1">
            RESULTS: {results.length}
          </div>
        )}
      </header>

      {/* Input Area */}
      <div className="relative">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-4 border border-dashed p-3 font-mono text-xs uppercase tracking-wider transition-colors ${
            isDragOver ? 'border-primary text-primary bg-primary/10' : 'border-outline-variant text-gray-500 bg-surface-container-lowest'
          }`}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span>Drop .txt/.csv file here to populate card list</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-left md:text-right text-primary hover:text-secondary transition-colors"
            >
              Or click to browse
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-48 bg-surface-container-lowest text-secondary font-mono text-sm p-6 outline-none transition-shadow focus:shadow-glow focus:ring-1 focus:ring-primary border border-outline-variant resize-none"
          placeholder={"[ENTER_CARD_DATA_STREAM_HERE]\nFORMAT: number | MM/YY | CVV\nEX: 4532 1100 4452 9901 | 12/26 | 993\nEX: 5412 7500 0012 3341 | 10/25 | 112"}
        />
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex justify-center w-full gap-4">
          <Button
            variant="primary"
            className="text-lg px-12 py-3"
            onClick={handleScan}
            disabled={loading || !input.trim()}
          >
            {loading ? 'SCANNING...' : 'EXECUTE_SCAN'}
          </Button>
          {results.length > 0 && (
            <Button
              variant="ghost"
              className="text-sm px-4 py-3"
              onClick={() => { clearResults(); setInput(''); setScanTotal(0); }}
            >
              CLEAR
            </Button>
          )}
        </div>
      </div>

      {/* Scan Results */}
      {results.length > 0 && (
        <div className="pt-8">
          <h2 className="text-center text-label-md font-mono text-gray-400 tracking-[0.3em] uppercase mb-8">
            Scan_Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, idx) => {
              const localValid = result.valid_luhn && result.valid_exp && result.valid_cvv;
              const externalKnown = result.valid_external === true || result.valid_external === false;
              const externalValid = result.valid_external === true;
              const isValid = localValid && externalValid;
              const status = isValid ? 'VALID' : localValid && !externalKnown ? 'LOCAL_ONLY' : 'INVALID';
              const brand = (result.brand || 'unknown').toUpperCase();
              const errors = [];
              if (!result.valid_luhn) errors.push('LUHN_FAIL');
              if (!result.valid_exp) errors.push('EXP_INVALID');
              if (!result.valid_cvv) errors.push('CVV_INVALID');
              if (result.valid_external === false) errors.push('EXTERNAL_FAIL');
              if (localValid && !externalKnown) errors.push('EXTERNAL_UNAVAILABLE');

              return (
                <Card
                  key={idx}
                  className={`p-6 relative overflow-hidden border-l-4 ${
                    isValid ? 'border-l-secondary' : status === 'LOCAL_ONLY' ? 'border-l-primary' : 'border-l-tertiary text-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6 w-full">
                    <span className={`px-2 py-1 text-xs font-mono border ${
                      isValid ? 'border-secondary text-secondary' : status === 'LOCAL_ONLY' ? 'border-primary text-primary' : 'border-tertiary text-tertiary'
                    }`}>
                      STATUS: {status}
                    </span>
                    {isValid || status === 'LOCAL_ONLY' ? brandIcon(result.brand) : <ExclamationTriangleIcon className="w-5 h-5 text-tertiary" />}
                  </div>

                  <div className="space-y-4">
                    <div className={`font-mono text-base tracking-wider ${status === 'INVALID' ? 'text-gray-500' : 'text-gray-200'}`}>
                      <div>NUMBER: <span className="text-white">{formatNumber(result.number)}</span></div>
                      <div>EXP: <span className="text-white">{formatExpiry(result.exp_month, result.exp_year)}</span></div>
                      <div>CVV: <span className="text-white">{result.cvv}</span></div>
                    </div>

                    <div className="flex justify-between text-xs font-mono text-gray-400 font-bold uppercase pt-2">
                      <span>BRAND: {brand}</span>
                      {errors.length > 0 ? (
                        <span className="text-tertiary">ERR: {errors.join(', ')}</span>
                      ) : (
                        <span className="text-secondary">ALL_CHECKS_PASS</span>
                      )}
                    </div>

                    {result.bin && (
                      <div className="text-[0.65rem] font-mono text-gray-500 uppercase border-t border-surface-container-high pt-4 mt-4 space-y-1">
                        <div>SCHEME: {result.bin.scheme || '—'}</div>
                        <div>BIN BRAND: {result.bin.brand || '—'}</div>
                        <div>BIN TYPE: {result.bin.type || '—'}</div>
                        <div>COUNTRY: {result.bin.country || '—'}</div>
                        <div>BANK: {result.bin.bank || '—'}</div>
                      </div>
                    )}

                    {!result.bin && (
                      <div className="flex justify-between text-[0.65rem] font-mono text-gray-600 uppercase border-t border-surface-container-high pt-4 mt-4">
                        <span>BIN: {result.number.slice(0, 6)}</span>
                        <span>BRAND: {brand}</span>
                      </div>
                    )}

                    <div className="border-t border-surface-container-high pt-4 mt-4 flex justify-between items-center">
                      <span className="text-[0.65rem] font-mono uppercase text-gray-500">
                        EXT: {result.external_status || 'n/a'}
                      </span>
                      <Button
                        variant="secondary"
                        className="text-xs py-1 px-3 border border-outline-variant"
                        onClick={() => copyCard(result)}
                      >
                        COPY_CARD
                      </Button>
                    </div>

                    {result.external_issues?.length > 0 && (
                      <div className="text-[0.65rem] font-mono text-tertiary uppercase">
                        {result.external_issues.join(' | ')}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
