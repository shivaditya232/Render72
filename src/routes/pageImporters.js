// The page files (and the plan drawer), listed once. Used both by the router (load on demand)
// and by AppLayout (download in the background when the browser is idle).

export const importHomePage=()=>import('../views/pages/HomePage');
export const importEventsPage=()=>import('../views/pages/EventsPage');
export const importEventDetailPage=()=>import('../views/pages/EventDetailPage');
export const importNotFoundPage=()=>import('../views/pages/NotFoundPage');
export const importPlanDrawer=()=>import('../views/plan/PlanDrawer');

export const PAGE_IMPORTERS=[importHomePage,importEventsPage,importEventDetailPage,importNotFoundPage,importPlanDrawer];
