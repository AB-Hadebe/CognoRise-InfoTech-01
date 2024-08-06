// API URLs
const currencyApiUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
const countriesApiUrl = 'https://restcountries.com/v3.1/all';

// Fetch country data and map to currencies
async function fetchCountryData() {
    try {
        const response = await fetch(countriesApiUrl);
        const countries = await response.json();
        const countryCurrencyMap = {};

        countries.forEach(country => {
            if (country.currencies) {
                Object.keys(country.currencies).forEach(currency => {
                    if (!countryCurrencyMap[currency]) {
                        countryCurrencyMap[currency] = [];
                    }
                    countryCurrencyMap[currency].push({
                        name: country.name.common,
                        flag: country.flags.svg,
                        officialName: country.name.official
                    });
                });
            }
        });

        return countryCurrencyMap;
    } catch (error) {
        console.error('Error fetching country data:', error);
        return {};
    }
}

// Fetch currency rates and populate dropdowns with flags
async function fetchCurrencies() {
    try {
        const countryCurrencyMap = await fetchCountryData();
        const response = await fetch(currencyApiUrl);
        const data = await response.json();
        const currencies = Object.keys(data.rates);

        const fromCurrencySelect = document.getElementById('from-currency');
        const toCurrencySelect = document.getElementById('to-currency');

        currencies.forEach(currency => {
            const countries = countryCurrencyMap[currency];
            if (countries) {
                countries.forEach(country => {
                    const optionFrom = document.createElement('option');
                    optionFrom.value = currency;
                    optionFrom.innerHTML = `<img src="${country.flag}" class="dropdown-flag"> ${currency} - ${country.name}`;
                    fromCurrencySelect.appendChild(optionFrom);

                    const optionTo = document.createElement('option');
                    optionTo.value = currency;
                    optionTo.innerHTML = `<img src="${country.flag}" class="dropdown-flag"> ${currency} - ${country.name}`;
                    toCurrencySelect.appendChild(optionTo);
                });
            }
        });
    } catch (error) {
        console.error('Error fetching currencies:', error);
    }
}

// Perform currency conversion
document.getElementById('converter-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;

    try {
        const response = await fetch(currencyApiUrl);
        const data = await response.json();
        const rate = data.rates[toCurrency];
        const convertedAmount = amount * rate;

        const countryCurrencyMap = await fetchCountryData();
        const fromCountries = countryCurrencyMap[fromCurrency];
        const toCountries = countryCurrencyMap[toCurrency];

        const fromCountry = fromCountries ? fromCountries[0] : { flag: '', name: fromCurrency };
        const toCountry = toCountries ? toCountries[0] : { flag: '', name: toCurrency };

        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `<img src="${fromCountry.flag}" class="result-flag"> ${amount} ${fromCurrency} = <img src="${toCountry.flag}" class="result-flag"> ${convertedAmount.toFixed(2)} ${toCurrency}`;
    } catch (error) {
        console.error('Error converting currency:', error);
    }
});


fetchCurrencies();
