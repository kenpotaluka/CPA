import Dashboard from './pages/Dashboard';
import ComplaintsPage from './pages/ComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import NewComplaintPage from './pages/NewComplaintPage';
import PerformancePage from './pages/PerformancePage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />
  },
  {
    name: 'Complaints',
    path: '/complaints',
    element: <ComplaintsPage />
  },
  {
    name: 'Complaint Detail',
    path: '/complaints/:id',
    element: <ComplaintDetailPage />,
    visible: false
  },
  {
    name: 'New Complaint',
    path: '/complaints/new',
    element: <NewComplaintPage />,
    visible: false
  },
  {
    name: 'Performance',
    path: '/performance',
    element: <PerformancePage />
  }
];

export default routes;
