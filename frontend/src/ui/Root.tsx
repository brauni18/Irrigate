import { SocketProvider } from '@/sockets/SocketProvider';
import { useMemo } from 'react';
import { AppLayout } from '@/ui/components/AppLayout';

export function Root() {
  // insert urls to create a socket connection to here
  const socketUrls = useMemo(() => [], []);

  return (
    <SocketProvider urls={socketUrls}>
      <AppLayout />
    </SocketProvider>
  );
}
