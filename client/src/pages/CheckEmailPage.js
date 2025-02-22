import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PiUserCircle } from 'react-icons/pi';

const CheckEmailPage = () => {
  const [data, setData] = useState({
    email: '',
  });

  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/email`;

    try {
      const response = await axios.post(URL, data);
      toast.success(response.data.message);

      if (response.data.success) {
        setData({ email: '' });
        navigate('/password', {
          state: response?.data?.data,
        });
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
          <h1 className="text-4xl font-bold text-blue-400">Sign In to Your Account</h1>
          <p className="mt-4 text-gray-400 text-lg leading-relaxed">
            Welcome back! Enter your email to continue to Chatify.
          </p>
        </div>


        {/* Right Section - Email Form */}
        <div className="w-full md:w-1/2">
          <div className="flex flex-col items-center text-center mb-6">
            <PiUserCircle size={80} className="text-blue-400" />
            <h3 className="text-gray-100 text-2xl font-semibold">Enter Your Email</h3>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-gray-400">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                value={data.email}
                onChange={handleOnChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
              Let's Go
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-4 text-center text-gray-400">
            New User?{' '}
            <Link to="/register" className="text-blue-400 font-semibold hover:underline">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;