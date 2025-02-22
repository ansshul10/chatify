import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import uploadFile from '../helpers/uploadFile';
import { IoMdSend } from "react-icons/io";
import moment from 'moment'

const MessagePage = () => {
  const params = useParams()
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const user = useSelector(state => state?.user)
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  })
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false)
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  })
  const [loading, setLoading] = useState(false)
  const [allMessage, setAllMessage] = useState([])
  const currentMessage = useRef(null)

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [allMessage])

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(preve => !preve)
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]

    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)

    setMessage(preve => {
      return {
        ...preve,
        imageUrl: uploadPhoto.url
      }
    })
  }
  const handleClearUploadImage = () => {
    setMessage(preve => {
      return {
        ...preve,
        imageUrl: ""
      }
    })
  }

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0]

    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)

    setMessage(preve => {
      return {
        ...preve,
        videoUrl: uploadPhoto.url
      }
    })
  }
  const handleClearUploadVideo = () => {
    setMessage(preve => {
      return {
        ...preve,
        videoUrl: ""
      }
    })
  }

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId)

      socketConnection.emit('seen', params.userId)

      socketConnection.on('message-user', (data) => {
        setDataUser(data)
      })

      socketConnection.on('message', (data) => {
        console.log('message data', data)
        setAllMessage(data)
      })


    }
  }, [socketConnection, params?.userId, user])

  const handleOnChange = (e) => {
    const { name, value } = e.target

    setMessage(preve => {
      return {
        ...preve,
        text: value
      }
    })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit('new message', {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id
        })
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: ""
        })
      }
    }
  }


  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 h-16 bg-[#0A0A0A] flex justify-between items-center px-4 shadow-md">
        <div className="flex items-center gap-4">
          {/* Back button only visible on smaller screens */}
          <Link to={"/"} className="lg:hidden text-[#66FCF1] hover:text-[#45A29E] transition">
            <FaAngleLeft size={25} />
          </Link>
          <h3 className="font-semibold text-lg my-0 truncate max-w-[200px] sm:max-w-none">
            {dataUser?.name}
          </h3>
        </div>
  
        {/* Online Status & Menu */}
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">
            {dataUser.online ? (
              <span className="text-[#ADFF2F]">online</span>
            ) : (
              <span className="text-[#DC143C]">offline</span>
            )}
          </p>
          <button className="cursor-pointer hover:text-[#ADFF2F] transition duration-300">
            <HiDotsVertical />
          </button>
        </div>
      </header>
  
      {/* Messages Section */}
      <section className="flex-1 overflow-y-scroll scrollbar bg-[#1F2833] bg-opacity-50 p-2">
        <div className="flex flex-col gap-3" ref={currentMessage}>
          {allMessage.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg max-w-[80%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[40%] shadow-lg ${
                user._id === msg?.msgByUserId
                  ? "ml-auto bg-[#0B0C10] text-[#ADFF2F]"
                  : "bg-[#0B0C10] text-[#ADFF2F]"
              }`}
            >
              <p className="px-2">{msg.text}</p>
              <p className="text-xs ml-auto text-[#C5C6C7] opacity-70">
                {moment(msg.createdAt).format("hh:mm")}
              </p>
            </div>
          ))}
        </div>
      </section>
  
      {/* Loading Indicator */}
      {loading && (
        <div className="w-full flex justify-center items-center text-[#66FCF1]">
          <p>Loading...</p>
        </div>
      )}
  
      {/* Message Input Section */}
      <section className="h-16 bg-[#1F2833] flex items-center px-4 shadow-md">
        <form className="h-full w-full flex gap-2 items-center" onSubmit={handleSendMessage}>
          {/* Glassmorphism Message Input */}
          <input
            type="text"
            placeholder="Type your message..."
            className="py-2 px-4 outline-none w-full bg-[#ffffff1a] text-[#ADFF2F] rounded-lg 
                       backdrop-blur-md placeholder-[#ADFF2F80] focus:ring-2 focus:ring-[#66FCF1] transition"
            value={message.text}
            onChange={handleOnChange}
          />
          <button type="submit" className="text-[#66FCF1] hover:text-[#ADFF2F] transition duration-300 p-2">
            <IoMdSend size={28} />
          </button>
        </form>
      </section>
    </div>
  );  
  

}

export default MessagePage