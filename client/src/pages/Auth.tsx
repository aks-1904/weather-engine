import React, { useState } from "react";
import { useAppSelector } from "../hooks/app";
import useAuth from "../hooks/useAuth";
import { useDispatch } from "react-redux";
import { setError } from "../store/slices/authSlice";

// SVG Icon Components for better UI
const UserIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const EmailIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const LockIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
  </svg>
);

// Custom Input component for reusability
interface InputProps {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}

const InputField: React.FC<InputProps> = ({
  id,
  type,
  placeholder,
  value,
  onChange,
  icon,
}) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      id={id}
      name={id}
      type={type}
      required
      className="w-full pl-10 pr-3 py-2 bg-transparent border border-gray-200/30 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

const Auth: React.FC = () => {
  // State to toggle between login and register forms
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // State for form inputs
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const dispatch = useDispatch();

  const { error, loading } = useAppSelector((store) => store.auth);
  const { login, register } = useAuth();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLogin) {
      await login({ emailOrUsername, password });
    } else {
      await register({ username, email, password, confirmPassword });
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    dispatch(setError(null));
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setEmailOrUsername("");
  };

  return (
    <div
      className="min-h-screen bg-gray-900 bg-cover bg-center flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 font-sans"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=2512&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/10 backdrop-blur-lg py-8 px-4 shadow-xl border border-gray-200/20 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            {isLogin ? (
              // --- Login Form ---
              <>
                <InputField
                  id="emailOrUsername"
                  type="text"
                  placeholder="Email or Username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  icon={<UserIcon className="h-5 w-5 text-gray-400" />}
                />
                <InputField
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<LockIcon className="h-5 w-5 text-gray-400" />}
                />
              </>
            ) : (
              // --- Register Form ---
              <>
                <InputField
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<UserIcon className="h-5 w-5 text-gray-400" />}
                />
                <InputField
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<EmailIcon className="h-5 w-5 text-gray-400" />}
                />
                <InputField
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<LockIcon className="h-5 w-5 text-gray-400" />}
                />
                <InputField
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<LockIcon className="h-5 w-5 text-gray-400" />}
                />
              </>
            )}

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <div>
              <button
                disabled={loading}
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-fuchsia-500 transition duration-150 ease-in-out"
              >
                {isLogin ? "Sign in" : "Register"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/5 backdrop-blur-sm text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={toggleForm}
                className="font-medium text-fuchsia-400 hover:text-fuchsia-300"
              >
                {isLogin ? "create a new account" : "sign in instead"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
