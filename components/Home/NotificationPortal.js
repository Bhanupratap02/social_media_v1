import React from 'react'
import {Segment,TransitionablePortal,Icon,Feed} from "semantic-ui-react"
import newMsgSound from '../../utils/newMsgSound';
import {useRouter} from "next/router"
import calculateTime from '../../utils/calculatetime';
const NotificationPortal = ({
  newNotification,
  notificationPopup,
  setNotificationPopup,
}) => {
    const router = useRouter()
    const { name, profilePicUrl, username, postId } = newNotification

  return (
    <TransitionablePortal
      transition={{ animation: "fade left", duration: "500" }}
      onClose={() => notificationPopup && setNotificationPopup(false)}
      onOpen={newMsgSound}
      open={notificationPopup}
    >
      <Segment
        style={{ right: "5%", position: "fixed", top: "10%", zindex: 1000 }}
      >
        <Icon
          name="close"
          size="large"
          style={{ float: "right", cursor: "pointer" }}
          onClick={() => setNotificationPopup(false)}
        />
        <Feed>
          <Feed.Event>
            <Feed.Label>
              <img src={profilePicUrl} />
            </Feed.Label>
            <Feed.Content>
              <Feed.Summary>
                <Feed.User onClick={() => router.push(`/${username}`)}>
                  {name}{" "}
                </Feed.User>{" "}
                liked your{" "}
                <a onClick={() => router.push(`/post/${postId}`)}> post</a>
                <Feed.Date>{calculateTime(Date.now())}</Feed.Date>
              </Feed.Summary>
            </Feed.Content>
          </Feed.Event>
        </Feed>
      </Segment>
    </TransitionablePortal>
  );
};

export default NotificationPortal
