import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { UserAuthProvider } from './context/UserAuthContext.jsx';
import './index.css';
import './admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <UserAuthProvider>
                <CartProvider>
                    <App />
                </CartProvider>
            </UserAuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
