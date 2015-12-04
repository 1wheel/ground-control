import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';
import writeSchema from './data/writeSchema';
import path from 'path';
import fallback from 'express-history-api-fallback';
import bodyParser from 'body-parser';
import session from 'express-session';
import BSD from './bsd';
import MG from './mail';
import demoData from './data/demo.json';
import models from './data/models'
import log from './log';
import {fromGlobalId} from 'graphql-relay'
import passport from 'passport';
import LocalStrategy  from 'passport-local'
import SequelizeStoreFactory from 'connect-session-sequelize'
import url from 'url';
import Minilog from 'minilog';

writeSchema();

const clientLogger = Minilog('client')
const SequelizeStore = SequelizeStoreFactory(session.Store)
const Mailgun = new MG(process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN);
const BSDClient = new BSD(process.env.BSD_HOST, process.env.BSD_API_ID, process.env.BSD_API_SECRET);
const port = process.env.APP_PORT || process.env.PORT;
const publicPath = path.resolve(__dirname, '../frontend/public');

passport.use('signup', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, email, password, done) => {
    let user = await models.User.findOne({
      where: {
        email: email
      }
    });

    if (!user) {
      let newUser = await models.User.create({
        email: email,
        password: password,
      });
      return done(null, newUser);
    }
    else if (!await user.verifyPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  }
));

passport.serializeUser(async (user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  let user = await models.User.findById(id);
  done(null, user);
  return user;
});

const app = express();
const sessionStore = new SequelizeStore({
  db: models.sequelize,
  table: 'Session'
})

app.use(express.static(publicPath))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/graphql', graphQLHTTP((request) => {
  return {
    rootValue: { user: request.user },
    schema: Schema
  }
}));

// this endpoint may be used for caching and serving available event types and their attributes to the event creation form
app.get('/events/types.json', async (req, res) => {
  let result = await BSDClient.getEventTypes();
  res.json(result);
});

app.post('/log', (req, res) => {
  let parsedURL = url.parse(req.url, true);
  let logs = req.body.logs;
  logs.forEach((message) => {
    let app = message[0];
    let method = message[1];
    let client = parsedURL.query.client_id ? parsedURL.query.client_id : ''

    message = message.slice(2);
    let writeLog = (line) => {
      let logLine = '(' + client + '): ' + line;
      clientLogger[method](logLine);
    }

    message.forEach((logEntry) => {
      if (typeof logEntry === 'object')
        writeLog(JSON.stringify(logEntry))
      else {
        logEntry.split('\n').forEach((line) => {
          writeLog(line)
        })
      }
    })
  })

  res.send('')
})

app.post('/signup',
  passport.authenticate('signup'),
  (req, res) => {
  res.send('Success!')
})

// this endpoint is for testing email rendering/sending
app.get('/events/confirmation-email', async (req, res) => {
  let event_types = await BSDClient.getEventTypes();
  let result = await Mailgun.sendEventConfirmation(demoData.EventCreationForm, demoData.EventCreationConstituent, event_types, true);
  res.send(result.html)
});

app.get('/events/create', (req, res) => {
  res.sendFile(publicPath + '/events/create_event.html');
});

app.post('/events/create', async (req, res) => {
  let form = req.body;

  // constituent object not being returned right now
  let constituent = await BSDClient.getConstituentByEmail(form.cons_email);

  if (!constituent){
    constituent = await BSDClient.createConstituent(form.cons_email);
  }

  let event_types = await BSDClient.getEventTypes();

  let result = await BSDClient.createEvents(constituent.id, form, event_types, eventCreationCallback);

  // send event creation confirmation email
  function eventCreationCallback(status){
  	res.json(status);
  	if (status == 'success'){
  		Mailgun.sendEventConfirmation(form, constituent, event_types);
  	}
  }
});

app.use(fallback('index.html', { root: publicPath }))

app.listen(port, () => log.info(
`Server is now running on http://localhost:${port}`
))



