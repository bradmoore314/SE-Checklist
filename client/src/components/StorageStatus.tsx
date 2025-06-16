/**
 * Storage status indicator showing online/offline state and sync status
 */

import { Cloud, CloudOff, Wifi, WifiOff } from 'lucide-react';
import { useStorageStatus } from '@/hooks/useProjects';
import { Badge } from '@/components/ui/badge';

export default function StorageStatus() {
  const { data: isOnline, isLoading } = useStorageStatus();

  if (isLoading) {
    return (
      <Badge variant="secondary" className="gap-2">
        <div className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Checking...
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isOnline ? "default" : "secondary"}
      className="gap-2"
    >
      {isOnline ? (
        <>
          <Cloud className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          Online
        </>
      ) : (
        <>
          <CloudOff className="w-3 h-3" />
          <WifiOff className="w-3 h-3" />
          Offline
        </>
      )}
    </Badge>
  );
}