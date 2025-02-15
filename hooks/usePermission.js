import { useContext } from 'react';
import { PermissionContext } from '../contexts/PermissionContext';

// ----------------------------------------------------------------------

const usePermission = () => useContext(PermissionContext);

export default usePermission;
