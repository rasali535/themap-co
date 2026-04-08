import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export const PerformanceChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-between h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-zinc-600 text-sm font-medium uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          Task Completion Rate
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 mt-2">
        <div className="h-[250px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#71717a' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  labelStyle={{ color: '#71717a', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}
                  itemStyle={{ color: '#18181b', fontSize: '14px', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="completionRate" name="Completion %" stroke="#18181b" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#18181b', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400 text-sm font-medium">
              Waiting for data...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
