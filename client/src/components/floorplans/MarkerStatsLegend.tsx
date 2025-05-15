import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MarkerStats {
  total: number;
  types: {
    access_point: {
      total: number;
      interior: number;
      perimeter: number;
      unspecified: number;
      equipment_count: number;
    };
    camera: {
      total: number;
      indoor: number;
      outdoor: number;
      unspecified: number;
      equipment_count: number;
    };
    elevator: {
      total: number;
      equipment_count: number;
    };
    intercom: {
      total: number;
      equipment_count: number;
    };
  };
}

interface MarkerStatsLegendProps {
  projectId: number;
  visibleLabelTypes?: Record<string, boolean>;
  onToggleLabelVisibility?: (markerType: string) => void;
}

export function MarkerStatsLegend({ 
  projectId, 
  visibleLabelTypes = {}, 
  onToggleLabelVisibility 
}: MarkerStatsLegendProps) {
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
              {onToggleLabelVisibility && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-1">
                    {visibleLabelTypes['access_point'] ? (
                      <Eye className="h-3 w-3 text-green-600" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-xs">Show labels</span>
                  </div>
                  <Switch
                    id="access-point-labels"
                    checked={visibleLabelTypes['access_point'] || false}
                    onCheckedChange={() => onToggleLabelVisibility('access_point')}
                    className="data-[state=checked]:bg-red-500 h-4 w-7"
                  />
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
              {onToggleLabelVisibility && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-1">
                    {visibleLabelTypes['camera'] ? (
                      <Eye className="h-3 w-3 text-green-600" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-xs">Show labels</span>
                  </div>
                  <Switch
                    id="camera-labels"
                    checked={visibleLabelTypes['camera'] || false}
                    onCheckedChange={() => onToggleLabelVisibility('camera')}
                    className="data-[state=checked]:bg-blue-500 h-4 w-7"
                  />
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
          
          {stats.types.elevator.total > 0 && onToggleLabelVisibility && (
            <div className="pl-5 space-y-1">
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center space-x-1">
                  {visibleLabelTypes['elevator'] ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="text-xs">Show labels</span>
                </div>
                <Switch
                  id="elevator-labels"
                  checked={visibleLabelTypes['elevator'] || false}
                  onCheckedChange={() => onToggleLabelVisibility('elevator')}
                  className="data-[state=checked]:bg-green-500 h-4 w-7"
                />
              </div>
            </div>
          )}
          
          {/* Intercoms */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-xs">Intercoms</span>
            </div>
            <Badge variant="outline" className="ml-2 text-xs">{stats.types.intercom.total}</Badge>
          </div>
          
          {stats.types.intercom.total > 0 && onToggleLabelVisibility && (
            <div className="pl-5 space-y-1">
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center space-x-1">
                  {visibleLabelTypes['intercom'] ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="text-xs">Show labels</span>
                </div>
                <Switch
                  id="intercom-labels"
                  checked={visibleLabelTypes['intercom'] || false}
                  onCheckedChange={() => onToggleLabelVisibility('intercom')}
                  className="data-[state=checked]:bg-yellow-500 h-4 w-7"
                />
              </div>
            </div>
          )}
          
          {/* Notes visibility */}
          {onToggleLabelVisibility && (
            <div className="flex items-center justify-between pt-2 pb-2 mt-1 border-t border-b border-gray-200">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-amber-300 mr-1"></div>
                <span className="text-xs">Notes Labels</span>
              </div>
              <Switch
                id="note-labels"
                checked={visibleLabelTypes['note'] || false}
                onCheckedChange={() => onToggleLabelVisibility('note')}
                className="data-[state=checked]:bg-amber-400 h-4 w-7"
              />
            </div>
          )}
          
          {/* Show All Labels Toggle */}
          {onToggleLabelVisibility && (
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium">Show All Labels</span>
              </div>
              <Switch
                id="all-labels"
                checked={visibleLabelTypes['all'] || false}
                onCheckedChange={() => onToggleLabelVisibility('all')}
                className="h-4 w-7"
              />
            </div>
          )}
          
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