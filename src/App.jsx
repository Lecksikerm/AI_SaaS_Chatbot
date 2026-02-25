import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Payment from './pages/Payment';  

function App() {
    return (
        <AuthProvider>
            <Router>
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