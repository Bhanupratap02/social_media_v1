import axios from "axios"




const uploadPic = async (media) => {
  try {
    const form = new FormData();
    form.append("file", media);
    form.append("upload_preset", "socila_media");
    form.append("cloud_name", "da01buahx");

    const res = await axios.post(process.env.CLOUDINARY_URL, form);
    //  return res.data.url;
    return res.data.secure_url;
  } catch (error) {
    console.log(error);
    return;
  }
};
export default uploadPic