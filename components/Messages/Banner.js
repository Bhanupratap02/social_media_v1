import React from 'react'
import {Segment,Grid,Image} from "semantic-ui-react"
const Banner = ({bannerdata}) => {

 const { name, profilePicUrl } = bannerdata;
  return (
   <>
   <Segment color="teal" attached="top" >
   <Grid>
    <Grid.Column floated="left" width={14}>
        <h4>
            <Image avatar src={profilePicUrl} />
            {name}
        </h4>
    </Grid.Column>
   </Grid>
   </Segment>
   
   </>
  )
}

export default Banner