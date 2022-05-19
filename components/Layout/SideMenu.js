/** @format */

import React from "react";
import { Icon, List, ListHeader } from "semantic-ui-react";
import { useRouter } from "next/router";
import { route } from "next/dist/next-server/server/router";
import Link from "next/link";
import { logoutUser } from "../../utils/authUser";
const SideMenu = ({
  user: { unreadNotification, email, unreadMessage, username },pc = true
}) => {
  const router = useRouter();

  const isActive = (route) => router.pathname === route;
  return (
    <>
      <List
        style={{ paddingTop: "1rem" }}
        size="big"
        verticalAlign="middle"
        selection
      >
        <Link href="/">
          <List.Item active={isActive("/")}>
            <Icon name="home" size="large" color={isActive("/") && "teal"} />
            <List.Content>
             { pc && <List.Header content="Home" />}
            </List.Content>
          </List.Item>
        </Link>
        <br />
    
          <List.Item active={isActive("/messages")} as="a" href="/messages">
            <Icon
              name={unreadMessage ? "hand point right" : "mail outline"}
              size="large"
              color={
                (isActive("/messages") && "teal") || (unreadMessage && "orange")
              }
            />
            <List.Content>
              {pc && <List.Header content="Messages" />}
            </List.Content>
          </List.Item>
      
        <br />
        <Link href="/notifications">
          <List.Item active={isActive("/notification")}>
            <Icon
              name={unreadNotification ? "hand point right" : "bell outlined"}
              size="large"
              color={
                (isActive("/notification") && "teal") ||
                (unreadNotification && "orange")
              }
            />
            <List.Content>
              {pc && <List.Header content="Notifications" />}
            </List.Content>
          </List.Item>
        </Link>
        <br />
        <Link href={`/${username}`}>
          <List.Item active={router.query.username === username}>
            <Icon
              name="user"
              size="large"
              color={router.query.username === username && "teal"}
            />
            <List.Content>
             {pc && <List.Header content="Account" />}
            </List.Content>
          </List.Item>
        </Link>
        <br />
        <List.Item onClick={() => logoutUser(email)}>
          <Icon name="logout" size="large" />
          <List.Content>
     {  pc &&  <List.Header content="Logout" />}
          </List.Content>
        </List.Item>
        <br />
      </List>
    </>
  );
};

export default SideMenu;
