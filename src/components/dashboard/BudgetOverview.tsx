import React from 'react';
import { Budget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { Wallet } from 'lucide-react';

export const BudgetOverview: React.FC<{ budget: Budget }> = ({ budget }) => {
  const spentPercentage = Math.min(100, (budget.spent / budget.total) * 100);
  const isLow = spentPercentage > 80;

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-zinc-600 text-sm font-medium uppercase tracking-wider">
          <Wallet className="w-4 h-4" />
          Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5 mt-2">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-4xl font-semibold tracking-tight text-zinc-900">
                ${budget.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-zinc-500 mt-1 font-medium">spent of ${budget.total.toLocaleString()}</div>
            </div>
            <div className={`text-sm font-semibold px-2.5 py-1 rounded-md ${isLow ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-700'}`}>
              {spentPercentage.toFixed(1)}%
            </div>
          </div>
          <Progress value={spentPercentage} className={isLow ? '[&>div]:bg-red-500' : ''} />
        </div>
      </CardContent>
    </Card>
  );
};
