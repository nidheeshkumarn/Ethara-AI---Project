import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('login/', { username, password });
            login(response.data.access);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Team Login</h2>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                
                <input 
                    type="text" placeholder="Username" className="w-full mb-4 p-2 border rounded"
                    value={username} onChange={(e) => setUsername(e.target.value)} required 
                />
                <input 
                    type="password" placeholder="Password" className="w-full mb-6 p-2 border rounded"
                    value={password} onChange={(e) => setPassword(e.target.value)} required 
                />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4">
                    Login
                </button>

                {/* THE MISSING SIGNUP LINK */}
                <div className="text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up here</Link>
                </div>
            </form>
        </div>
    );
}