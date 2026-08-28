import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ROUTES } from '@/router/routes.consts';
import { animateAuthPageEnter, animateAuthPageExit } from '@/utils/gsapAnimations';

type AuthTransitionShellProps = {
  pathname: string;
  search: string;
  outlet: ReactNode;
};

type PendingRoute = {
  path: string;
  signature: string;
  outlet: ReactNode;
};

const AUTH_ROUTE_ORDER = [ROUTES.login, ROUTES.signup, ROUTES.betaPrivacy, ROUTES.signupSuccess, ROUTES.verifyEmail] as const;

function getAuthRouteIndex(pathname: string) {
  const index = AUTH_ROUTE_ORDER.findIndex((route) => pathname.startsWith(route));
  return index === -1 ? 0 : index;
}

function getAuthTransitionDirection(fromPath: string, toPath: string): 1 | -1 {
  return getAuthRouteIndex(toPath) >= getAuthRouteIndex(fromPath) ? 1 : -1;
}

function getAuthRouteSignature(pathname: string, search: string) {
  return `${pathname}${search}`;
}

export function AuthTransitionShell({ pathname, search, outlet }: AuthTransitionShellProps) {
  const activeLayerRef = useRef<HTMLDivElement | null>(null);
  const incomingLayerRef = useRef<HTMLDivElement | null>(null);
  const hasAnimatedInitialViewRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const currentSignature = getAuthRouteSignature(pathname, search);
  const [activePath, setActivePath] = useState(pathname);
  const [activeSignature, setActiveSignature] = useState(currentSignature);
  const [activeOutlet, setActiveOutlet] = useState(outlet);
  const [incomingRoute, setIncomingRoute] = useState<PendingRoute | null>(null);

  useEffect(() => {
    const activeLayer = activeLayerRef.current;
    if (!activeLayer || hasAnimatedInitialViewRef.current) {
      return;
    }

    hasAnimatedInitialViewRef.current = true;
    animateAuthPageEnter(activeLayer, 1);
  }, []);

  useEffect(() => {
    if (currentSignature === activeSignature || isTransitioningRef.current) {
      return;
    }

    setIncomingRoute({
      path: pathname,
      signature: currentSignature,
      outlet,
    });
  }, [activeSignature, currentSignature, outlet, pathname]);

  useEffect(() => {
    if (!incomingRoute || isTransitioningRef.current) {
      return;
    }

    const activeLayer = activeLayerRef.current;
    const incomingLayer = incomingLayerRef.current;

    if (!activeLayer || !incomingLayer) {
      setActivePath(incomingRoute.path);
      setActiveSignature(incomingRoute.signature);
      setActiveOutlet(incomingRoute.outlet);
      setIncomingRoute(null);
      return;
    }

    isTransitioningRef.current = true;
    const direction = getAuthTransitionDirection(activePath, incomingRoute.path);
    let completedAnimations = 0;

    const finishTransition = () => {
      completedAnimations += 1;
      if (completedAnimations < 2) {
        return;
      }

      setActivePath(incomingRoute.path);
      setActiveSignature(incomingRoute.signature);
      setActiveOutlet(incomingRoute.outlet);
      setIncomingRoute(null);
      isTransitioningRef.current = false;
    };

    animateAuthPageExit(activeLayer, direction, finishTransition);
    animateAuthPageEnter(incomingLayer, direction)?.eventCallback('onComplete', finishTransition);
  }, [activePath, incomingRoute]);

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div
        ref={activeLayerRef}
        className={incomingRoute ? 'absolute inset-0 z-10 min-h-svh' : 'relative min-h-svh'}
      >
        {activeOutlet}
      </div>

      {incomingRoute ? (
        <div ref={incomingLayerRef} className="absolute inset-0 z-20 min-h-svh">
          {incomingRoute.outlet}
        </div>
      ) : null}
    </div>
  );
}