import React from 'react';
import { Alert } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Bell, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export const AlertsFeed: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-zinc-100">
        <CardTitle className="flex items-center gap-2 text-zinc-900">
          <Bell className="w-5 h-5 text-zinc-500" />
          Real-time Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-start gap-3 text-sm">
              <div className="mt-0.5 shrink-0">{getIcon(alert.type)}</div>
              <div>
                <p className="text-zinc-700 leading-snug font-medium">{alert.message}</p>
                <p className="text-[11px] text-zinc-400 mt-1 font-mono">T+{alert.timestamp}h</p>
              </div>
            </div>
          ))}
          {alerts.length === 0 && <div className="text-sm text-zinc-500 text-center py-8 font-medium">No alerts yet.</div>}
        </div>
      </CardContent>
    </Card>
  );
};
