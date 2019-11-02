import * as express from 'express';
import { IConfig } from 'config';
import { Routes } from './routes';
import bodyParser = require('body-parser');

export class App {
    private _app: express.Application;
    private _config: IConfig;
    private _routes: Routes;

    public constructor(config: IConfig) {
        this._app = express();
        // support application/json type post data
        this._app.use(bodyParser.json());
        this._config = config;
        this._routes = new Routes(this._config, this._app);
    }

    public run(): void {
        let port = 3000;
        if (this._config.has('port')) {
            port = this._config.get<number>('port');
        }
        const PORT = process.env.PORT || port;

        this._app.listen(PORT, () => {
            console.log('listening on port ' + PORT);
        });
    }
}
