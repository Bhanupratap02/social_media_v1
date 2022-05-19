/** @format */

import React, { useEffect, useState } from "react";
import { Button, Image, List } from "semantic-ui-react";
import Spinner from "../Layout/Spinner";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";
import {NoFollowData} from "../Layout/NoData"
import {followUser,unfollowUser} from "../../utils/profileAction"
const Followers = ({
  user,
  loggedUserFollowStats,
  setUserFollowStats,
  profileUserId,
}) => {
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);
  useEffect(
    () => {
    const getFollowers = async () => {
      setLoading(true);
      try {
       const res = await axios.get(
         `${baseUrl}/api/profile/followers/${profileUserId}`,
         {
           headers: { Authorization: cookie.get("token") },
         }
       );

        setFollowers(res.data);
      } catch (error) {
        alert("Error Loading Followers");
      }
      setLoading(false);
    };
    getFollowers();
  }, []);
   console.log(followers)
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        followers?.length > 0 ?
        followers?.map((profilefollower) => {
          const isFollowing =
            loggedUserFollowStats.following.length > 0 &&
            loggedUserFollowStats.following.filter(
              (following) => following.user === profilefollower.user._id
            ).length > 0;
          return (
            <>
              <List
                key={profilefollower.user._id}
                divided
                verticalAlign="middle"
              >
                <List.Item>
                  <List.Content floated="right">
                    {profilefollower.user._id !== user._id && (
                      <Button
                        color={isFollowing ? "instagram" : "twitter"}
                        content={isFollowing ? "Following" : "Follow"}
                        icon={isFollowing ? "check" : "add user"}
                        disabled={followLoading}
                        onClick={async()=>{
                          setFollowLoading(true)
                          isFollowing
                            ? await unfollowUser(
                                profilefollower.user._id,
                                setUserFollowStats
                              )
                            :await followUser(
                                profilefollower.user._id,
                                setUserFollowStats
                              );
                                 setFollowLoading(false);
                        }}
                      />
                    )}
                  </List.Content>
                  <Image avatar src={profilefollower.user.profilePicUrl} />
                  <List.Content
                    as="a"
                    href={`/${profilefollower.user.username}`}
                  >
                    {profilefollower.user.name}
                  </List.Content>
                </List.Item>
              </List>
            </>
          );
        }):<NoFollowData followersComponent={true}/>
      )}
    </>
  );
};

export default Followers;
