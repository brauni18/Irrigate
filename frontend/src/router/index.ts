import { Home } from '@/ui/pages/Home';
import { GardenPage } from '@/ui/pages/GardenPage';
import { NotFound } from '@/ui/pages/NotFound';
import { Root } from '@/ui/Root';
import { ROUTES } from '@/router/routes.consts';
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: ROUTES.garden, Component: GardenPage },
    ]
  },
  {
    path: ROUTES.fallback,
    Component: NotFound
  }
]);
