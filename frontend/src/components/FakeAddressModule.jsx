import React, { useEffect, useMemo, useState } from 'react';
import { MapPinIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { useFakeAddress } from '../hooks/useFakeAddress';
import { useToast } from './ui/RetroToast';

function compactAddress(address) {
  if (!address) return '';
  return `${address.street}, ${address.city}${address.region ? `, ${address.region}` : ''} ${address.postal_code}, ${address.country}`.replace(/\s+/g, ' ').trim();
}

export const FakeAddressModule = () => {
  const {
    countries,
    identity,
    loadingCountries,
    loadingIdentity,
    error,
    fetchCountries,
    generateIdentity,
  } = useFakeAddress();
  const [country, setCountry] = useState('US');
  const { success, error: notifyError, info } = useToast();

  useEffect(() => {
    async function load() {
      const list = await fetchCountries();
      if (list.length === 0) return;
      const hasDefault = list.some((item) => item.code === 'US');
      const initial = hasDefault ? 'US' : list[0].code;
      setCountry(initial);
      await generateIdentity(initial);
    }

    load();
  }, []);

  useEffect(() => {
    if (!error) return;
    notifyError('Fake address error', error);
  }, [error]);

  useEffect(() => {
    if (!identity) return;
    info('Identity generated', `${identity.country} profile ready`);
  }, [identity]);

  const activeCountryName = useMemo(() => {
    return countries.find((item) => item.code === country)?.name || country;
  }, [countries, country]);

  async function handleCountryChange(e) {
    const next = e.target.value;
    setCountry(next);
    await generateIdentity(next);
  }

  async function handleRegenerate() {
    const result = await generateIdentity(country);
    if (result) {
      success('New profile generated', `Fresh ${result.country} identity created`);
    }
  }

  async function handleCopy() {
    if (!identity) return;
    const text = `${identity.full_name}\n${identity.address.formatted}`;
    await navigator.clipboard.writeText(text);
    success('Copied to clipboard', 'Name and address copied');
  }

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end border-b border-surface-container-high pb-4 w-full">
        <div>
          <h1 className="text-display-lg font-display uppercase tracking-tighter text-white leading-none mb-1">Fake Address Generator</h1>
          <p className="text-label-md font-mono text-gray-500 uppercase">Generate realistic test identities with country-specific formatting</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-label-md font-mono text-gray-500 uppercase">COUNTRY</span>
          <span className="text-primary font-mono text-lg">{activeCountryName}</span>
        </div>
      </header>

      <div className="bg-surface-container noise-overlay clip-punch outline-variant border border-outline-variant p-8 relative max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 uppercase tracking-widest text-xs font-mono">Country</label>
            <select
              value={country}
              onChange={handleCountryChange}
              disabled={loadingCountries || countries.length === 0}
              className="w-full bg-surface-container-lowest text-primary font-mono text-sm p-3 outline-none border border-outline-variant cursor-pointer appearance-none"
            >
              {countries.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="success"
            className="w-full lg:w-auto py-3 px-8"
            onClick={handleRegenerate}
            disabled={loadingIdentity || countries.length === 0}
          >
            {loadingIdentity ? 'GENERATING...' : 'REGENERATE'}
          </Button>
        </div>

        {identity && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-surface-container-high bg-[#0a0a09] p-6 space-y-3">
              <div className="text-xs uppercase tracking-widest text-gray-500 font-mono">Identity</div>
              <div className="flex items-center gap-2 text-white font-mono text-lg">
                <UserCircleIcon className="w-5 h-5 text-primary" />
                {identity.full_name}
              </div>
            </div>

            <div className="border border-surface-container-high bg-[#0a0a09] p-6 space-y-3">
              <div className="text-xs uppercase tracking-widest text-gray-500 font-mono">Address</div>
              <div className="flex items-start gap-2 text-gray-200 font-mono text-sm leading-6 whitespace-pre-line">
                <MapPinIcon className="w-5 h-5 text-primary mt-0.5" />
                {identity.address.formatted}
              </div>
            </div>
          </div>
        )}

        {identity && (
          <div className="flex justify-center gap-4">
            <Button variant="secondary" className="text-xs py-1 px-4 border border-outline-variant" onClick={handleCopy}>
              COPY_PROFILE
            </Button>
            <div className="text-[0.65rem] font-mono text-gray-500 uppercase self-center">
              {compactAddress(identity.address)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
