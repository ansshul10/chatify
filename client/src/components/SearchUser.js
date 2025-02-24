import React, { useEffect, useState } from "react";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import Loading from "./Loading";
import UserSearchCard from "./UserSearchCard";
import toast from "react-hot-toast";
import axios from "axios";

const SearchUser = ({ onClose }) => {
  const [searchUser, setSearchUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearchUser = async () => {
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/search-user`;
    try {
      setLoading(true);
      const response = await axios.post(URL, { search });
      setLoading(false);
      setSearchUser(response.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    handleSearchUser();
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
      {/* Modal Container */}
      <div className="w-full max-w-sm bg-[#000000] text-[#66FCF1] rounded-lg shadow-lg p-4 relative border border-[#ADFF2F]">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-[#66FCF1] hover:text-[#C5C6C7] transition-all"
          onClick={onClose}
        >
          <IoClose size={22} />
        </button>
  
        {/* Search Input */}
        <div className="flex items-center bg-[#1F2833] rounded-md overflow-hidden border border-[#ADFF2F] w-72 mx-auto">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full bg-transparent text-[#66FCF1] text-sm py-2 px-3 focus:outline-none"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          <div className="p-2 text-[#66FCF1]">
            <IoSearchOutline size={18} />
          </div>
        </div>
  
        {/* Search Results */}
        <div className="mt-4 max-h-[250px] overflow-y-auto">
          {!loading && searchUser.length === 0 && (
            <p className="text-center text-[#C5C6C7] text-sm">No users found!</p>
          )}
          {loading && <Loading />}
          {!loading &&
            searchUser.length !== 0 &&
            searchUser.map((user) => (
              <UserSearchCard key={user._id} user={user} onClose={onClose} />
            ))}
        </div>
      </div>
    </div>
  );  
};

export default SearchUser;
