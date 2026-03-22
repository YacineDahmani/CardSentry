import React, { useState } from 'react';
import { CreditCardIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useValidate } from '../hooks/useValidate';

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

function formatNumber(num) {
  return num.replace(/(.{4})/g, '$1 ').trim();
}

function brandIcon(brand) {
  if (brand === 'amex') return <ShieldCheckIcon className="w-5 h-5 text-gray-400" />;
  return <CreditCardIcon className="w-5 h-5 text-gray-400" />;
}

export const ValidatorModule = () => {
  const [input, setInput] = useState('');
  const { results, loading, error, validate, clearResults } = useValidate();

  async function handleScan() {
    const cards = parseCardLines(input);
    if (cards.length === 0) return;
    await validate(cards);
  }

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end border-b border-surface-container-high pb-4">
        <div>
          <h1 className="text-display-lg font-display uppercase tracking-tighter text-white">Card_Validation_Module</h1>
          <p className="text-label-md font-mono text-gray-500 mt-2 uppercase">Input Card Datasets for Verification Scan</p>
        </div>
        {results.length > 0 && (
          <div className="text-label-md font-mono text-gray-400 bg-surface-container border border-outline-variant px-3 py-1">
            RESULTS: {results.length}
          </div>
        )}
      </header>

      {/* Input Area */}
      <div className="relative">
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
              onClick={() => { clearResults(); setInput(''); }}
            >
              CLEAR
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-tertiary font-mono text-sm bg-tertiary/10 border border-tertiary/30 p-4 mt-8 text-center">
          ERR: {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {/* Scan Results */}
      {results.length > 0 && (
        <div className="pt-8">
          <h2 className="text-center text-label-md font-mono text-gray-400 tracking-[0.3em] uppercase mb-8">
            Scan_Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, idx) => {
              const isValid = result.valid_luhn && result.valid_exp && result.valid_cvv;
              const status = isValid ? 'VALID' : 'INVALID';
              const last4 = result.number.slice(-4);
              const brand = (result.brand || 'unknown').toUpperCase();
              const errors = [];
              if (!result.valid_luhn) errors.push('LUHN_FAIL');
              if (!result.valid_exp) errors.push('EXP_INVALID');
              if (!result.valid_cvv) errors.push('CVV_INVALID');

              return (
                <Card key={idx} className={`p-6 relative overflow-hidden border-l-4 ${isValid ? 'border-l-secondary' : 'border-l-tertiary text-gray-500'}`}>
                  <div className="flex justify-between items-start mb-6 w-full">
                    <span className={`px-2 py-1 text-xs font-mono border ${
                      isValid ? 'border-secondary text-secondary' : 'border-tertiary text-tertiary'
                    }`}>
                      STATUS: {status}
                    </span>
                    {isValid ? brandIcon(result.brand) : <ExclamationTriangleIcon className="w-5 h-5 text-tertiary" />}
                  </div>

                  <div className="space-y-4">
                    <div className={`font-mono text-xl tracking-[0.2em] flex justify-between ${!isValid ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                      <span>****</span>
                      <span>****</span>
                      <span>****</span>
                      <span className={isValid ? 'text-white' : ''}>{last4}</span>
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
                      <div className="flex justify-between text-[0.65rem] font-mono text-gray-600 uppercase border-t border-surface-container-high pt-4 mt-4">
                        <span>SCHEME: {result.bin.scheme || '—'}</span>
                        <span>COUNTRY: {result.bin.country || '—'}</span>
                        <span>BANK: {result.bin.bank || '—'}</span>
                      </div>
                    )}

                    {!result.bin && (
                      <div className="flex justify-between text-[0.65rem] font-mono text-gray-600 uppercase border-t border-surface-container-high pt-4 mt-4">
                        <span>BIN: {result.number.slice(0, 6)}</span>
                        <span>BRAND: {brand}</span>
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
