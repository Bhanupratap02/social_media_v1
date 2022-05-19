/** @format */

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import baseUrl from "../utils/baseUrl";
import {
  Segment,
  Header,
  Divider,
  Comment,
  Grid,
  Icon,
} from "semantic-ui-react";
import io from "socket.io-client";
import ChatListSearch from "../components/Chats/ChatListSearch";
import { useRouter } from "next/router";
import { NoMessages } from "../components/Layout/NoData";
import Banner from "../components/Messages/Banner";
import Message from "../components/Messages/Message";
import MessageInput from "../components/Messages/MessageInput";
import Chat from "../components/Chats/Chat";
import getUserInfo from "../utils/getUserInfo"
import newMsgSound from "../utils/newMsgSound"
import cookie from "js-cookie"


const scrollDivToBottom =divRef =>{
 divRef.current !== null && divRef.current.scrollIntoView({behaviour:"smooth"})
}

const Messages = ({ chatsData, errorLoading, user }) => {
  const [chats, setChats] = useState(chatsData);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const router = useRouter();
  const socket = useRef();
  const [messages, setMessages] = useState([]);
  const [bannerdata, setBannerdata] = useState({ name: "", profilePicUrl: "" });


   const divRef = useRef()

  // this ref is for persisting th state of query string in url throught re-renders.this ref is the query string inside url
  const openChatId = useRef("");
 // connection use effect
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }
    if (socket.current) {
      socket.current.emit("join", { userId: user._id });
      socket.current.on("connectedUsers", ({ users }) => {
        users.length > 0 && setConnectedUsers(users);
      });
    }

    if (chats.length > 0 && !router.query.message)
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
        shallow: true,
      });
   
  }, []);

  // load messages use effect
  useEffect(() => {
    const loadMessage = () => {
      socket.current.emit("loadMessage", {
        userId: user._id,
        messagesWith: router.query.message,
      });

      socket.current.on("messagesLoaded", ({ chat }) => {
        setMessages(chat.messages);
        setBannerdata({
          name: chat.messagesWith.name,
          profilePicUrl: chat.messagesWith.profilePicUrl,
        });

        openChatId.current = chat.messagesWith._id;
        divRef.current && scrollDivToBottom(divRef)
      });

       socket.current.on("noChatFound",async()=>{
      const res =  await getUserInfo(router.query.message)
      if(res){
        const {name,profilePicUrl} = res
         setBannerdata({ name, profilePicUrl });
      }
      
       setMessages([])
       openChatId.current = router.query.message
         });

    };
    if (socket.current && router.query.message) {
      loadMessage();
    }
  }, [router.query.message]);

  const sendMsg = msg =>{
    if(socket.current){
      socket.current.emit("sendNewMsg",{
        userId:user._id,
        msgSendToUserId:openChatId.current,
        msg
      })
    }
  }
  // confirming msg is sent and receiving the message
  useEffect(() => {
    if(socket.current){
      socket.current.on("msgSent",({newMsg})=>{
        if(newMsg.receiver === openChatId.current){
          setMessages(prev => [...prev,newMsg]);

          setChats(prev =>{
            const previousChat = prev.find(chat => chat.messagesWith === newMsg.receiver)
            previousChat.lastMessage = newMsg.msg;
            previousChat.date = newMsg.date

              return [...prev];
          });
        }
      });

          socket.current.on("newMsgreceived", async ({ newMsg }) => {
            let senderName;
            // when chat is opened inside youre browser
            if (newMsg.sender === openChatId.current) {
              setMessages((prev) => [...prev, newMsg]);

              setChats((prev) => {
                const previousChat = prev.find(
                  (chat) => chat.messagesWith === newMsg.sender
                );
                previousChat.lastMessage = newMsg.msg;
                previousChat.date = newMsg.date;
                
                senderName = previousChat.name;
                return [...prev];
              });
            }
            // chat if not oppen or other chat is oppened
            else {
              const ifPreviouslyMessaged =
                chats.filter((chat) => chat.messagesWith === newMsg.sender)
                  .length > 0;
              // chat is not oppen but you chat with that user atleast once
              if (ifPreviouslyMessaged) {
                setChats((prev) => {
                  const previousChat = prev.find(
                    (chat) => chat.messagesWith === newMsg.sender
                  );
                  previousChat.lastMessage = newMsg.msg;
                  previousChat.date = newMsg.date;
                senderName = previousChat.name;
                  return [...prev];
                });
              }
              // if youre not chat or conversation with that user
              else {
                const { name, profilePicUrl } = await getUserInfo(
                  newMsg.sender
                );
                 senderName = name;
                const newChat = {
                  messagesWith: newMsg.sender,
                  name,
                  profilePicUrl,
                  lastMessage: newMsg.msg,
                  date: newMsg.date,
                };
                setChats((prev) => [newChat, ...prev]);
              }
            }
            newMsgSound(senderName)
          });


    }
  }, [])
  
  useEffect(() => {
 messages && messages.length > 0 && scrollDivToBottom(divRef)
  }, [messages])
  const deleteMsg=(messageId)=>{
    if(socket.current){
      socket.current.emit('deleteMsg',{
       userId:user._id,
       messagesWith:openChatId.current,
       messageId
      })
    }
    socket.current.on("msgDeleted",()=>{
      setMessages(prev => prev.filter(message => message._id !== messageId))
    });

  }
   const deleteChat = async (messagesWith) =>{
     try {
        await axios.delete(`${baseUrl}/api/chats/${messagesWith}`,{
          headers:{Authorization:cookie.get("token")}
        })
        setChats(prev => prev.filter(chat =>chat.messagesWith !== messagesWith));
        router.push("/messages",undefined,{shallow:true})
     } catch (error) {
       alert("Error deleting Chat")
     }
   }
  return (
    <>
      <Segment padded basic size="large" style={{ marginTop: "5px" }}>
        <a href="/">
          <Header icon="home" content="Go Back" style={{ cursor: "pointer" }} />
        </a>

        <Divider hidden />
        <div style={{ marginTop: "10px" }}>
          <ChatListSearch chats={chats} setChats={setChats} />
        </div>
        {chats.length > 0 ? (
          <>
            <Grid stackable>
              <Grid.Column width={4}>
                <Comment.Group size="big">
                  <Segment
                    raised
                    style={{ overflow: "auto", maxHeight: "32rem" }}
                  >
                    {chats.map((chat, i) => (
                      <Chat
                        connectedUsers={connectedUsers}
                        key={i}
                        chat={chat}
                        deleteChat={deleteChat}
                      />
                    ))}
                  </Segment>
                </Comment.Group>
              </Grid.Column>

              <Grid.Column width={12}>
                {router.query.message && (
                  <>
                    <div
                      style={{
                        overflow: "auto",
                        overflowX: "hidden",
                        maxHeight: "35rem",
                        height: "35rem",
                        backgroundColor: "whitesmoke",
                      }}
                    >
                      <div style={{ position: "sticky", top: "0" }}>
                        <Banner bannerdata={bannerdata} />
                      </div>
                      {messages && messages.length > 0 && (
                        <>
                          {messages.map((message, i) => (
                            <Message
                              divRef={divRef}
                              key={i}
                              bannerProfilePic={bannerdata.profilePicUrl}
                              message={message}
                              user={user}
                              deleteMsg={deleteMsg}
                            />
                          ))}
                        </>
                      )}
                    </div>
                    <MessageInput sendMsg={sendMsg} />
                  </>
                )}
              </Grid.Column>
            </Grid>
          </>
        ) : (
          <>
            <NoMessages />
          </>
        )}
      </Segment>
    </>
  );
};
Messages.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/chats`, {
      headers: { Authorization: token },
    });
    return { chatsData: res.data };
  } catch (error) {
    console.log(error);
    return { errorLoading: true };
  }
};
export default Messages;

