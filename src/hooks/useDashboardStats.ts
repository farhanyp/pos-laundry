import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/service/dashboard';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });
};
