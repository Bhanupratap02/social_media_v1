/** @format */

import axios from "axios";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import baseUrl from "../utils/baseUrl";
import { Container, Divider, Feed, Segment } from "semantic-ui-react";
import cookie from "js-cookie";
import { NoNotifications } from "../components/Layout/NoData";
import LikeNotification from "../components/NotificationComponent/LikeNotification";
import CommentNotification from "../components/NotificationComponent/CommentNotification";
import FollowerNotification from "../components/NotificationComponent/FollowerNotification";
const notifications = ({
  notifications,
  errorLoading,
  user,
  userFollowStats,
}) => {
  const [loggedUserFollowStats, setUserFollowStats] = useState(userFollowStats);

 useEffect(() => {
   (async () => {
     try {
       await axios.post(
         `${baseUrl}/api/notifications`,
         {},
         { headers: { Authorization: cookie.get("token") } }
       );
     } catch (error) {
       console.log(error);
     }
   })();
 }, []);


  return (
    <>
      <Container style={{ marginTop: "1.5rem" }}>
        {notifications.length > 0 ? (
          <Segment color="teal" raised>
            <div
              style={{
                maxHeight: "40rem",
                overflow: "auto",
                height: "40rem",
                position: "relative",
                width:"100%"
              }}
            >
              <Feed size="small">
                {notifications.map((notification) => (
                  <>
                    {notification.type === "newLike" &&
                      notification.post !== null && (
                        <LikeNotification
                          key={notification._id}
                          notification={notification}
                        />
                      )}
                    {notification.type === "newComment" &&
                      notification.post !== null && (
                        <CommentNotification
                          key={notification._id}
                          notification={notification}
                        />
                      )}
                    {notification.type === "newFollower" && (
                      <FollowerNotification key={notification._id}
                       notification={notification}
                       loggedUserFollowStats={loggedUserFollowStats}
                       setUserFollowStats={setUserFollowStats}
                      />
                    )}
                  </>
                ))}
              </Feed>
            </div>
          </Segment>
        ) : (
          <NoNotifications />
        )}
        <Divider hidden />
      </Container>
    </>
  );
};

notifications.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/notifications`, {
      headers: { Authorization: token },
    });
    return { notifications: res.data };
  } catch (error) {
    console.log(error);
    console.log("hii")
    return { errorLoading: true };
  }
};

export default notifications;
