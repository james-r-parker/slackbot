import { Box, Container, Grid, Typography } from '@mui/material';
import React from 'react';

interface HomePageProps {

}

const Home: React.FC<HomePageProps> = () => {

  return (
    <Box style={{ minHeight: 900 }}>
      <Grid container direction={'column'} spacing={2}>
        <Grid item>
          <Box sx={{ backgroundColor: "#fff" }} pb={8}>
            <Container maxWidth={'xl'}>
              <Grid container direction={'column'} spacing={5}>
                <Grid item>
                  <Typography variant='h1' component="h1">Slackbot</Typography>
                </Grid>
                <Grid item>
                  <Typography variant='subtitle1' component="h2">Manage the Slackbot commands</Typography>
                </Grid>
                <Grid item>
                  

                  
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Grid>
          <Grid item>
            <Container maxWidth={'xl'} style={{ minHeight: 600 }}>
              <Grid container direction="column" spacing={3}>
                <Grid item>

                </Grid>
              </Grid>
            </Container>
          </Grid>
      </Grid>
    </Box>
  )
}

export default Home
