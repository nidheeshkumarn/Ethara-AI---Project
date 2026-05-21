import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; // We will create this next

// The Bouncer: Checks if the user is logged in
const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    
    // If no user is found in context, send them to the login page.
    // 'replace' prevents them from hitting the back button and returning here.
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default function App() {
    return (
        // Wrap everything in AuthProvider so the user state is available everywhere
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Route */}
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}