# Ground Control

## Getting started

### Linux

The easiest way to get started in Linux is with [Docker](https://docs.docker.com/engine/installation/ubuntulinux/).  After installing Docker, just run:

`docker compose up`

### OS X

In OS X, we currently run everything locally using a Procfile and node-foreman. To get started, install [Node.js](https://nodejs.org/en/download/) and [Homebrew](http://brew.sh/). Then do the following:

```
npm install
./setup-osx
```

Then you should be able to start Ground Control on `http://localhost:3000` with

`npm run dev`

If you ever want to re-seed the database, run

`npm run seed`

The seed script will create an admin user with e-mail address `admin@localhost.com` and password `admin`.  Login with those credentials when you first go to `localhost:3000` and then check out `localhost:3000/admin`.

### Windows

The best way to run everything on Windows is probably to try to get Docker working on Windows and use the Linux installation instructions.

## What does this do and how do I get started?

Currently, Ground Control is two things:

* A tool for calling other volunteers of the campaign and integrating that data back into BSD, which is a CRM the campaign uses.  In the near future, it is going to also be used to call voters.
* A tool to create and manage events.  These include both volunteer-run events and official events.  The goal here is to replace (https://go.berniesanders.com/page/event/create)[https://go.berniesanders.com/page/event/create] and start replacing some of the functionality of the event administration backed.

To get started with Ground Control, once it's running, go to `http://localhost:3000/admin`. From there, you can see the events administration section and the call assignment creation section.  To create a call assignment, do the following:

1. Make a survey in Blue State Digital.  If you are developing on Ground Control, ask Saikat for access to the BSD testbed.
2. Make a constituent group that you wish to be the target of your phonebanking assignment in BSD.
3. Go to `http://localhost:3000/admin/call-assignments`, click Create, and enter the BSD IDs of your survey and target group in the form.
4. Click create

Now, if you go to `http://localhost:3000` and signup/login, you shoul see your assignment on the left side.  Click it to test it out and start making calls!

## What's the end game?

The grand purpose of Ground Control is to be:

1. A central portal for volunteers who want to get involved with the campaign and an admin interface to manage volunteers. We want this to be the landing page on the homepage as soon as someone wants to volunteer for Bernie.

2. The central routing point/API for applications to integrate with the CRMs the campaign uses (BSD and VAN)

3. Be a repository for data that does not fit neatly into BSD and VAN and give people outside of our system access to this data as well

4. An effort to build out more organizing tools on top of what we already have (which leads to the data in #2).

## What are these "CRMs the campaign uses?"

BSD is Blue State Digital and VAN is Voter Activation Network.  BSD is basically a CRM including a mailer, way to create surveys, and way to look at signup data.  VAN is a giant database of voter information that is used for canvassing/voter outreach efforts.  Here is a rough diagram of how it fits together. Rectangles are things that exist, circles are things we are building: [https://gomockingbird.com/projects/0govthz/sXMAyD](https://gomockingbird.com/projects/0govthz/sXMAyD).

VAN and BSD have their own APIs, and currently Ground Control makes use of the BSD API heavily for its syncing purposes.

    * [BSD API](https://www.bluestatedigital.com/page/api/doc)
    * [VAN API](http://developers.ngpvan.com/van-api)

## What stack is this project using?

We are using RethinkDB for our database.  Take a look at the [RethinkDB query language](https://www.rethinkdb.com/docs/guide/javascript/) -- it's a very powerful model for querying data by chaining together actions, and that is the main reason we are using it for this project.

On top of that, we are creating a [GraphQL](http://graphql.org/) API.  GraphQL is designed to make it easy to build APIs for objects that have many relationships.  On the frontend, we are using [React](https://facebook.github.io/react/) for the view layer, and React talks to GraphQL via [Relay](https://facebook.github.io/relay/).

If you are feeling stuck/aren't familiar with any of this and want some help, please don't bang your head against a wall!  Talk to me (saikat@berniesanders.com, @saikat in the BernieBuilders Slack).

## More info?

See the [docs](docs).

## License

This project is licensed under [AGPL](LICENSE).
