import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
    } else {
      navigate('/');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="loading-container">
      <div className="loading-spinner">Completing login...</div>
    </div>
  );
}

