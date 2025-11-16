import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithCustomToken,
    signInAnonymously,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
// Importing icons from lucide-react for a modern look
import {
    LogIn, UserPlus, Mail, Lock, User, LogOut, Loader2,
    AlertTriangle, Sparkles, Server, XCircle, CheckCircle
} from 'lucide-react';

// --- Global Constants & Firebase Initialization ---

// Global constants provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Gemini API configuration
const API_MODEL = 'gemini-2.5-flash-preview-09-2025';
const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent`;
const API_KEY = ""; // Managed by the environment

// --- CRITICAL CONNECTION POINT ---
// Corrected URL: Matches your Spring Boot @RequestMapping("/expenses") + @GetMapping("/all")
const SPRING_BOOT_API_URL = 'http://localhost:8080/expenses/all';

// !!! CRITICAL SECURITY FLAW ACKNOWLEDGEMENT !!!
// This is required to satisfy your Spring Boot Basic Auth requirement.
// REPLACE THESE PLACEHOLDERS with a valid username and password from your Spring Security users.
const SPRING_BOOT_USERNAME = 'admin';
const SPRING_BOOT_PASSWORD = 'password';


let app, auth;

// --- Components ---

const LoginScreen = ({ authInstance }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const Icon = isRegisterMode ? UserPlus : LogIn;
    const Title = isRegisterMode ? 'Create Account' : 'Sign In';
    const ButtonText = isRegisterMode ? 'Register' : 'Log In';

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email || !password) {
            setError("Email and password are required.");
            setLoading(false);
            return;
        }

        try {
            if (isRegisterMode) {
                await createUserWithEmailAndPassword(authInstance, email, password);
            } else {
                await signInWithEmailAndPassword(authInstance, email, password);
            }
        } catch (err) {
            console.error('Authentication Error:', err);
            let message = "An unexpected error occurred.";
            if (err.code.includes('email')) {
                message = "Invalid email format or user not found.";
            } else if (err.code.includes('wrong-password') || err.code.includes('invalid-credential')) {
                message = "Invalid email or password.";
            } else if (err.code.includes('weak-password')) {
                message = "Password must be at least 6 characters.";
            } else if (err.code.includes('email-already-in-use')) {
                message = "This email address is already registered.";
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-6 sm:p-8 bg-white shadow-2xl rounded-xl transition-all duration-300">
            <div className="flex justify-center mb-6">
                <Icon className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">{Title}</h2>

            <form onSubmit={handleAuth} className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        disabled={loading}
                        aria-label="Email Address"
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        disabled={loading}
                        aria-label="Password"
                    />
                </div>

                {error && (
                    <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full flex justify-center items-center px-4 py-3 text-lg font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-60"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="animate-spin mr-2 w-5 h-5" />
                    ) : (
                        <Icon className="mr-2 w-5 h-5" />
                    )}
                    {ButtonText}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                {isRegisterMode ? 'Already have an account?' : 'Need an account?'}
                <button
                    onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setError(null);
                    }}
                    type="button"
                    className="ml-2 font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
                    disabled={loading}
                >
                    {isRegisterMode ? 'Sign In' : 'Register Now'}
                </button>
            </p>
        </div>
    );
};


// --- Spring Boot Data Fetch Component (MODIFIED FOR BASIC AUTH AND RETRY) ---

const ExpensesDashboard = ({ userId }) => {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Encode credentials for Basic Auth
    const base64Credentials = btoa(`${SPRING_BOOT_USERNAME}:${SPRING_BOOT_PASSWORD}`);


    useEffect(() => {
        if (!userId) return;

        const fetchExpenses = async () => {
            setIsLoading(true);
            setError(null);

            const headers = {
                'Content-Type': 'application/json',
                // This header attempts to satisfy Spring Security's Basic Auth requirement
                'Authorization': `Basic ${base64Credentials}`
            };

            const maxRetries = 3;
            let lastError = null;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    // Detailed log to help debug connection issues
                    console.log(`Attempt ${attempt}: Fetching data from ${SPRING_BOOT_API_URL} with Basic Auth...`);

                    const response = await fetch(SPRING_BOOT_API_URL, {
                        method: 'GET',
                        headers: headers
                    });

                    if (response.status === 401) {
                        throw new Error("401 UNAUTHORIZED. Spring Boot rejected the Basic Auth credentials. Please check the 'admin' credentials in auth_app.jsx and ensure they have access to the endpoint.");
                    }

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP Error ${response.status}: Failed to load data. Details: ${errorText.substring(0, 100)}...`);
                    }

                    const data = await response.json();

                    // Ensure the data structure is an array
                    if (Array.isArray(data)) {
                        setExpenses(data);
                    } else {
                        setExpenses([]);
                        console.warn("Backend response was not an array:", data);
                    }

                    // If successful, break the loop and clear error
                    lastError = null;
                    break;

                } catch (err) {
                    lastError = err;
                    console.error(`Attempt ${attempt} failed. Error: ${err.message}`);

                    if (attempt < maxRetries) {
                        const delay = Math.pow(2, attempt) * 500; // Exponential backoff: 1s, 2s, 4s
                        console.log(`Retrying in ${delay}ms...`);
                        // Wait using exponential backoff before the next attempt
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }

            if (lastError) {
                // If the error is generic "Failed to fetch", provide specific CORS/Server guidance
                if (lastError.message === 'Failed to fetch') {
                    setError("Connection Failed (Network/CORS Error). Check 1: Is your Spring Boot server running on http://localhost:8080? Check 2: Have you configured CORS in Spring Boot to allow requests from this frontend's origin?");
                } else {
                    setError(lastError.message);
                }
            }

            setIsLoading(false);
        };

        fetchExpenses();
    }, [userId, base64Credentials]);

    // --- Render Logic ---

    let content;
    if (isLoading) {
        content = (
            <div className="flex justify-center items-center py-8 text-indigo-600">
                <Loader2 className="animate-spin mr-3 w-6 h-6" />
                <p>Connecting to Spring Boot...</p>
            </div>
        );
    } else if (error) {
        content = (
            <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
                <div className="flex items-center font-bold mb-2">
                    <XCircle className="w-5 h-5 mr-2" />
                    BACKEND ERROR (Bridge Broken)
                </div>
                <p className="text-sm break-all">
                    {error}
                </p>
                <p className="mt-2 text-xs font-semibold">
                    **Action Check:** If the error is *not* a 401, you likely have a **CORS** issue or the **Spring Boot server is offline**. For a **401**, check the hardcoded `admin` credentials.
                </p>
            </div>
        );
    } else if (expenses.length === 0) {
        content = (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Server className="w-6 h-6 mx-auto mb-2" />
                <p>No expenses found. (Connection and Auth successful, but the database list was empty.)</p>
            </div>
        );
    } else {
        content = (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider rounded-tl-lg">Payer</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider rounded-tr-lg">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {expenses.map((expense, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition duration-150">
                                {/* NOTE: These properties must match the JSON keys returned by your Spring Boot endpoint */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.payer || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">${expense.amount ? expense.amount.toFixed(2) : '0.00'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category || 'General'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Server className="w-6 h-6 mr-2 text-indigo-600" />
                Backend Expense Data
            </h3>
            {content}
        </div>
    );
};

// --- Main App Component ---

const App = () => {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [authInstance, setAuthInstance] = useState(null);
    const [welcomeMessage, setWelcomeMessage] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [llmError, setLlmError] = useState(null);


    useEffect(() => {
        if (!firebaseConfig) {
            console.error("Firebase config is missing. Cannot initialize app.");
            setAuthReady(true);
            return;
        }

        try {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            setAuthInstance(auth);
        } catch (e) {
            console.warn("Firebase initialization warning:", e.message);
            auth = getAuth();
            setAuthInstance(auth);
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setWelcomeMessage(null);
            } else {
                setUser(null);
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (tokenError) {
                    console.error("Initial authentication failed:", tokenError);
                }
            }
            setAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        if (authInstance) {
            try {
                await signOut(authInstance);
                setWelcomeMessage(null);
            } catch (error) {
                console.error("Logout failed:", error);
            }
        }
    };

    const generateWelcomeMessage = async () => {
        if (!user) return;

        setIsGenerating(true);
        setLlmError(null);
        setWelcomeMessage(null);

        const systemPrompt = `You are a friendly, encouraging personal assistant. Your task is to generate a short, creative, and personalized welcome message or an inspirational thought for a user who has just logged into their app. Keep the response to a maximum of two concise sentences. Do not use asterisks or markdown formatting.`;
        const uidSnippet = user.uid.substring(0, 8);
        const userQuery = `Generate a welcome message for a user whose ID starts with: ${uidSnippet}. Make it uplifting.`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        let success = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (!success && attempts < maxAttempts) {
            attempts++;
            try {
                const response = await fetch(`${API_URL_BASE}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text) {
                    setWelcomeMessage(text);
                    success = true;
                } else {
                    throw new Error("API returned an empty or malformed response.");
                }
            } catch (error) {
                console.error(`Attempt ${attempts} failed:`, error);
                if (attempts < maxAttempts) {
                    const delay = Math.pow(2, attempts) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    setLlmError("Failed to generate message after multiple attempts. Please try again.");
                }
            }
        }
        setIsGenerating(false);
    };

    if (!authReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
                <p className="ml-3 text-lg font-medium text-gray-700">Loading authentication...</p>
            </div>
        );
    }

    // User is logged in (Dashboard View)
    if (user) {
        const emailDisplay = user.email || "Anonymous User";
        const userIdDisplay = user.uid;

        return (
            <div className="min-h-screen flex flex-col items-center pt-8 pb-12 bg-gray-50 p-4">
                <div className="w-full max-w-4xl p-8 bg-white shadow-2xl rounded-xl transition-all duration-300 border-t-4 border-t-indigo-600">

                    <div className="flex flex-col items-center mb-6 border-b pb-4">
                        <User className="w-12 h-12 text-green-600 mb-2" />
                        <h2 className="text-3xl font-bold text-gray-900 text-center mb-1">Authenticated</h2>
                        <p className="text-center text-xl text-indigo-600 font-semibold">{emailDisplay}</p>
                    </div>

                    {/* Gemini Feature Block */}
                    <div className="mt-6 border border-indigo-200 bg-indigo-50 p-4 rounded-lg shadow-inner space-y-3">
                        <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                            Your Personalized Welcome Message
                        </h3>

                        {llmError && (
                            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                <span className="font-medium">{llmError}</span>
                            </div>
                        )}

                        {welcomeMessage ? (
                            <p className="text-lg text-gray-800 font-medium p-3 bg-white rounded-md border border-gray-200 animate-fadeIn">
                                {welcomeMessage}
                            </p>
                        ) : (
                            <p className="text-gray-500 italic text-sm p-2">Click the button below to generate a fresh, motivational welcome.</p>
                        )}

                        <button
                            onClick={generateWelcomeMessage}
                            className="w-full flex justify-center items-center px-4 py-2 text-md font-semibold rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="animate-spin mr-2 w-5 h-5" />
                            ) : (
                                <Sparkles className="mr-2 w-5 h-5" />
                            )}
                            {isGenerating ? 'Generating...' : 'Generate New Welcome Message'}
                        </button>
                    </div>
                    {/* End Gemini Feature Block */}

                    {/* Expenses Dashboard (The Spring Boot Connector) */}
                    <ExpensesDashboard userId={userIdDisplay} />

                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg mt-6">
                        <div>
                            <span className="text-gray-700 font-medium block mb-1">User ID: (App: {appId})</span>
                            <code className="block break-all bg-gray-200 p-2 rounded text-sm text-gray-800">
                                {userIdDisplay}
                            </code>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="mt-8 w-full flex justify-center items-center px-4 py-3 text-lg font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    >
                        <LogOut className="mr-2 w-5 h-5" />
                        Log Out
                    </button>
                </div>
                {/* Tailwind Animation for smooth message appearance */}
                <style jsx="true">{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.5s ease-out;
                    }
                `}</style>
            </div>
        );
    }

    // User is not logged in - show login screen
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <LoginScreen authInstance={authInstance} />
        </div>
    );
};

export default App;