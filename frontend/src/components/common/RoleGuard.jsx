import { Navigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/roleRoutes';

export default function RoleGuard({ allowedRoles, children, fallbackPath }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={fallbackPath || getDashboardPath(user.role)}
        replace
      />
    );
  }

  return children;
}
