import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';
import './index.css';
import './i18n';


ReactDOM.createRoot(document.querySelector('#app') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter basename={`${import.meta.env.BASE_URL}`}>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);