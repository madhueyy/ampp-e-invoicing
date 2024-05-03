import fs from 'fs';
import path from 'path';

import { convertToJSON } from '../src/services/xmlConverter';

describe('Invoice Processing - Render Invoice to JSON', () => {
    test("Converts XML to JSON successfully", async () => {
        const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                    <Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:cec="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
                        <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
                        <cbc:ID>EBWASP1002</cbc:ID>
                        <cbc:IssueDate>2022-02-07</cbc:IssueDate>
                    </Invoice>`;
        
        const result = await convertToJSON(xml);

        expect(result).toMatchObject({
            "Invoice": {
                "UBLVersionID": "2.1",
                "ID": "EBWASP1002",
                "IssueDate": "2022-02-07"
            }
        });
    });
    
    test("Return nothing when given invalid XML", async () => {
        const xml = `<cbc:ID>EBWASP1002</cbc:ID>
                <cbc:IssueDate>2022-02-07</cbc:IssueDate>
                </Invoice>`;
        
        const result = await convertToJSON(xml);
    
        expect(result).toMatchObject({});
    });

    test("Given the example XML, it should produce the matching JSON object", async () => {
        const xmlFilePath = path.join(__dirname, 'resources/example1.xml');
        const xmlFile = fs.readFileSync(xmlFilePath, 'utf-8');
        const convertedJSON = await convertToJSON(xmlFile);

        expect(convertedJSON).toMatchObject({
            "Invoice": {
                "UBLVersionID": "2.1",
                "CustomizationID": "urn:cen.eu:en16931:2017#conformant#urn:fdc:peppol.eu:2017:poacc:billing:international:aunz:3.0",
                "ProfileID": "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
                "ID": "EBWASP1002",
                "IssueDate": "2022-02-07",
                "InvoiceTypeCode": "380",
                "DocumentCurrencyCode": "AUD",
                "BuyerReference": "EBWASP1002",
                "AdditionalDocumentReference": { "ID": "ebwasp1002" },
                "AccountingSupplierParty": { "Party": {} },
                "AccountingCustomerParty": { "Party": {} },
                "PaymentMeans": { "PaymentMeansCode": "1", "PaymentID": "EBWASP1002" },
                "PaymentTerms": { "Note": "As agreed" },
                "TaxTotal": { "TaxAmount": "10.00", "TaxSubtotal": {} },
                "LegalMonetaryTotal": {
                "LineExtensionAmount": "100.00",
                "TaxExclusiveAmount": "100.00",
                "TaxInclusiveAmount": "110.00",
                "PayableRoundingAmount": "0.00",
                "PayableAmount": "110.00"
                },
                "InvoiceLine": {
                "ID": "1",
                "InvoicedQuantity": "500.0",
                "LineExtensionAmount": "100.00",
                "Item": {},
                "Price": {}
                }
            }
        });
    });
});