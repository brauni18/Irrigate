import { SocketProvider } from '@/sockets/SocketProvider';
import { useMemo } from 'react';
import { Outlet } from 'react-router';

export function Root() {
  // insert urls to create a socket connection to here
  const socketUrls = useMemo(() => [], []);

  return (
    <SocketProvider urls={socketUrls}>
      <Outlet />
    </SocketProvider>
  );
}
