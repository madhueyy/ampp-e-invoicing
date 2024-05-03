import express from 'express';

import { uploadXML, listInvoices, viewInvoice } from '../controllers/xml';
import { isAuthenticated } from '../middlewares';
import { upload } from '../middlewares/fileUpload';

export default (router: express.Router) => {
    router.post('/upload-xml/:format', upload, isAuthenticated, uploadXML);
    router.get('/api/invoices', isAuthenticated, listInvoices);
    router.get('/api/view-invoice', isAuthenticated, viewInvoice);
    // router.post('/render-xml', isAuthenticated, upload, renderXML);
};