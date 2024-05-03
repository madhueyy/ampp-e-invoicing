
// xml-to-html.test.ts
import fs from 'fs';
import path from 'path';

import { convertToJSON, convertJSONToHTML } from '../src/services/xmlConverter';

// These below tests validate that the xml file converts to HTML
describe('Invoice Processing - Render Invoice to HTML', () => {
    test("Converts XML to JSON successfully", async () => {
        const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                    <Invoice>
                        <Sender>
                            <Name>Company ABC</Name>
                            <Address>123 Main St, City, Country</Address>
                            <Email>info@companyabc.com</Email>
                        </Sender>
                        <Recipient>
                            <Name>Customer XYZ</Name>
                            <Address>456 Elm St, Town, Country</Address>
                            <Email>customer@xyz.com</Email>
                        </Recipient>
                        <Items>
                            <Item>
                                <Description>Product A</Description>
                                <Quantity>2</Quantity>
                                <Price>10</Price>
                            </Item>
                            <Item>
                                <Description>Product B</Description>
                                <Quantity>1</Quantity>
                                <Price>20</Price>
                            </Item>
                        </Items>
                        <Total>40</Total>
                    </Invoice>`;
        const result = await convertToJSON(xml);

        expect(result).toHaveProperty('Invoice');
        expect(result['Invoice']).toHaveProperty('Sender');
        expect(result['Invoice']).toHaveProperty('Recipient');
        expect(result['Invoice']).toHaveProperty('Items');
        expect(result['Invoice']).toHaveProperty('Total');
    });
    
    test("Return error when given invalid XML", async () => {
        const xml = `<InvalidXML><ID>EBWASP1002</ID></InvalidXML>`;
        try {
            await convertToJSON(xml);
        } catch (error) {
            expect(error.message).toContain('error');
        }
    });

    test.skip("Recipient email is included in HTML", () => {
        const jsonData = {
            Invoice: {
                Recipient: {
                    Email: 'recipient@example.com'
                }
            }
        };

        const html = convertJSONToHTML(jsonData, false);

        expect(html).toContain('<p><strong>Recipient Email:</strong> recipient@example.com</p>');
    });

    test.skip("Items are included in HTML", () => {
        const jsonData = {
            Invoice: {
                Items: [
                    { Description: 'Product A', Quantity: 2, Price: 10 },
                    { Description: 'Product B', Quantity: 1, Price: 20 }
                ]
            }
        };

        const html = convertJSONToHTML(jsonData, false);

        expect(html).toContain('<p><strong>Item Description:</strong> Product A</p>');
        expect(html).toContain('<p><strong>Item Quantity:</strong> 2</p>');
        expect(html).toContain('<p><strong>Item Price:</strong> 10</p>');
        expect(html).toContain('<p><strong>Item Description:</strong> Product B</p>');
        expect(html).toContain('<p><strong>Item Quantity:</strong> 1</p>');
        expect(html).toContain('<p><strong>Item Price:</strong> 20</p>');
    });

    test('Returns error message for invalid JSON data', async () => {
        const invalidJSON: any = null;
        const result = await convertJSONToHTML(invalidJSON, false);
        expect(result).toBe('<div>Error: Invalid JSON data</div>');
    });

    test.skip('Includes sender details in HTML if present', () => {
        const jsonData = {
            Invoice: {
                Sender: {
                    Name: 'Sender Name',
                    Address: 'Sender Address',
                    Email: 'sender@example.com'
                }
            }
        };

        const result = convertJSONToHTML(jsonData, false);
        expect(result).toContain('<p><strong>Sender Name:</strong> Sender Name</p>');
        expect(result).toContain('<p><strong>Sender Address:</strong> Sender Address</p>');
        expect(result).toContain('<p><strong>Sender Email:</strong> sender@example.com</p>');
    });

    test.skip('Includes "N/A" for sender details if not present', () => {
        const jsonData = {
            Invoice: {}
        };

        const result = convertJSONToHTML(jsonData, false);
        expect(result).toContain('<p><strong>Sender Name:</strong> N/A</p>');
        expect(result).toContain('<p><strong>Sender Address:</strong> N/A</p>');
        expect(result).toContain('<p><strong>Sender Email:</strong> N/A</p>');
    });
});
