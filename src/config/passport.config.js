// config/passport.config.js
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { User } from '../models/user/user.model.js';

export const initializePassport = (passport) => {

    // --- Local Strategy (Email/Password Login) ---
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'No user with that email' });
            }
            if (!user.password) {
                return done(null, false, { message: 'Please log in with the method you originally signed up with.' });
            }

            const isMatch = await user.matchPassword(password);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (err) {
            return done(err);
        }
    }));

    // // --- Google OAuth Strategy ---
    // passport.use(new GoogleStrategy({
    //     clientID: process.env.GOOGLE_CLIENT_ID,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //     callbackURL: '/api/auth/google/callback'
    // }, async (accessToken, refreshToken, profile, done) => {
    //     const newUser = {
    //         googleId: profile.id,
    //         username: profile.displayName.replace(/\s/g, '') + Math.floor(Math.random() * 1000), // Create a unique username
    //         email: profile.emails[0].value,
    //         profilePic: profile.photos[0].value
    //     };

    //     try {
    //         let user = await User.findOne({ googleId: profile.id });
    //         if (user) {
    //             return done(null, user);
    //         } else {
    //             // Check if user exists with this email already
    //             user = await User.findOne({ email: profile.emails[0].value });
    //             if (user) {
    //                 // Link account
    //                 user.googleId = profile.id;
    //                 user.profilePic = user.profilePic || profile.photos[0].value;
    //                 await user.save();
    //                 return done(null, user);
    //             } else {
    //                 // Create new user
    //                 user = await User.create(newUser);
    //                 return done(null, user);
    //             }
    //         }
    //     } catch (err) {
    //         return done(err);
    //     }
    // }));
    
    // --- GitHub OAuth Strategy ---
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email'] // Important: to get user's email
    }, async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails && profile.emails[0].value ? profile.emails[0].value : `${profile.username}@github.placeholder.com`;
        
        const newUser = {
            githubId: profile.id,
            username: profile.username || profile.displayName,
            email: email,
            profilePic: profile.photos[0].value
        };

        try {
            let user = await User.findOne({ githubId: profile.id });
            if (user) return done(null, user);

            user = await User.findOne({ email: email });
            if (user) {
                user.githubId = profile.id;
                user.profilePic = user.profilePic || profile.photos[0].value;
                await user.save();
                return done(null, user);
            }
            
            user = await User.create(newUser);
            return done(null, user);

        } catch (err) {
            return done(err);
        }
    }));
    
    // ... LinkedIn Strategy would follow a similar pattern ...

    // --- Session Management ---
    // Stores the user ID in the session cookie
    passport.serializeUser((user, done) => {
        done(null, user._id || user.id);
    });

    // Retrieves the full user details from the DB using the ID from the session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch(err) {
            done(err);
        }
    });
};