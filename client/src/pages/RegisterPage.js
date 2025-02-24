import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios'
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [data,setData] = useState({
    name : "",
    email : "",
    password : "",
    profile_pic : ""
  })
  const [uploadPhoto,setUploadPhoto] = useState("")
  const navigate = useNavigate()

  const handleOnChange = (e)=>{
    const { name, value} = e.target

    setData((preve)=>{
      return{
          ...preve,
          [name] : value
      }
    })
  }

  const handleUploadPhoto = async(e)=>{
    const file = e.target.files[0]

    const uploadPhoto = await uploadFile(file)

    setUploadPhoto(file)

    setData((preve)=>{
      return{
        ...preve,
        profile_pic : uploadPhoto?.url
      }
    })
  }
  const handleClearUploadPhoto = (e)=>{
    e.stopPropagation()
    e.preventDefault()
    setUploadPhoto(null)
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()
    e.stopPropagation()

    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`

    try {
        const response = await axios.post(URL,data)
        console.log("response",response)

        toast.success(response.data.message)

        if(response.data.success){
            setData({
              name : "",
              email : "",
              password : "",
              profile_pic : ""
            })

            navigate('/email')

        }
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
    console.log('data',data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between bg-gray-800/40 backdrop-blur-lg border border-gray-600/40 rounded-2xl shadow-lg p-6">
        
        {/* Left Section - Register Info */}
        <div className="w-full md:w-1/2 text-gray-200 p-6">
          <h1 className="text-4xl font-bold text-blue-400">Join Chatify Today!</h1>
          <p className="mt-4 text-gray-400 text-lg leading-relaxed">
            Connect with friends, chat in real-time, and be a part of an awesome community.  
            Register now and start your journey with us!
          </p>
          <p className="mt-2 text-gray-500">Your privacy is our priority. We never share your details.</p>
        </div>

        {/* Right Section - Registration Form */}
        <div className="w-full md:w-1/2">
          <div className="text-center mb-6">
            <h3 className="text-gray-100 text-2xl font-semibold">Create Your Account</h3>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <label htmlFor="profile_pic" className="cursor-pointer relative">
                <img
                  src={uploadPhoto ? URL.createObjectURL(uploadPhoto) : DEFAULT_PROFILE_IMAGE}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-2 border-gray-500 shadow-md"
                />
              </label>
              <input type="file" id="profile_pic" name="profile_pic" className="hidden" onChange={handleUploadPhoto} />
              {uploadPhoto && (
                <button className="text-gray-400 mt-2 text-sm hover:text-red-500" onClick={handleClearUploadPhoto}>
                  Remove Photo
                </button>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-gray-400">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                value={data.name}
                onChange={handleOnChange}
                required
              />
            </div>

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

            {/* Password Field */}
            <div>
              <label className="block text-gray-400">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a strong password"
                className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                value={data.password}
                onChange={handleOnChange}
                required
              />
            </div>

            {/* Register Button */}
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
              Register Now
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-4 text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/email" className="text-blue-400 font-semibold hover:underline">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
