/** @format */

import React from "react";
import { Button, Divider, Form, Message, Segment, TextArea } from "semantic-ui-react";
const CommonInputs = ({
  user: { bio, facebook, instagram, youtube, twitter },
  handleChange,
  showSocilalinks,
  setShowSocilaLinks,
}) => {
  return (
    <>
      <Form.Field
        required
        control={TextArea}
        name="bio"
        value={bio}
        onChange={handleChange}
        placeholder="bio"
      />
      <Button
        content="Add Social Links"
        color="red"
        icon="at"
        type="button"
        onClick={() => setShowSocilaLinks(!showSocilalinks)}
      />

      {showSocilalinks && (
        <>
          <Divider />

          <Form.Input
            icon="facebook"
            iconPosition="left"
            name="facebook"
            value={facebook}
            onChange={handleChange}
          />

          <Form.Input
            icon="twitter"
            iconPosition="left"
            name="twitter"
            value={twitter}
            onChange={handleChange}
          />

          <Form.Input
            icon="instagram"
            iconPosition="left"
            name="instagram"
            value={instagram}
            onChange={handleChange}
          />

          <Form.Input
            icon="youtube"
            iconPosition="left"
            name="youtube"
            value={youtube}
            onChange={handleChange}
          />

          <Message icon="attention"
          info 
          size="small"
          header="social Media Links Are Optional" />

        </>
      )}
    </>
  );
};

export default CommonInputs;
