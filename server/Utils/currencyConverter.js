import ApiError from "./ApiError.js";

const hardcodeConversion = {
    "INR-USD" : 0.012,
    "USD-INR" : 85.59
}

const currencyConverter = (amount, fromCurrency, toCurrency) => {
    let key = `${fromCurrency}-${toCurrency}`;
    let rate = hardcodeConversion[key];
    if (rate === undefined) {
        throw new ApiError(401, "Invalid conversion value");
    }
    return amount * rate;
}

export default currencyConverter;