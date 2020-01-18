import { App } from './app';
import * as config from 'config';
import { CouchDB } from './couchdb';

const couch = new CouchDB('http://admin:admin@localhost:5984', 'brain');
couch.checkAndUpdate();
const app = new App(config, couch);
app.run();
