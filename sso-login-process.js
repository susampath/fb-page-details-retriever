const express = require('express');
const axios = require('axios');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const https = require('https');
const fs = require('fs');

const app = express();

// Configure session (replace secret with a strong random string)
app.use(session({ secret: 'your_scret', resave: false, saveUninitialized: true }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
const options = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.cert')
  };
const server = https.createServer(options, app);

// Configure Facebook strategy
// Configure Facebook strategy with verify callback
passport.use(new FacebookStrategy({
    clientID: 'your_application_id',
    clientSecret: 'your_application_secret',
    callbackURL: 'https://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName'] 
  }, (accessToken, refreshToken, profile, done) => {

    const user = { id: profile.id, name: profile.displayName , accessToken:accessToken};
  
    // Pass the user object to Passport for session creation
    done(null, user);
  }));

// Define serialization and deserialization for Passport session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  // Simulate fetching user data from database (replace with actual logic)
  const user = { id, name: 'Retrieved User' };
  done(null, user);
});

// Login route - initiate Facebook login flow
app.get('/login', passport.authenticate('facebook',
{scope: ['pages_manage_cta', 'pages_show_list','pages_read_engagement','pages_manage_metadata','pages_read_user_content','pages_manage_ads','pages_manage_posts','pages_manage_engagement','public_profile']}
));

// Callback route - handle Facebook redirection after login
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/protected', failureRedirect: '/login' }));

// Protected route - only accessible to authenticated users
app.get('/protected',async (req, res) => {
  if (req.user) {
    console.log(req.user.id.accessToken)
   const pageId = 'your_page_id'; 
   const accessToken = req.user.id.accessToken;
   let url = `https://graph.facebook.com/v15.0/me/accounts?fields=access_token&access_token=${accessToken}`;
    const response = await axios.get(url);
    let accessurl = `https://graph.facebook.com/${pageId}/posts?fields=message,attachments&access_token=${response.data.data[0].access_token}`;
    const responsePage = await axios.get(accessurl);
    const data = formatData(responsePage.data.data);
    res.json(data);
  } else {
    res.redirect('/login');
  }
});

/**
 * * Formats the data received from Facebook API into a structured format.
 * @param {Array<Object>} data - The data received from Facebook API.
 * @returns {Array<Object>} An array of formatted objects representing Facebook posts.
 */
function formatData(data) {
    try {
        return data.map(dataObj => {
            const responseObj = {
                id: dataObj.id,
                message: dataObj.message || '',
                type: 'Post'
            };

            if (dataObj.attachments && dataObj.attachments.data && dataObj.attachments.data.length > 0) {
                const attachment = dataObj.attachments.data[0];
                const attachmentsObject = {
                    source: attachment.media ? attachment.media.source : '',
                    faceBookLink: attachment.target ? attachment.target.url : ''
                };

                if (attachment.type === 'video_inline') {
                    responseObj.type = 'Video';
                    attachmentsObject.thumbnailHeight = attachment.media ? attachment.media.image.height : '';
                    attachmentsObject.thumbnailWidth = attachment.media ? attachment.media.image.width : '';
                    attachmentsObject.thumbnailImage = attachment.media ? attachment.media.image.src : '';
                } else if (attachment.type === 'photo') {
                    responseObj.type = 'Photo';
                    attachmentsObject.imageHeight = attachment.media ? attachment.media.image.height : '';
                    attachmentsObject.imageWidth = attachment.media ? attachment.media.image.width : '';
                    attachmentsObject.image = attachment.media ? attachment.media.image.src : '';
                } else if (attachment.type === 'profile_media') {
                    responseObj.type = 'Profile Media';
                    responseObj.title = attachment.title || '';
                    attachmentsObject.imageHeight = attachment.media ? attachment.media.image.height : '';
                    attachmentsObject.imageWidth = attachment.media ? attachment.media.image.width : '';
                    attachmentsObject.image = attachment.media ? attachment.media.image.src : '';
                }

                responseObj.attachments = attachmentsObject;
            }

            return responseObj;
        });
    } catch (error) {
        console.log(error);
        return [];
    }
}


server.listen(3000, () => {
    console.log(`Server is running on https://localhost:3000}`);
  });
