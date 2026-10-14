import {createBrowserRouter} from 'react-router';
import AppLayout from '../views/layout/AppLayout';
import RouteErrorPage from '../views/pages/RouteErrorPage';
import PageSkeleton from '../views/components/PageSkeleton';
import {eventDetailLoader} from '../controllers/eventLoaders';
import {lazyPage} from './lazyPage';
import {importHomePage,importEventsPage,importEventDetailPage,importNotFoundPage} from './pageImporters';

const appRouter=createBrowserRouter([
    {
        path:'/',
        Component:AppLayout,
        ErrorBoundary:RouteErrorPage,
        HydrateFallback:PageSkeleton,
        children:[
            {
                index:true,
                lazy:lazyPage(importHomePage)
            },
            {
                path:'events',
                lazy:lazyPage(importEventsPage)
            },
            {
                path:'events/:id',
                loader:eventDetailLoader,
                lazy:lazyPage(importEventDetailPage)
            },
            {
                path:'*',
                lazy:lazyPage(importNotFoundPage)
            }
        ]
    }
]);

export default appRouter;
