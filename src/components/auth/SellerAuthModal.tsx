import React from 'react';
import { ArtisanOnboardingModal } from '../portal/ArtisanOnboardingModal';
import { useLanguage } from '../../lib/LanguageContext';

interface SellerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function SellerAuthModal({ isOpen, onClose }: SellerAuthModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <ArtisanOnboardingModal
      language={language}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
