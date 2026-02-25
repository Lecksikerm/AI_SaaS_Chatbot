import { useEffect, useState, useRef, useCallback } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function Payment() {
    const { user, api, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [plans, setPlans] = useState({});
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [polling, setPolling] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Refs for polling management
    const pollingIntervalRef = useRef(null);
    const pollingAttemptsRef = useRef(0);
    const MAX_POLLING_ATTEMPTS = 60;

    // Paystack config - must be memoized to prevent re-renders
    const paystackConfig = {
        reference: paymentData?.reference || '',
        email: user?.email || '',
        amount: paymentData ? plans[selectedPlan]?.price : 0,
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    };

    // Initialize Paystack hook
    const initializePaystack = usePaystackPayment(paystackConfig);

    // Check for reference in URL (callback from Paystack)
    useEffect(() => {
        const reference = searchParams.get('reference');
        if (reference) {
            verifyPayment(reference);
        }
        loadPlans();

        return () => stopPolling();
    }, []);

    const loadPlans = async () => {
        try {
            const res = await api.get('/payments/plans');
            setPlans(res.data.plans);
        } catch (err) {
            setError('Failed to load plans');
        }
    };

    const initializePayment = async (planKey) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post(`/payments/initialize?plan=${planKey}`);
            const data = res.data;

            // Set payment data first
            setPaymentData(data);
            setSelectedPlan(planKey);

            // Start polling for payment status
            startPolling(data.reference);

        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to initialize payment');
        } finally {
            setLoading(false);
        }
    };

    const startPolling = (reference) => {
        stopPolling();
        setPolling(true);
        pollingAttemptsRef.current = 0;

        console.log('Starting payment polling for:', reference);

        pollingIntervalRef.current = setInterval(async () => {
            pollingAttemptsRef.current++;

            try {
                const res = await api.get(`/payments/verify/${reference}`);

                if (res.data.status === 'success') {
                    stopPolling();
                    handlePaymentSuccess(res.data);
                    return;
                }
            } catch (err) {
                console.log(`Polling attempt ${pollingAttemptsRef.current}: Payment not confirmed yet`);
            }

            if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
                stopPolling();
                setError('Payment verification timed out. If you completed payment, please click "Verify Payment" below or check back later.');
            }
        }, 5000);
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setPolling(false);
    };

    const handlePaymentSuccess = async (data) => {
        setSuccess(data.message || 'Payment successful! Upgrading your account...');
        await refreshUser();
        setTimeout(() => navigate('/chat'), 2000);
    };

    const verifyPayment = async (reference) => {
        setVerifying(true);
        setError(null);

        try {
            const res = await api.get(`/payments/verify/${reference}`);
            await handlePaymentSuccess(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Payment verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const onPaystackSuccess = useCallback((reference) => {
        console.log('Paystack success:', reference);
        stopPolling();
        verifyPayment(reference.reference);
    }, []);

    const onPaystackClose = useCallback(() => {
        console.log('Paystack popup closed');
        // Keep polling running - user might pay via other methods
    }, []);

    const handlePay = () => {
        if (!paymentData) {
            setError('Payment not initialized. Please select a plan first.');
            return;
        }

        if (!paystackConfig.publicKey) {
            setError('Payment configuration error. Please refresh the page.');
            return;
        }

        console.log('Opening Paystack with config:', {
            reference: paystackConfig.reference,
            email: paystackConfig.email,
            amount: paystackConfig.amount,
        });

        // Call the initialize function returned by the hook
        initializePaystack(onPaystackSuccess, onPaystackClose);
    };

    const handleManualVerify = () => {
        if (paymentData?.reference) {
            verifyPayment(paymentData.reference);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-[#343541] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-[#10a37f] mx-auto mb-4" />
                    <h2 className="text-xl text-white">Verifying payment...</h2>
                    <p className="text-gray-400 mt-2">Please wait while we confirm your upgrade</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#343541] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-2">Upgrade to Pro</h1>
                <p className="text-gray-400 text-center mb-8">Unlock more messages and premium features</p>

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg mb-6 text-center">
                        <Check size={24} className="mx-auto mb-2" />
                        {success}
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {polling && !success && (
                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-lg mb-6">
                        <div className="flex items-center gap-3">
                            <RefreshCw size={20} className="animate-spin" />
                            <div className="flex-1">
                                <p className="font-medium">Waiting for payment confirmation...</p>
                                <p className="text-sm text-blue-300">
                                    Checking every 5 seconds. Attempt {pollingAttemptsRef.current}/{MAX_POLLING_ATTEMPTS}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(plans).map(([key, plan]) => (
                        <div
                            key={key}
                            className={`bg-[#40414f] p-6 rounded-lg border-2 cursor-pointer transition-all ${selectedPlan === key
                                ? 'border-[#10a37f]'
                                : 'border-transparent hover:border-gray-600'
                                }`}
                            onClick={() => !loading && !polling && initializePayment(key)}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Crown className="text-yellow-500" size={28} />
                                <h2 className="text-xl font-semibold">{plan.name}</h2>
                            </div>
                            <p className="text-4xl font-bold mb-2">
                                ₦{(plan.price / 100).toLocaleString()}
                            </p>
                            <p className="text-gray-400 mb-4">/{plan.interval}</p>

                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-center gap-2">
                                    <Check size={18} className="text-[#10a37f]" />
                                    <span className="font-semibold">
                                        {plan.message_limit?.toLocaleString()}
                                    </span> messages/month
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={18} className="text-[#10a37f]" />
                                    Priority support
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={18} className="text-[#10a37f]" />
                                    No usage limits
                                </li>
                            </ul>

                            {selectedPlan === key && loading && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-[#10a37f]">
                                    <Loader2 size={20} className="animate-spin" />
                                    Initializing...
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {paymentData && !success && (
                    <div className="mt-8 text-center bg-[#40414f] p-6 rounded-lg space-y-4">
                        <p className="text-gray-400 mb-4">Click below to complete payment</p>
                        <button
                            onClick={handlePay}
                            disabled={!paymentData || !paystackConfig.publicKey}
                            className="bg-[#10a37f] hover:bg-[#0d8c6d] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full"
                        >
                            Pay ₦{(plans[selectedPlan]?.price / 100).toLocaleString()} Now
                        </button>

                        {polling && (
                            <button
                                onClick={handleManualVerify}
                                className="text-sm text-[#10a37f] hover:text-[#0d8c6d] underline block w-full"
                            >
                                I've completed payment - verify now
                            </button>
                        )}

                        <p className="text-xs text-gray-500">
                            Secure payment powered by Paystack
                        </p>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/chat')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to Chat
                    </button>
                </div>
            </div>
        </div>
    );
}