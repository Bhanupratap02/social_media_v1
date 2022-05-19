/** @format */

import axios from "axios";
import Router from "next/router";
import baseUrl from "./baseUrl";
import cookie from "js-cookie";
import catchErrors from "./catchErrors";

export const registerUser = async (user, profilePicUrl, setError, setLoading) => {
  try {
    const res = await axios.post(`${baseUrl}/api/signup`, {
      user,
      profilePicUrl,
    });
    setToken(res.data);
  } catch (error) {
    const errorMEssage = catchErrors(error);
    setError(errorMEssage);
  }
  setLoading(false);
};
export const loginUser = async (user, setError, setLoading) => {
  setLoading(true);
  try {
    const res = await axios.post(`${baseUrl}/api/auth`, { user });
    setToken(res.data);
  } catch (error) {
    const errorMEssage = catchErrors(error);
    setError(errorMEssage);
  }
  setLoading(false);
};

export const redirectUser = (ctx, location) => {
  if (ctx.req) {
    ctx.res.writeHead(302, { Location: location });
    ctx.res.end();
  } else {
    Router.push(location);
    //  window.location.href = location;
   
  }
};

const setToken = (token) => {
  cookie.set("token", token);
  Router.push("/");
};

export const logoutUser = (email) => {
  cookie.set("userEmail", email);
  cookie.remove("token");
  Router.push(`/login`);
  Router.reload();
};
;
