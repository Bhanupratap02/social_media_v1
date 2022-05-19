


import React, { useEffect, useState } from 'react'
import axios from "axios";
import {List,Image,Search} from "semantic-ui-react"
import baseUrl from "../../utils/baseUrl"
import  {useRouter} from"next/router"
import cookie from "js-cookie"


let cancel;
const ChatListSearch = ({chats,setChats}) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
 const router = useRouter()
  const handleChange = async (e) => {
    const { value } = e.target;
    setText(value);

    if (value.length === 0) return;

    //trim will remove white spaces.
    if (value.trim().length === 0) return;

    setLoading(true);

    try {
      cancel && cancel();
      const CancelToken = axios.CancelToken;
      const token = cookie.get("token");

      const res = await axios.get(`${baseUrl}/api/search/${value}`, {
        headers: { Authorization: token },
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });
      if (res.data.length === 0) {
        results.length > 0 && setResults([]);
        setLoading(false);
      }
      setResults(res.data);
    } catch (error) {
      console.log("Error Searching", error);
    }
    setLoading(false);
  };
  const addChat = (result) => {
    console.log(result);
    const alreadyInChat =
      chats?.length > 0 &&
      chats.filter((chat) => chat.messagesWith === result._id).length > 0;
    if (alreadyInChat) {
      return router.push(`/messages?message=${result._id}`);
    } else {
      const newChat = {
        messageswith: result._id,
        name: result.name,
        profilePicUrl: result.profilePicUrl,
        lastMessage: "",
        date: Date.now(),
      };
      setChats((prev) => [newChat, ...prev]);
      return router.push(`/messages?message=${result._id}`);
    }
  };

  useEffect(() => {
    if (text?.length === 0 && loading) setLoading(false);
  }, [text]);


  return ( 
    <Search
      onBlur={() => {
        results?.length > 0 && setResults([]);
        loading && setLoading(false);
        setText("");
      }}
      loading={loading}
      resultRenderer={ResultRenderer}
      results={results}
      onSearchChange={handleChange}
      minCharacters={1}
      onResultSelect={(e, data) => addChat(data.result) }
      style={{marginBottom:"10px"}}
    />
  );
};


 
const ResultRenderer = ({_id,profilePicUrl,name}) => {

  return (
    <List key={_id}>
      <List.Item>
        <Image src={profilePicUrl} alt="ProfilePic" avatar />
        <List.Content header={name} as="a" />
      </List.Item>

    </List>
  )
}

export default ChatListSearch