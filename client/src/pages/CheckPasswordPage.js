import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';

const CheckPasswordPage = () => {
  const [data, setData] = useState({ password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!location?.state?.name) {
      navigate('/email');
    }
  }, [location, navigate]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/password`;

    try {
      const response = await axios.post(URL, { 
        userId: location?.state?._id, 
        password: data.password 
      }, { withCredentials: true });

      toast.success(response.data.message);

      if (response.data.success) {
        dispatch(setToken(response?.data?.token));
        localStorage.setItem('token', response?.data?.token);
        setData({ password: "" });
        navigate('/');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 p-4">
      <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-between bg-gray-800/40 backdrop-blur-lg border border-gray-600/40 rounded-2xl shadow-lg p-6">
  
        {/* Left Section - Info */}
        <div className="w-full md:w-1/2 text-gray-200 p-6">
          <h1 className="text-4xl font-bold text-blue-400">Enter Your Password</h1>
          <p className="mt-4 text-gray-400 text-lg leading-relaxed">
            Welcome back, <span className="text-white font-semibold">{location?.state?.name}</span>! Enter your password to access your account.
          </p>
        </div>
  
        {/* Right Section - Password Form */}
        <div className="w-full md:w-1/2">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar 
              width={80} 
              height={80} 
              name={location?.state?.name} 
              imageUrl={location?.state?.profile_pic} 
            />
            <h3 className="text-gray-100 text-2xl font-semibold mt-2">{location?.state?.name}</h3>
          </div>
  
          <form className="grid gap-5" onSubmit={handleSubmit}>
            {/* Password Input */}
            <div>
              <label className="block text-gray-400">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                value={data.password}
                onChange={handleOnChange}
                required
              />
            </div>
  
            {/* Submit Button */}
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
              Login
            </button>
          </form>
  
          {/* Forgot Password Link */}
          <p className="mt-4 text-center text-gray-400">
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-blue-400 font-semibold hover:underline">
              Reset it here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
  
};

export default CheckPasswordPage;
