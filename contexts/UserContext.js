'use client'
import PropTypes from 'prop-types';
import { createContext, useState, useEffect } from 'react';

// Function to safely get the initial user from localStorage
const getInitialUser = () => {
  if (typeof window !== "undefined") { // Ensure it's only executed on the client-side
    const storedUser = localStorage.getItem("loggedInUser");
    return storedUser ? JSON.parse(storedUser) : null;
  }
  return null;
};

const UserContext = createContext({
  user: null,
  userChange: () => {},
});

function UserProvider({ children }) {
  const [user, setUser] = useState(null); // Start with null to prevent SSR errors

  useEffect(() => {
    const initialUser = getInitialUser();
    setUser(initialUser);
  }, []); // Runs only on the client-side after component mounts

  const userChangeHandler = (selectedUser) => {
    setUser(selectedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("loggedInUser", JSON.stringify(selectedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, userChange: userChangeHandler }}>
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node,
};

export { UserContext, UserProvider };
