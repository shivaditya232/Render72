import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router';
import appRouter from './routes/appRouter';
import './styles/index.css';
import {printConsoleNote} from './utils/consoleNote';

const rootElement=document.getElementById('root');

createRoot(rootElement).render(
    <StrictMode>
        <RouterProvider router={appRouter}/>
    </StrictMode>
);

printConsoleNote();
