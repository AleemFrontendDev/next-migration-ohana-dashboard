'use client'
import PropTypes from 'prop-types';
import { createContext, useState, useEffect } from 'react';

// Function to safely get the initial country from localStorage
const getInitialCountry = () => {
  if (typeof window !== "undefined") { // Ensure it's only executed on the client-side
    const storedCountry = localStorage.getItem("selectedCountry");
    return storedCountry ? JSON.parse(storedCountry) : null;
  }
  return null;
};

const CountryContext = createContext({
  country: null,
  countryChange: () => {},
});

function CountryProvider({ children }) {
  const [country, setCountry] = useState(null); // Start with null to avoid SSR issues

  useEffect(() => {
    const initialCountry = getInitialCountry();
    setCountry(initialCountry ? initialCountry.id : "");
  }, []); // Runs only once when the component mounts

  const countryChangeHandler = (selectedCountry) => {
    setCountry(selectedCountry);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCountry", JSON.stringify(selectedCountry));
    }
  };

  return (
    <CountryContext.Provider value={{ country, countryChange: countryChangeHandler }}>
      {children}
    </CountryContext.Provider>
  );
}

CountryProvider.propTypes = {
  children: PropTypes.node,
};

export { CountryContext, CountryProvider };
