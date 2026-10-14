import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router';
import appRouter from './routes/appRouter';
import './styles/index.css';

const rootElement=document.getElementById('root');

createRoot(rootElement).render(
    <StrictMode>
        <RouterProvider router={appRouter}/>
    </StrictMode>
);
