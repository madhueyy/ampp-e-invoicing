// This file contains the logic for handling the XML file
// upload and rendering it into different formats based on the
// user's choice

import express from 'express';

import { getUserUsingSessionToken, getFilesUsingInvoiceId } from '../db/users';
import { convertToJSON, convertToHTML, convertToPDF } from '../services/xmlConverter';

declare module 'express' {
    interface Request {
        user?: any; // Define the user property type here
    }
}

/**
 * Handles the upload of an XML file and converts it to the specified format (JSON, HTML or PDF)
 * @param {express.Request} req - request object containing the uploaded XML file in req.file and format in req.params.format
 * @param {express.Response} res - response object to send HTTP responses
 * @returns {Promise<express.Response>} a Promise resolving to an HTTP response
 */
export const uploadXML = async (req: express.Request, res: express.Response) => {
    try {
        const uploadedFile = req.file;
        // Check if XML file is uploaded
        if (!uploadedFile) {
            return res.status(400).json({ error: 'No XML file uploaded' });
        }

        // Check if uploaded file has content in it
        if (uploadedFile.size === 0) {
            return res.status(422).json({ error: 'File does not contain any content' });
        }

        // Get user information using session token
        const user = req.user;
        //console.log(sessionToken.toString())

        if (!user) {
            return res.sendStatus(401); // Unauthorized
        }

        // Get desired format from req params and convert XML to specified format
        const format = req.params.format;
        const translate = req.query.translate === 'true';
        switch (format) {
            case 'json':
                const jsonData = await convertToJSON(uploadedFile.buffer.toString());
                user.files.push({ format: 'json', data: jsonData });
                await user.save();
                return res.json(jsonData);
            case 'html':
                const fileContent = uploadedFile.buffer.toString();
                const htmlData = await convertToHTML(fileContent, translate);
                user.files.push({ format: 'html', data: htmlData });
                await user.save();
                return res.send(htmlData);
            case 'pdf':
                const htmlDataForPdf = await convertToHTML(uploadedFile.buffer.toString(), translate);
                const pdfBuffer = await convertToPDF(htmlDataForPdf);
                res.type('application/pdf');
                user.files.push({ format: 'pdf', data: pdfBuffer });
                await user.save();
                return res.send(pdfBuffer);
            default:
                return res.status(400).json({ error: 'Invalid format specified' });
        }

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

export const listInvoices = async (req: express.Request, res: express.Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // If user found, retrieve the list of files associated with the user
        const invoices = user.files;

        // Return the list of invoices
        return res.json(invoices);

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
};

export const viewInvoice = async (req: express.Request, res: express.Response) => {
    try {
        // Retrieve invoice ID from query parameters
        const invoiceId = req.query.id;
        console.log(invoiceId)

        if (!invoiceId) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Find the user and check if the invoice exists in their files
        const user = await getFilesUsingInvoiceId(invoiceId.toString())
        if (!user) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Find the invoice in the user's files
        let invoice;
        user.files.forEach(file => {
            const fileId = file._id;
            if (fileId?.toString() === invoiceId) {
                invoice = file;
            }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        return res.send(invoice);

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
};
