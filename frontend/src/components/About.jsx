import React from 'react';
import { Card, CardHeader } from './ui/Card';

export const About = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-gray-300">
      <Card>
        <CardHeader title="/ ABOUT CARD_SENTRY" />
        <div className="p-6 space-y-4 text-sm leading-relaxed">
          <p>
            CARD_SENTRY is a modern, retro-themed credit card generator and validator utility designed for developers and testers to easily validate test payment flows, generate mock credit card numbers, and ensure that their e-commerce configurations are working perfectly.
          </p>
          <p>
            It employs the Luhn algorithm to check the validity of credit card numbers, extracting the relevant card metadata such as the issuer network (Visa, MasterCard, Amex, etc.) based on the standard IIN (Issuer Identification Number) ranges.
          </p>
          <h3 className="text-secondary font-display text-lg mt-6">HOW IT WORKS</h3>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400">
            <li><strong className="text-gray-300">GENERATOR:</strong> Specify an issuer, formatting, and the amount of test cards you need. The generator will create valid (Luhn-compliant) test card numbers instantly for your sandbox environments.</li>
            <li><strong className="text-gray-300">VALIDATOR:</strong> Enter a card number to verify its Luhn compliance and determine its network. All processing happens locally in your browser – ensuring your data stays secure.</li>
          </ul>
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