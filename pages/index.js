/** @format */

import React, { useEffect, useRef, useState } from "react";
import CardPost from "../components/Posts/CardPost";
import CreatePost from "../components/Posts/CreatePost";
import { Segment } from "semantic-ui-react";
import { parseCookies } from "nookies";
import { NoPosts } from "../components/Layout//NoData";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { PostDeleteToastr } from "../components/Layout/Toastr";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  PlaceHolderPosts,
  EndMessage,
} from "../components/Layout/PlaceHolderGroup";
import cookie from "js-cookie";
import io from "socket.io-client";
import getUserInfo from "../utils/getUserInfo";
import MessageNotificationModal from "../components/Home/MessageNotificationModal "
import newMsgSound from "../utils/newMsgSound"
import NotificationPortal from "../components/Home/NotificationPortal"
const index = ({ user, postData, errorLoading }) => {
  const [posts, setPosts] = useState(postData);
  const [showToastr, setShowToastr] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(2);

  const socket = useRef();

  const [newMessagereceived, setNewMessagereceived] = useState(null);
  const [newMessageModal, setNewMessageModal] = useState(false);

const [newNotification, setNewNotification] = useState(null)
const [notificationPopup, setNotificationPopup] = useState(false)

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }
    if (socket.current) {
      socket.current.emit("join", { userId: user._id });
      socket.current.on("newMsgreceived", async ({ newMsg }) => {
        const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
        if (user.newMessagePopup) {
          setNewMessagereceived({
            ...newMsg,
            senderName: name,
            senderProfilePic: profilePicUrl,
          });
          setNewMessageModal(true);
        }
         newMsgSound(name)

      });
    }
    document.title = `Welcome ${user.name.split(" ")[0]}`;

  }, []);
  useEffect(() => {
    showToastr && setTimeout(() => setShowToastr(false), 3000);
  }, [showToastr]);

  useEffect(() => {
  
    if(socket.current){
      socket.current.on(
        "newNotificationReceived",
        ({ name, profilePicUrl, username, postId }) => {
          setNewNotification({ name, profilePicUrl, username, postId });
          setNotificationPopup(true)
        }
      );
    }


  }, [])
  


  const fetchDataOnScroll = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/posts`, {
        headers: { Authorization: cookie.get("token") },
        params: { pageNumber },
      });
      if (res.data.length === 0) setHasMore(false);

      setPosts((prev) => [...prev, ...res.data]);
      setPageNumber((prev) => prev + 1);
    } catch (error) {
      alert("Error fetching Posts");
    }
  };
  return (
    <>
    {notificationPopup && newNotification !== null && <NotificationPortal 
     newNotification={newNotification}
  notificationPopup={notificationPopup}
  setNotificationPopup={setNotificationPopup}
    />}
      {showToastr && <PostDeleteToastr />}
         {newMessageModal && newMessagereceived !== null && <MessageNotificationModal 
         socket={socket}
         setNewMessageModal={setNewMessageModal}
         newMessageModal={newMessageModal}
         newMessagereceived={newMessagereceived}
          user={user}
         />}


      <Segment>
        {" "}
        <CreatePost user={user} setPosts={setPosts} />
        {posts.length === 0 || errorLoading ? (
          <NoPosts />
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            next={fetchDataOnScroll}
            loader={<PlaceHolderPosts />}
            endMessage={<EndMessage />}
            dataLength={posts.length}
          >
            {posts.map((post) => (
              <CardPost
                socket={socket}
                key={post._id}
                post={post}
                user={user}
                setPosts={setPosts}
                setShowToastr={setShowToastr}
              />
            ))}
          </InfiniteScroll>
        )}
      </Segment>
    </>
  );
};
index.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/posts`, {
      headers: { Authorization: token },
      params: { pageNumber: 1 },
    });
    return { postData: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};
export default index;
