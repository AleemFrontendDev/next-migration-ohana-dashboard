import { useContext } from 'react';
import { CountryContext } from '../contexts/CountryContext';

// ----------------------------------------------------------------------

const useCountry = () => useContext(CountryContext);

export default useCountry;
