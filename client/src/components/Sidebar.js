import React, { useEffect, useState } from 'react'
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import Avatar from './Avatar'
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import Divider from './Divider';
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from './SearchUser';
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { logout } from '../redux/userSlice';

const Sidebar = () => {
    const user = useSelector(state => state?.user)
    const [editUserOpen,setEditUserOpen] = useState(false)
    const [allUser,setAllUser] = useState([])
    const [openSearchUser,setOpenSearchUser] = useState(false)
    const socketConnection = useSelector(state => state?.user?.socketConnection)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(()=>{
        if(socketConnection){
            socketConnection.emit('sidebar',user._id)
            
            socketConnection.on('conversation',(data)=>{
                console.log('conversation',data)
                
                const conversationUserData = data.map((conversationUser,index)=>{
                    if(conversationUser?.sender?._id === conversationUser?.receiver?._id){
                        return{
                            ...conversationUser,
                            userDetails : conversationUser?.sender
                        }
                    }
                    else if(conversationUser?.receiver?._id !== user?._id){
                        return{
                            ...conversationUser,
                            userDetails : conversationUser.receiver
                        }
                    }else{
                        return{
                            ...conversationUser,
                            userDetails : conversationUser.sender
                        }
                    }
                })

                setAllUser(conversationUserData)
            })
        }
    },[socketConnection,user])

    const handleLogout = ()=>{
        dispatch(logout())
        navigate("/email")
        localStorage.clear()
    }

    return (
        <div className="w-full h-full grid grid-cols-[60px,1fr] bg-black text-white">
          {/* Sidebar */}
          <div className="bg-[#0B0C10] w-[60px] h-full rounded-tr-lg rounded-br-lg py-5 text-[#C5C6C7] flex flex-col justify-between shadow-lg border-r border-[#ADFF2F]">
            <div>
              <NavLink
                className={({ isActive }) =>
                  `w-[60px] h-[60px] flex justify-center items-center cursor-pointer transition-all duration-300 ease-in-out rounded-lg 
                  }`
                }
                title="Chat"
              >
                <IoChatbubbleEllipses size={24} />
              </NavLink>
      
              <div
                title="Add Friend"
                onClick={() => setOpenSearchUser(true)}
                className="w-[60px] h-[60px] flex justify-center items-center cursor-pointer transition-all duration-300 ease-in-out rounded-lg "
              >
                <FaUserPlus size={24} />
              </div>
            </div>
      
            <div className="flex flex-col items-center">
              <button className="mx-auto" title={user?.name} onClick={() => setEditUserOpen(true)}>
                <Avatar width={26} height={26} name={user?.name} imageUrl={user?.profile_pic} userId={user?._id} />
              </button>
              <button
                title="Logout"
                className="w-[60px] h-[60px] flex justify-center items-center cursor-pointer transition-all duration-300 ease-in-out rounded-lg hover:bg-[#1a1a1a]"
                onClick={handleLogout}
              >
                <span className="-ml-2 text-red-500">
                  <BiLogOut size={26} />
                </span>
              </button>
            </div>
          </div>
      
          {/* Chat Section */}
          <div className="w-full">
            <div className="h-16 flex items-center">
              <h2 className="text-xl font-bold p-4 text-[#ADFF2F]">Messages</h2>
            </div>
            <div className="bg-[#ADFF2F] p-[0.5px]"></div>
      
            <div className="h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar">
              {allUser.length === 0 && (
                <div className="mt-12">
                  <div className="flex justify-center items-center my-4 text-gray-500">
                    <FiArrowUpLeft size={50} />
                  </div>
                  <p className="text-lg text-center text-gray-400">Explore users to start a conversation.</p>
                </div>
              )}
      
              {allUser.map((conv, index) => (
                <NavLink
                  to={"/" + conv?.userDetails?._id}
                  key={conv?._id}
                  className="flex items-center gap-3 py-4 px-4 border border-transparent hover:border-[#ADFF2F] rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition-all duration-300 ease-in-out"
                >
                  <div>
                    <Avatar imageUrl={conv?.userDetails?.profile_pic} name={conv?.userDetails?.name} width={48} height={48} />
                  </div>
                  <div>
                    <h3 className="text-ellipsis line-clamp-1 font-semibold text-lg text-[#ADFF2F]">{conv?.userDetails?.name}</h3>
                    <div className="text-[#C5C6C7] text-xs flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        {conv?.lastMsg?.imageUrl && (
                          <div className="flex items-center gap-1">
                            <span className="text-[#66FCF1]">
                              <FaImage />
                            </span>
                            {!conv?.lastMsg?.text && <span>Image</span>}
                          </div>
                        )}
                        {conv?.lastMsg?.videoUrl && (
                          <div className="flex items-center gap-1">
                            <span className="text-[#66FCF1]">
                              <FaVideo />
                            </span>
                            {!conv?.lastMsg?.text && <span>Video</span>}
                          </div>
                        )}
                      </div>
                      <p className="text-ellipsis line-clamp-1">{conv?.lastMsg?.text}</p>
                    </div>
                  </div>
                  {Boolean(conv?.unseenMsg) && (
                    <p className="text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-[#ADFF2F] text-black font-semibold rounded-full">
                      {conv?.unseenMsg}
                    </p>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
      
          {/* Edit User Modal */}
          {editUserOpen && <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />}
      
          {/* Search User Modal */}
          {openSearchUser && <SearchUser onClose={() => setOpenSearchUser(false)} />}
        </div>
      );      
    
}

export default Sidebar
