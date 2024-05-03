import express from 'express';

import authentication from './authentication';
import xml from './xml';

const router = express.Router();

export default (): express.Router => {
    authentication(router);
    xml(router);

    return router;
}