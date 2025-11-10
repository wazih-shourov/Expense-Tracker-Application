import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface OnboardingStep3Props {
  onComplete: (currency: string) => void;
}
const currencies = [{
  code: 'USD',
  name: 'US Dollar',
  symbol: '$'
}, {
  code: 'EUR',
  name: 'Euro',
  symbol: '€'
}, {
  code: 'GBP',
  name: 'British Pound',
  symbol: '£'
}, {
  code: 'CAD',
  name: 'Canadian Dollar',
  symbol: 'C$'
}, {
  code: 'AUD',
  name: 'Australian Dollar',
  symbol: 'A$'
}, {
  code: 'JPY',
  name: 'Japanese Yen',
  symbol: '¥'
}, {
  code: 'CHF',
  name: 'Swiss Franc',
  symbol: 'CHF'
}, {
  code: 'CNY',
  name: 'Chinese Yuan',
  symbol: '¥'
}, {
  code: 'INR',
  name: 'Indian Rupee',
  symbol: '₹'
}, {
  code: 'BRL',
  name: 'Brazilian Real',
  symbol: 'R$'
}, {
  code: 'KRW',
  name: 'South Korean Won',
  symbol: '₩'
}, {
  code: 'SGD',
  name: 'Singapore Dollar',
  symbol: 'S$'
}, {
  code: 'HKD',
  name: 'Hong Kong Dollar',
  symbol: 'HK$'
}, {
  code: 'NOK',
  name: 'Norwegian Krone',
  symbol: 'kr'
}, {
  code: 'SEK',
  name: 'Swedish Krona',
  symbol: 'kr'
}, {
  code: 'DKK',
  name: 'Danish Krone',
  symbol: 'kr'
}, {
  code: 'PLN',
  name: 'Polish Zloty',
  symbol: 'zł'
}, {
  code: 'CZK',
  name: 'Czech Koruna',
  symbol: 'Kč'
}, {
  code: 'HUF',
  name: 'Hungarian Forint',
  symbol: 'Ft'
}, {
  code: 'RON',
  name: 'Romanian Leu',
  symbol: 'lei'
}, {
  code: 'BDT',
  name: 'Bangladeshi Taka',
  symbol: '৳'
}];
const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  onComplete
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onComplete(selectedCurrency);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };
  return <div className="max-w-md mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Currency</h1>
        <p className="text-gray-600">Select your preferred currency for tracking expenses</p>
        <div className="mt-4">
          <span className="text-sm text-gray-500">Step 3 of 3</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="currency">Primary Currency</Label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">This will be used to display all amounts in your dashboard</p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Setting up...' : 'Complete Setup'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button type="button" onClick={() => onComplete('USD')} className="text-gray-500 hover:text-gray-700" disabled={loading}>If you stuck at here, please reload the page or reopen the app</button>
      </div>
    </div>;
};
export default OnboardingStep3;