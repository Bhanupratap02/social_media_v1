import React, { useRef, useState } from 'react'
import { Button, Divider, Form, Message } from "semantic-ui-react"
import uploadPic from "../../utils/uploadPicToCloudinary"
import ImageDropDiv from "../Common/ImageDrop"
import CommonInputs from '../Common/CommonInputs'
import {profileUpdate} from "../../utils/profileAction"
const UpdateProfile = ({Profile}) => {

    const [profile, setProfile] = useState({
      profilePicUrl: Profile.user.profilePicUrl,
      bio: Profile.bio,
      facebook: (Profile.social && Profile.social.facebook) || "",
      youtube: (Profile.social && Profile.social.youtube) || "",
      instagram: (Profile.social && Profile.social.instagram) || "",
      twitter: (Profile.social && Profile.social.twitter) || "",
    });
   const [media, setMedia] = useState(null)
   const [mediaPreview, setMediaPreview] = useState(null)
   const [errorMsg, setErrorMsg] = useState(null)
   const [loading, setLoading] = useState(false)
   const [showSocialLinks, setshowSocialLinks] = useState(false)
   const [highlighted, setHighlighted] = useState(false)
   const inputRef=useRef()

  const handleChange = e=>{
      const { name, value, files } = e.target;
      if (name === "media") {
        if (files && files.length > 0) {
          setMedia(files[0]);
          return setMediaPreview(URL.createObjectURL(files[0]));
        }
      }
      setProfile(prev => ({...prev,[name]:value}))
  }
  return (
    <>
      <Form
        loading={loading}
        error={errorMsg}
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true)
           let profilePicUrl;
           if(media !== null){
               profilePicUrl = await uploadPic(media)
           }
           if(media !== null && !profilePicUrl){
               setLoading(false)
            return    setErrorMsg("Error Uploading Image")
           }

           await profileUpdate(profile,setLoading,setErrorMsg,profilePicUrl)
        }}
      >
        <Message
          error
          onDismiss={() => setErrorMsg(null)}
          content={errorMsg}
          header="Oops!"
          attached
        />
        <ImageDropDiv
          inputRef={inputRef}
          highlighted={highlighted}
          setHighlighted={setHighlighted}
          handleChange={handleChange}
          setMediaPreview={setMediaPreview}
          setMedia={setMedia}
          profilePicUrl={profile.profilePicUrl}
          mediaPreview={mediaPreview}
        />
        <CommonInputs
          user={profile}
          handleChange={handleChange}
          showSocilalinks={showSocialLinks}
          setShowSocilaLinks={setshowSocialLinks}
        />
        <Divider hidden />
        <Button
          color="blue"
          disabled={profile.bio === "" || loading}
          icon="pencil alternate"
          content="Submit"
          type="submit"
        />
      </Form>
    </>
  );
}

export default UpdateProfile