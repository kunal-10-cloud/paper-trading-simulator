import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/api'; 

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = searchParams.get('token');
            if (token) {
                try {
                    localStorage.setItem('token', token);

                    const { data } = await getMe();
                    login({ ...data, token }); 
                    navigate('/dashboard');
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    navigate('/login');
                }
            } else {
                navigate('/login');
            }
        };

        fetchUser();
    }, [searchParams, login, navigate]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-xl font-semibold">Authenticating...</div>
        </div>
    );
};

export default AuthSuccess;
