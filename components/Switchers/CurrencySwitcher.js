import { useState } from 'react';

// Define supported currencies
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'KES']; // Added KES

const CurrencySwitcher = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
    // You can also call a function or API here to handle currency conversion
    console.log('Currency changed to:', event.target.value);
  };

  return (
    <div>
      <label htmlFor="currency">Currency: </label>
      <select
        id="currency"
        value={selectedCurrency}
        onChange={handleCurrencyChange}
      >
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySwitcher;
