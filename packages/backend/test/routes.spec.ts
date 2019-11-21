import { App } from '../src/app';
import * as config from 'config';
import * as request from 'supertest';
import { expect } from 'chai';

describe('service root', () => {
    it('contains the correct links', async () => {
        const app = new App(config);
        const response = await request(app.ExpressApp).get('/api');
        expect(response.status).to.equal(200);
        expect(response.body).to.eql({
            links: {
                tasks: '/api/task',
                task: '/api/task/{id}'
            }
        });
    });
});
