import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useOutlet } from 'react-router';
import { ROUTES } from '@/router/routes.consts';
import { useGetMeQuery } from '@/store/apis/users.api';
import { clearSession, setUserProfile } from '@/store/slices/user.slice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { AuthTransitionShell } from '@/ui/components/AuthTransitionShell';

export function RequireAuth() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.user.token);
  const profile = useAppSelector((state) => state.user.profile);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (data) {
      dispatch(setUserProfile(data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(clearSession());
    }
  }, [isError, dispatch]);

  if (!token || !isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  if (isLoading && !profile) {
    return <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Checking session...</div>;
  }

  if (isError) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const location = useLocation();
  const outlet = useOutlet();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return (
    <AuthTransitionShell pathname={location.pathname} search={location.search} outlet={outlet ?? <Outlet />} />
  );
}