import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronUpDownIcon,
  GlobeAltIcon,
  MapPinIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { useFakeAddress } from '../hooks/useFakeAddress';
import { useToast } from './ui/RetroToast';

const POPULAR_COUNTRY_CODES = [
  'US', 'GB', 'CA', 'AU',
  'DZ', 'MA', 'ZA',
  'BR', 'AR', 'CO',
  'IN', 'JP', 'CN', 'KR', 'SG', 'AE',
];

const REGION_BY_COUNTRY_CODE = {
  US: 'North America',
  CA: 'North America',
  MX: 'North America',
  BR: 'South America',
  AR: 'South America',
  CO: 'South America',
  CL: 'South America',
  PE: 'South America',
  DZ: 'Africa',
  MA: 'Africa',
  EG: 'Africa',
  NG: 'Africa',
  KE: 'Africa',
  ZA: 'Africa',
  IN: 'Asia',
  JP: 'Asia',
  CN: 'Asia',
  KR: 'Asia',
  ID: 'Asia',
  TH: 'Asia',
  VN: 'Asia',
  PH: 'Asia',
  SG: 'Asia',
  AE: 'Asia',
  GB: 'Europe',
  IE: 'Europe',
  DE: 'Europe',
  FR: 'Europe',
  ES: 'Europe',
  IT: 'Europe',
  NL: 'Europe',
  BE: 'Europe',
  AT: 'Europe',
  PT: 'Europe',
  PL: 'Europe',
  CZ: 'Europe',
  SE: 'Europe',
  NO: 'Europe',
  DK: 'Europe',
  CH: 'Europe',
  AU: 'Oceania',
  NZ: 'Oceania',
};

const REGION_ORDER = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Other'];

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
    clearIdentity,
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

  const groupedCountries = useMemo(() => {
    const groups = new Map(REGION_ORDER.map((region) => [region, []]));

    countries.forEach((item) => {
      const region = REGION_BY_COUNTRY_CODE[item.code] || 'Other';
      groups.get(region).push(item);
    });

    return REGION_ORDER
      .map((region) => ({ region, items: groups.get(region) }))
      .filter((group) => group.items.length > 0);
  }, [countries]);

  const popularCountries = useMemo(() => {
    return POPULAR_COUNTRY_CODES
      .map((code) => countries.find((item) => item.code === code))
      .filter(Boolean);
  }, [countries]);

  function handleCountrySelect(next) {
    setCountry(next);
    clearIdentity();
  }

  async function handleCountryChange(e) {
    handleCountrySelect(e.target.value);
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <label className="text-gray-400 uppercase tracking-widest text-xs font-mono">Country</label>
              <span className="text-[0.65rem] uppercase font-mono tracking-wider text-gray-500">
                {countries.length} available
              </span>
            </div>

            <div className="relative">
              <GlobeAltIcon className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={country}
                onChange={handleCountryChange}
                disabled={loadingCountries || countries.length === 0}
                className="w-full bg-surface-container-lowest text-primary font-mono text-sm py-3 pl-10 pr-10 outline-none border border-outline-variant cursor-pointer appearance-none transition-colors hover:border-primary focus:border-primary"
              >
                {groupedCountries.map((group) => (
                  <optgroup key={group.region} label={group.region}>
                    {group.items.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name} ({item.code})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronUpDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {popularCountries.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {popularCountries.map((item) => {
                  const active = item.code === country;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleCountrySelect(item.code)}
                      disabled={loadingCountries}
                      className={[
                        'px-2.5 py-1 text-[0.62rem] uppercase tracking-widest font-mono border transition-colors',
                        active
                          ? 'border-primary text-black bg-primary'
                          : 'border-outline-variant text-gray-400 hover:border-primary hover:text-primary',
                      ].join(' ')}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            variant="success"
            className="w-full lg:w-auto py-3 px-8"
            onClick={handleRegenerate}
            disabled={loadingIdentity || countries.length === 0}
          >
            {loadingIdentity ? 'GENERATING...' : identity ? 'REGENERATE' : 'GENERATE'}
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
