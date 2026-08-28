import { Home } from '@/ui/pages/Home';
import { GardenPage } from '@/ui/pages/GardenPage';
import { LoginPage } from '@/ui/pages/LoginPage';
import { NotFound } from '@/ui/pages/NotFound';
import { AppLayout } from '@/ui/components/AppLayout';
import { SignupPage } from '@/ui/pages/SignupPage';
import { BetaPrivacyPage } from '@/ui/pages/BetaPrivacyPage';
import { VerifyEmailPage } from '@/ui/pages/VerifyEmailPage';
import { SignupSuccessPage } from '../ui/pages/SignupSuccessPage';
import { ROUTES } from '@/router/routes.consts';
import { PublicOnlyRoute, RequireAuth } from '@/router/RouteGuards';
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    Component: RequireAuth,
    children: [
      {
        path: ROUTES.home,
        Component: AppLayout,
        children: [
          { index: true, Component: Home },
          { path: ROUTES.garden, Component: GardenPage },
        ]
      },
    ],
  },
  {
    Component: PublicOnlyRoute,
    children: [
      {
        path: ROUTES.login,
        Component: LoginPage,
      },
      {
        path: ROUTES.signup,
        Component: SignupPage,
      },
      {
        path: ROUTES.signupSuccess,
        Component: SignupSuccessPage,
      },
      {
        path: ROUTES.betaPrivacy,
        Component: BetaPrivacyPage,
      },
      {
        path: ROUTES.verifyEmail,
        Component: VerifyEmailPage,
      },
    ],
  },
  {
    path: ROUTES.fallback,
    Component: NotFound
  }
]);
