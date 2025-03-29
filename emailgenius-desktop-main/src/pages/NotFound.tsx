
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-background text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 animate-fade-in">404</h1>
        <p className="text-xl text-gray-400 mb-6 animate-fade-in delay-100">Oops! Page not found</p>
        <Link to="/" className="inline-block bg-app-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all animate-fade-in delay-200">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
