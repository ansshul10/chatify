import React from "react";
import Avatar from "./Avatar";
import { Link } from "react-router-dom";

const UserSearchCard = ({ user, onClose }) => {
  return (
    <Link
      to={"/" + user?._id}
      onClick={onClose}
      className="flex items-center gap-3 p-3 lg:p-4 border border-transparent border-b-[#1f2937] hover:border-blue-500 hover:bg-[#1a2235] rounded-lg cursor-pointer transition-all duration-300 ease-in-out"
    >
      <div>
        <Avatar width={50} height={50} name={user?.name} userId={user?._id} imageUrl={user?.profile_pic} />
      </div>
      <div>
        <div className="font-semibold text-lg text-gray-200 text-ellipsis line-clamp-1">{user?.name}</div>
      </div>
    </Link>
  );
};

export default UserSearchCard;