import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContexts';


export const useAuth = () => {
  return useContext(AuthContext);
};
