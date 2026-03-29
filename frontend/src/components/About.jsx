import React from 'react';
import { Card, CardHeader } from './ui/Card';

export const About = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-gray-300">
      <Card>
        <CardHeader title="/ ABOUT PERSONASENTRY" />
        <div className="p-6 space-y-4 text-sm leading-relaxed">
          <p>
            PersonaSentry is a retro-styled testing suite for payment QA and identity-safe sandbox workflows. It helps engineering and QA teams generate realistic test card data, validate payloads quickly, and simulate profile details for end-to-end checkout testing.
          </p>
          <p>
            Under the hood, PersonaSentry performs Luhn validation, card-brand detection from IIN ranges, and optional BIN enrichment so teams can verify card behavior with confidence before touching production systems.
          </p>
          <h3 className="text-secondary font-display text-lg mt-6">CORE MODULES</h3>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400">
            <li><strong className="text-gray-300">CARD FORGE:</strong> Create Luhn-valid test cards by issuer, type, quantity, and optional BIN constraints for repeatable test scenarios.</li>
            <li><strong className="text-gray-300">CARD VERIFY:</strong> Validate card structure, expiry format, CVV length, and network signals from one quick input flow.</li>
            <li><strong className="text-gray-300">IDENTITY LAB:</strong> Generate synthetic profile and address data by country to test shipping, onboarding, and fraud-precheck flows.</li>
          </ul>
          <p className="text-gray-400 pt-2">
            PersonaSentry is intended only for test environments and non-production workflows.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="/ CREDITS" />
        <div className="p-6 space-y-4 text-sm">
          <p>
            Built and Designed by <strong className="text-primary text-base">Yacine Dahmani</strong>.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-dim">GITHUB:</span>
            <a 
              href="https://github.com/YacineDahmani" 
              target="_blank" 
              rel="noreferrer"
              className="text-accent hover:text-primary transition-colors underline decoration-dim hover:decoration-primary"
            >
              https://github.com/YacineDahmani
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};