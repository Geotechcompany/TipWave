/**
 * Currency model schema structure
 * This represents the shape of currency documents in MongoDB
 */
export const CurrencySchema = {
  code: String,       // Currency code (e.g., "USD", "EUR")
  symbol: String,     // Currency symbol (e.g., "$", "€")
  name: String,       // Full currency name
  isDefault: Boolean, // Whether this is the default currency
  rate: Number,       // Exchange rate relative to base currency
  isActive: Boolean,  // Whether this currency is active
  createdAt: Date,
  updatedAt: Date
};

/**
 * Default currencies to initialize the system
 */
export const defaultCurrencies = [
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    isDefault: true,
    rate: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    isDefault: false,
    rate: 0.85,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    isDefault: false,
    rate: 0.72,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]; 