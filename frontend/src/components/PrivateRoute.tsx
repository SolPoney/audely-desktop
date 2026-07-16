import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../hooks/useAuth";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
	if (!isAuthenticated()) {
		return <Navigate to="/" replace />;
	}
	return <>{children}</>;
};

export default PrivateRoute;
