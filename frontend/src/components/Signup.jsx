import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('member'); // Default role
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await api.post('register/', { username, password, role });
            navigate('/login'); // Send them to login after successful creation
        } catch (err) {
            console.error("Signup failed", err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
                
                <input 
                    type="text" placeholder="Username" required
                    className="w-full mb-4 p-2 border rounded"
                    value={username} onChange={(e) => setUsername(e.target.value)} 
                />
                <input 
                    type="password" placeholder="Password" required
                    className="w-full mb-4 p-2 border rounded"
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                />
                <select 
                    className="w-full mb-6 p-2 border rounded"
                    value={role} onChange={(e) => setRole(e.target.value)}
                >
                    <option value="member">Team Member</option>
                    <option value="admin">Project Admin</option>
                </select>
                
                <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
                    Sign Up
                </button>
            </form>
        </div>
    );
}