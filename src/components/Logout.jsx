// Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ showAlert, setIsLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    setIsLoggedIn(false);
    showAlert("Logged out successfully", "success");

    const timer = setTimeout(() => {
      navigate("/");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default Logout;
