import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const WarehouseMap: React.FC = () => {
  const { t } = useTranslation();
  const [mapProvider, setMapProvider] = useState<'google' | 'gaode'>('google');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('sidebar.warehouseMap')}</h1>
        <Select value={mapProvider} onValueChange={(value: 'google' | 'gaode') => setMapProvider(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google Map</SelectItem>
            <SelectItem value="gaode">高德地图</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5" />
            <span>Warehouse Layout - {mapProvider === 'google' ? 'Google Maps' : '高德地图'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">
              {mapProvider === 'google' 
                ? '🌍 Google Maps integration ready'
                : '🗺️ 高德地图集成已就绪'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};