import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Payment from './pages/Payment';

// Keep-alive component to prevent Render cold start
const KeepAlive = () => {
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'https://ai-chatbot-58g6.onrender.com';

        // Ping backend immediately on load
        const pingBackend = async () => {
            try {
                const response = await fetch(`${API_URL}/health`, {
                    method: 'GET',
                    // Short timeout so it doesn't hang if server is down
                    signal: AbortSignal.timeout(5000)
                });
                if (response.ok) {
                    console.log('✅ Backend is warm');
                }
            } catch (err) {
                // Silent fail - don't break app if ping fails
                console.log('Backend ping failed (might be cold starting)');
            }
        };

        // Initial ping
        pingBackend();

        // Keep-alive ping every 4 minutes (Render sleeps after 15 min of inactivity)
        const interval = setInterval(pingBackend, 4 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return null;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                {/* Keep backend warm */}
                <KeepAlive />

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute>
                                <Chat />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment"
                        element={
                            <ProtectedRoute>
                                <Payment />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/chat" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;