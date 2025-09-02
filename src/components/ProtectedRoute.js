import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, allowRoles = [] }) {
  const { rol } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!allowRoles.includes(rol)) {
      router.push('/login');
    }
  }, [rol]);

  return allowRoles.includes(rol) ? children : null;
}
