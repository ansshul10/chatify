import React, { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';

const EditUserDetails = ({ onClose, user }) => {
  const [data, setData] = useState({
    name: user?.name || '',
    profile_pic: user?.profile_pic || ''
  });
  const uploadPhotoRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    setData((prev) => ({ ...prev, ...user }));
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenUploadPhoto = (e) => {
    e.preventDefault();
    uploadPhotoRef.current.click();
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file!');
      return;
    }

    try {
      const uploadPhoto = await uploadFile(file);
      setData((prev) => ({ ...prev, profile_pic: uploadPhoto?.url }));
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload image. Try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/update-user`;

      const response = await axios.post(URL, data, { withCredentials: true });

      toast.success(response?.data?.message);

      if (response.data.success) {
        dispatch(setUser(response.data.data));
        onClose();
      }
    } catch (error) {
      toast.error('Error updating profile, please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-md transition-all duration-300">
      <div className="bg-black text-white p-6 rounded-lg w-full max-w-sm shadow-xl border border-[#ADFF2F]">
        <h2 className="font-semibold text-lg text-[#ADFF2F]">Edit Profile</h2>
        <p className="text-sm text-white opacity-70">Update your details below.</p>

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="flex flex-col">
            <label htmlFor="name" className="text-white font-medium">Name:</label>
            <input
              type="text"
              name="name"
              id="name"
              value={data.name}
              onChange={handleOnChange}
              className="w-full px-3 py-2 rounded-lg bg-[#222] text-[#ADFF2F] focus:outline-none focus:ring-2 focus:ring-[#ADFF2F]"
            />
          </div>

          {/* Profile Picture Section */}
          <div className="mt-2">
            <div className="text-white opacity-70">Profile Picture:</div>
            <div className="my-2 flex items-center gap-4">
              <Avatar width={50} height={50} imageUrl={data?.profile_pic} name={data?.name} />
              <button
                className="text-[#ADFF2F] hover:underline"
                onClick={handleOpenUploadPhoto}
              >
                Change Photo
              </button>
              <input
                type="file"
                id="profile_pic"
                className="hidden"
                ref={uploadPhotoRef}
                onChange={handleUploadPhoto}
              />
            </div>
          </div>

          <hr className="border-[#ADFF2F] my-3 opacity-50" />

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="border border-white text-white px-4 py-2 rounded-lg hover:bg-[#222] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#ADFF2F] text-black px-4 py-2 rounded-lg hover:bg-[#99E62E] transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );  
};

export default React.memo(EditUserDetails);
