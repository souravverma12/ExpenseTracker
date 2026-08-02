import React from 'react';
import { MetricsGrid } from './MetricsGrid';
import { HealthIndicator } from './HealthIndicator';
import { DashboardCharts } from './DashboardCharts';
import { RecentTransactions } from './RecentTransactions';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Top Metrics Cards Grid */}
      <MetricsGrid />

      {/* 2. Financial Health Score & Insights Banner */}
      <HealthIndicator />

      {/* 3. Embed Charts directly in Dashboard */}
      <DashboardCharts />

      {/* 4. Recent Activity */}
      <RecentTransactions />
    </div>
  );
};
