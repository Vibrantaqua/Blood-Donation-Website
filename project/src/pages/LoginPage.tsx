import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AuthForm } from '../components/AuthForm';
import { apiClient } from '../utils/api';
import { setAuthToken, setUser } from '../utils/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const role = searchParams.get('role') as 'donor' | 'organizer' | null;

  useEffect(() => {
    if (!role) {
      navigate('/');
    }
  }, [role, navigate]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(credentials);
      
      if (response.success) {
        const { user, token } = response.data;
        
        if (user.role !== role) {
          setError(`Invalid credentials for ${role} account`);
          return;
        }

        setAuthToken(token);
        setUser(user);
        
        // Redirect based on role
        const redirectPath = user.role === 'donor' ? '/donor/dashboard' : '/organizer/dashboard';
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google login successful:', user);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Google login failed: ' + err.message);
    }
  };

  if (!role) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Sign in as {role === 'donor' ? 'Donor' : 'Organizer'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to={`/signup?role=${role}`} 
                  className="text-red-600 hover:text-red-500 font-medium"
                >
                  Create one here
                </Link>
              </p>
            </div>

            <AuthForm
              mode="login"
              role={role}
              onSubmit={handleLogin}
              loading={loading}
              error={error}
            />

            <div className="mt-6">
              <button 
                onClick={handleGoogleLogin} 
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Login with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};