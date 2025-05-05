import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from 'lucide-react';

interface MarkerStats {
  total: number;
  types: {
    access_point: {
      total: number;
      interior: number;
      perimeter: number;
      unspecified: number;
    };
    camera: {
      total: number;
      indoor: number;
      outdoor: number;
      unspecified: number;
    };
    elevator: {
      total: number;
    };
    intercom: {
      total: number;
    };
  };
}

interface MarkerStatsLegendProps {
  projectId: number;
}

export function MarkerStatsLegend({ projectId }: MarkerStatsLegendProps) {
  const { data: stats, isLoading, error } = useQuery<MarkerStats>({
    queryKey: ['/api/projects', projectId, 'marker-stats'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${projectId}/marker-stats`);
      return await res.json();
    },
    enabled: !!projectId,
    // Refresh statistics every 30 seconds or when user returns to the page
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  if (isLoading) {
    return (
      <Card className="w-full md:max-w-64 shadow-md">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading stats...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="w-full md:max-w-64 shadow-md">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Error loading marker statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full md:max-w-72 shadow-md">
      <CardContent className="p-3">
        <h3 className="text-sm font-semibold mb-2">Equipment Count</h3>
        
        <div className="space-y-2">
          {/* Access Points */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-xs">Card Access</span>
            </div>
            <Badge variant="outline" className="ml-2 text-xs">{stats.types.access_point.total}</Badge>
          </div>
          
          {stats.types.access_point.total > 0 && (
            <div className="pl-5 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Interior</span>
                <span>{stats.types.access_point.interior}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Perimeter</span>
                <span>{stats.types.access_point.perimeter}</span>
              </div>
              {stats.types.access_point.unspecified > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Unspecified</span>
                  <span>{stats.types.access_point.unspecified}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Cameras */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-xs">Cameras</span>
            </div>
            <Badge variant="outline" className="ml-2 text-xs">{stats.types.camera.total}</Badge>
          </div>
          
          {stats.types.camera.total > 0 && (
            <div className="pl-5 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Indoor</span>
                <span>{stats.types.camera.indoor}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Outdoor</span>
                <span>{stats.types.camera.outdoor}</span>
              </div>
              {stats.types.camera.unspecified > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Unspecified</span>
                  <span>{stats.types.camera.unspecified}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Elevators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs">Elevators</span>
            </div>
            <Badge variant="outline" className="ml-2 text-xs">{stats.types.elevator.total}</Badge>
          </div>
          
          {/* Intercoms */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-xs">Intercoms</span>
            </div>
            <Badge variant="outline" className="ml-2 text-xs">{stats.types.intercom.total}</Badge>
          </div>
          
          {/* Total */}
          <div className="flex items-center justify-between pt-1 mt-1 border-t border-gray-200">
            <span className="text-sm font-medium">Total</span>
            <Badge className="ml-2">{stats.total}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}