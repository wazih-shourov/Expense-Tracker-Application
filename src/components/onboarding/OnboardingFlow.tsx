
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleStep1Complete = (categories: string[]) => {
    setSelectedCategories(categories);
    setCurrentStep(2);
  };

  const handleStep2Complete = () => {
    setCurrentStep(3);
  };

  const handleOnboardingComplete = async (currency: string) => {
    try {
      // Mark user as onboarded and set currency
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarded: true,
          currency: currency
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      console.log('Onboarding completed with currency:', currency);

      toast({
        title: "Welcome to Frinance!",
        description: "Your account has been set up successfully."
      });

      // Use window.location to force a full page reload and refresh profile data
      window.location.href = '/';
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === 1 && (
        <OnboardingStep1 
          onComplete={handleStep1Complete}
          selectedCategories={selectedCategories}
        />
      )}
      {currentStep === 2 && (
        <OnboardingStep2 
          onComplete={handleStep2Complete}
          selectedCategories={selectedCategories}
        />
      )}
      {currentStep === 3 && (
        <OnboardingStep3 
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
};

export default OnboardingFlow;
