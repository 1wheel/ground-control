import express from 'express';
import graphQLHTTP from 'express-graphql';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import {Schema} from './data/schema';

const APP_PORT = process.env.PORT;
const GRAPHQL_PORT = 8000;

// Expose a GraphQL endpoint
var graphQLServer = express();
graphQLServer.use('/', graphQLHTTP({schema: Schema, pretty: true}));
graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
));

// Serve the Relay app
var compiler = webpack({
  entry: path.resolve(__dirname, '../frontend', 'app.js'),
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: 'babel',
        query: {stage: 0, plugins: ['./babelRelayPlugin']},
        test: /\.js$/,
      }
    ]
  },
  output: {filename: 'app.js', path: '/'}
});

var app = new WebpackDevServer(compiler, {
  contentBase: '/static/',
  proxy: {'/graphql': `http://localhost:${GRAPHQL_PORT}`},
  publicPath: '/static/',
  stats: {colors: true}
});

// Serve static resources
app.use('/', express.static(path.resolve(__dirname, '../frontend/static')));
app.listen(APP_PORT, () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`);
});
