/** @format */

import React, { useState } from "react";
import {Form,Modal,Segment,List,Icon} from "semantic-ui-react"
import Link from "next/link"
import calculateTime from "../../utils/calculatetime";
const MessageNotificationModal = ({
  socket,
  setNewMessageModal,
  newMessageModal,
  newMessagereceived,
  user
}) => {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const onModalClose = () => setNewMessageModal(false)

  const formSubmit= (e) =>{
   e.preventDefault()
   if(socket.current){
     socket.current.emit("sendMsgFromNotification",{
       userId:user._id,
       msgSendToUserId:newMessagereceived.sender,
       msg:text
     })
     socket.current.on('msgSentFromNotificatio',()=>{
       setNewMessageModal(false)
     })
   }
  }
  return (
    <>
      <Modal
        size="small"
        open={newMessageModal}
        onClose={onModalClose}
        closeIcon
        closeOnDimmerClick
      >
        <Modal.Header
          content={`New Message from ${newMessagereceived.senderName}`}
        />
        <Modal.Content>
          <div className="bubbleWrapper">
            <div className="inlineContainer">
              <img
                className="inlineIcon"
                src={newMessagereceived.senderProfilePic}
              />
            </div>
            <div className="otherBubble other">{newMessagereceived.msg}</div>
            <span className="other">
              {calculateTime(newMessagereceived.date)}
            </span>
          </div>
          <div style={{ position: "sticky", bottom: "0px" }}>
            <Segment secondary color="teal" attached="bottom">
              <Form
                reply
                onSubmit={formSubmit}
              >
                <Form.Input
                  size="large"
                  placeholder="Send New Message"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  action={{
                    color: "blue",
                    icon: "telegram place",
                    disabled: text === "",
                    loading: loading,
                  }}
                />
              </Form>
            </Segment>
          </div>

          <div style={{marginTop:"5px"}}>
           <Link href={`/messages?message=${newMessagereceived.sender}`}>
               <a>View All Messages</a>
           </Link>
           <br />
           <Instructions username={user.username} />
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
};
const Instructions = ({ username }) => (
  <List>
    <List.Item>
      <Icon name="help" />
      <List.Content>
        <List.Header>
          If you do not like this popup to appear when you receive a new
          message:
        </List.Header>
      </List.Content>
    </List.Item>

    <List.Item>
      <Icon name="hand point right" />
      <List.Content>
        You can disable it by going to
        <Link href={`/${username}`}>
          <a> Account </a>
        </Link>
        Page and clicking on Settings Tab.
      </List.Content>
    </List.Item>

    <List.Item>
      <Icon name="hand point right" />
      Inside the menu,there is an setting named: Show New Message Popup?
    </List.Item>

    <List.Item>
      <Icon name="hand point right" />
      Just toggle the setting to disable/enable the Message Popup to appear.
    </List.Item>
  </List>
);
export default MessageNotificationModal;
