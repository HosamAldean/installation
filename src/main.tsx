// src/main.tsx
import './styles/index.css';

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';
import { UserProvider } from '~/context/UserContext'; // <-- import UserProvider

const $container = document.querySelector('#root') as HTMLElement;

createRoot($container).render(
    <React.StrictMode>
        <UserProvider>
            <RouterProvider router={router} />
        </UserProvider>
    </React.StrictMode>
);
