import PropTypes from 'prop-types';
import { createContext, useState } from 'react';

// ----------------------------------------------------------------------

const initialPermission = JSON.parse(localStorage.getItem('permission')) && {};

const initialState = {
    permission: initialPermission ? initialPermission.name : "",
    permissionChange: () => {},
};

const PermissionContext = createContext(initialState);

PermissionProvider.propTypes = {
  children: PropTypes.node
};

function PermissionProvider({ children }) {
    const [permission, setPermission] = useState(initialState.permission);

  const permissionChangeHandler = (selectedPermission) => {
    setPermission(selectedPermission);
  };

  return (
    <PermissionContext.Provider
      value={{
        permission: permission,
        permissionChange: permissionChangeHandler,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export { PermissionContext, PermissionProvider };
