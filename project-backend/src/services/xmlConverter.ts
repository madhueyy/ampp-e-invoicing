import express from 'express';
import xml2js from 'xml2js';
import { createReadStream, createWriteStream } from 'fs';
import fs from 'fs';
import { ReadableStream } from 'node:stream/web';
import translateFunction from './multiLanguage';
import { HTML2PDFOptions, html2pdf } from 'html2pdf-ts';

// import puppeteer from 'puppeteer';
// const puppeteer = require('puppeteer')

// Removes everything before the last colon (including the colon)
const removePrefix = (name: string) => {
    return name.replace(/^c.c:/, '');
};

/**
 * Converts XML data to JSON format using the xml2js npm package
 * @param {string} xmlData - the XML data to be converted to JSON
 * @returns {Promise<object>} a Promise resolving to JSON object representing the converted data
 */
export const convertToJSON = async (xmlData: string) => {
    const parser = new xml2js.Parser({
        explicitArray: false,
        tagNameProcessors: [removePrefix],
        attrNameProcessors: [removePrefix],
        charkey: '_text',
        mergeAttrs: true,
        ignoreAttrs: true
    });
    const jsonData = await parser.parseStringPromise(xmlData);
    // console.log(jsonData);
    return jsonData;
};

/**
 * Helper function to recursively convert JSON to HTML
* @param {any} json
* @param {boolean} translate - flag to convert to chinese if requested
* @return {Promise<string>}
**/
// * @return {html}
export const convertJSONToHTML = async (json: any, translate:boolean): Promise<string> => {

    // Check if JSON object is defined
    if (!json || typeof json !== 'object') {
        return `<div>Error: Invalid JSON data</div>`;
    }

    // creating a new array to pass all the texts that need to be translated
    let toTranslate: string[] = [];
    if (translate) {
        toTranslate = [
            'Invoice', 'Invoice Information', 'UBL Version ID', 'Customization ID', 'Profile ID', 'Invoice ID', 'Issue Date', 'Invoice Type Code', 'Document Currency Code', 'Buyer Reference', 'Accounting Supplier Party', 'Supplier Name',
            'Supplier Street', 'Supplier City', 'Supplier Postal Zone', 'Supplier Country', 'Accounting Customer Party', 'Customer Name', 'Customer Street', 'Customer Additional Street', 'Customer City', 'Customer Postal Zone',
            'Customer Country', 'Payment Information', 'Payment Means Code', 'Payment ID', 'Payment Terms', 'Payment Terms Note', 'Tax Information', 'Tax Amount', 'Taxable Amount', 'Tax Percentage', 'Tax Scheme ID', 'Monetary Total',
            'Line Extension Amount','Tax Exclusive Amount', 'Tax Inclusive Amount', 'Payable Rounding Amount', 'Payable Amount', 'Invoice Line', 'Invoice Quantity', 'Item Name', 'Item Tax Percentage', 'Item Tax Scheme ID', 'Price Amount',
            'Base Quantity', 'Error: Invoice data is missing', 'Error: Party details missing', 'Error: Accounting Customer Party details missing'
        ];
    }
    const translations = translate ? await translateFunction(toTranslate, 'en') : [];

    let translationMap: { [key: string]: string } = {};
    if (translate) {
        toTranslate.forEach((text, index) => {
            translationMap[text] = translations[index];
        });
    }

    let html = `
    <style>
        .center-aligned td {
            text-align: center;
        }
    </style>
    <div class="invoice">`;

    const sections = [
        'Invoice Information',
        'Accounting Supplier Party',
        'Accounting Customer Party',
        'Payment Information',
        'Payment Terms',
        'Tax Information',
        'Monetary Total',
        'Invoice Line'
    ];

    sections.forEach(section => {
        html += `<div class="section">`;
        html += `<h2>${translationMap[section] || section}</h2>`;
        html += `<table class="centre-aligned">`;
        switch (section) {
            case 'Invoice Information':
                html += `<tr><td><strong>${translationMap['UBL Version ID'] || 'UBL Version ID'}:</strong></td><td>${json["Invoice"]["cbc:UBLVersionID"] ? json["Invoice"]["cbc:UBLVersionID"][0] : 'N/A'}</td></tr>`;
                html += `<tr><td><strong>${translationMap['Customization ID'] || 'Customization ID'}:</strong></td><td>${json["Invoice"]["cbc:CustomizationID"] ? json["Invoice"]["cbc:CustomizationID"][0] : 'N/A'}</td></tr>`;
                html += `<tr><td><strong>${translationMap['Profile ID'] || 'Profile ID'}:</strong></td><td>${json["Invoice"]["cbc:ProfileID"] ? json["Invoice"]["cbc:ProfileID"][0] : 'N/A'}</td></tr>`;
                html += `<tr><td><strong>${translationMap['Invoice ID'] || 'Invoice ID'}:</strong></td><td>${json["Invoice"]["cbc:ID"] ? json["Invoice"]["cbc:ID"][0] : 'N/A'}</td></tr>`;
                html += `<tr><td><strong>${translationMap['Issue Date'] || 'Issue Date'}:</strong></td><td>${json["Invoice"]["cbc:IssueDate"] ? json["Invoice"]["cbc:IssueDate"][0] : 'N/A'}</td></tr>`;
                html += `<tr><td><strong>${translationMap['Invoice Type Code'] || 'Invoice Type Code'}:</strong></td><td>${json["Invoice"]["cbc:InvoiceTypeCode"] ? json["Invoice"]["cbc:InvoiceTypeCode"][0].value : 'N/A'}</td></tr>`;
                html += `<tr><td><strong>${translationMap['Document Currency Code'] || 'Document Currency Code'}:</strong></td><td>${json["Invoice"]["cbc:DocumentCurrencyCode"] ? json["Invoice"]["cbc:DocumentCurrencyCode"][0].value : 'N/A'}</td></tr>`;
                html += `<tr><td><strong>${translationMap['Buyer Reference'] || 'Buyer Reference'}:</strong></td><td>${json["Invoice"]["cbc:BuyerReference"] ? json["Invoice"]["cbc:BuyerReference"][0] : 'N/A'}</td></tr>`;
                break;
            case 'Accounting Supplier Party':
                const AccountingSupplierParty = json["Invoice"]["cac:AccountingSupplierParty"];
                if (AccountingSupplierParty && AccountingSupplierParty["cac:Party"]) {
                    const Party = AccountingSupplierParty["cac:Party"];
                    const PartyName = Party["cac:PartyName"];
                    const Name = PartyName ? PartyName["cbc:Name"][0] : 'N/A';
            
                    html += `<tr><td><strong>${translationMap['Supplier Name'] || 'Supplier Name'}:</strong></td><td>${Name}</td></tr>`;
                    html += `<tr><td><strong>${translationMap['Supplier Street'] || 'Supplier Street'}:</strong></td><td>${Party["cac:PostalAddress"]["cbc:StreetName"][0]}</td></tr>`;
                    html += `<tr><td><strong>${translationMap['Supplier City'] || 'Supplier City'}:</strong></td><td>${Party["cac:PostalAddress"]["cbc:CityName"][0]}</td></tr>`;
                    html += `<tr><td><strong>${translationMap['Supplier Postal Zone'] || 'Supplier Postal Zone'}:</strong></td><td>${Party["cac:PostalAddress"]["cbc:PostalZone"][0]}</td></tr>`;
                    html += `<tr><td><strong>${translationMap['Supplier Country'] || 'Supplier Country'}:</strong></td><td>${Party["cac:PostalAddress"]["cbc:Country"]["cbc:IdentificationCode"][0]}</td></tr>`;
                } else {
                    html += `<tr><td colspan="2">${translationMap['Error: Party details missing'] || 'Error: Party details missing'}</td></tr>`;
                }
                break;
            case 'Accounting Customer Party':
                const AccountingCustomerParty = json["Invoice"]["cac:AccountingCustomerParty"];
                if (AccountingCustomerParty && AccountingCustomerParty["cac:Party"]) {
                    const Party = AccountingCustomerParty["cac:Party"];
                    const PartyName = Party["cac:PartyName"];
                    const Name = PartyName ? PartyName["cbc:Name"][0] : 'N/A';
                    
                    html += `<tr><td><strong>${translationMap['Customer Name'] || 'Customer Name'}:</strong></td><td>${Name}</td></tr>`;
                    html += `<tr><td><strong>${translationMap['Customer Street'] || 'Customer Street'}:</strong></td><td>${Party["cac:PostalAddress"]["cbc:StreetName"][0]}</td></tr>`;
                    html += `<tr><td><strong>${translationMap['Customer Additional Street'] || 'Customer Additional Street'}:</strong></td><td>${Party["cac:PostalAddress"]["cbc:AdditionalStreetName"][0] || 'N/A'}</td></tr>`;
                    html += `<tr><td><strong>${translationMap['Customer City'] || 'Customer City'}:</strong></td><td>${Party["cac:PostalAddress"]["cbc:CityName"][0]}</td></tr>`;
                    html += `<tr><td><strong>${translationMap['Customer Postal Zone'] || 'Customer Postal Zone'}:</strong></td><td>${Party["cac:PostalAddress"]["cbc:PostalZone"][0]}</td></tr>`;
                    
                    const CountryCode = Party["cac:PostalAddress"]["cbc:Country"]["cbc:IdentificationCode"][0] || 'N/A';
                    html += `<tr><td><strong>${translationMap['Customer Country'] || 'Customer Country'}:</strong></td><td>${CountryCode}</td></tr>`;
                } else {
                    html += `<tr><td colspan="2">${translationMap['Error: Accounting Customer Party details missing'] || 'Error: Accounting Customer Party details missing'}</td></tr>`;
                }
                break;
            case 'Payment Information':
                const PaymentMeans = json["Invoice"] && json["Invoice"]["cac:PaymentMeans"] ? json["Invoice"]["cac:PaymentMeans"][0] : null;
                if (PaymentMeans) {
                    html += `<tr><td><strong>${translationMap['Payment Means Code'] || 'Payment Means Code'}:</strong></td><td>${PaymentMeans["cbc:PaymentMeansCode"][0].value}</td></tr>`;
                    html += `<tr><td><strong>${translationMap['Payment ID'] || 'Payment ID'}:</strong></td><td>${PaymentMeans["cbc:PaymentID"][0]}</td></tr>`;
                } else {
                    html += `<tr><td colspan="2">${translationMap['Error: Payment Information missing'] || 'Error: Payment Information missing'}</td></tr>`;
                }
                break;
            case 'Payment Terms':
                const PaymentTerms = json["Invoice"]["cac:PaymentTerms"];
                if (PaymentTerms && Array.isArray(PaymentTerms) && PaymentTerms.length > 0) {
                    const PaymentTermsNote = PaymentTerms[0]["cbc:Note"];
                    const noteValue = PaymentTermsNote ? PaymentTermsNote[0] : 'N/A';
                    
                    html += `<tr><td><strong>${translationMap['Payment Terms Note'] || 'Payment Terms Note'}:</strong></td><td>${noteValue}</td></tr>`;
                } else {
                    html += `<tr><td colspan="2">${translationMap['Error: Payment Terms missing'] || 'Error: Payment Terms missing'}</td></tr>`;
                }
                break;
            case 'Tax Information':
                const TaxTotal = json["Invoice"] && Array.isArray(json["Invoice"]["cac:TaxTotal"]) && json["Invoice"]["cac:TaxTotal"].length > 0 ? json["Invoice"]["cac:TaxTotal"][0] : null;
                if (TaxTotal) {
                    const TaxAmount = TaxTotal["cbc:TaxAmount"] ? TaxTotal["cbc:TaxAmount"][0].value : 'N/A';
                    const TaxSubtotal = TaxTotal["cac:TaxSubtotal"] ? TaxTotal["cac:TaxSubtotal"][0] : null;
                    const TaxableAmount = TaxSubtotal && TaxSubtotal["cbc:TaxableAmount"] ? TaxSubtotal["cbc:TaxableAmount"][0].value : 'N/A';
                    const TaxCategory = TaxSubtotal && TaxSubtotal["cac:TaxCategory"] ? TaxSubtotal["cac:TaxCategory"][0] : null;
                    const TaxPercentage = TaxCategory && TaxCategory["cbc:Percent"] ? TaxCategory["cbc:Percent"][0] : 'N/A';
                    const TaxScheme = TaxCategory && TaxCategory["cac:TaxScheme"] ? TaxCategory["cac:TaxScheme"][0] : null;
                    const TaxSchemeID = TaxScheme && TaxScheme["cbc:ID"] ? TaxScheme["cbc:ID"][0].value : 'N/A';

                    html += `
                        <tr>
                            <td><strong>${translationMap['Tax Amount'] || 'Tax Amount'}:</strong></td>
                            <td>${TaxAmount}</td>
                        </tr>
                        <tr>
                            <td><strong>${translationMap['Taxable Amount'] || 'Taxable Amount'}:</strong></td>
                            <td>${TaxableAmount}</td>
                        </tr>
                        <tr>
                            <td><strong>${translationMap['Tax Percentage'] || 'Tax Percentage'}:</strong></td>
                            <td>${TaxPercentage}</td>
                        </tr>
                        <tr>
                            <td><strong>${translationMap['Tax Scheme ID'] || 'Tax Scheme ID'}:</strong></td>
                            <td>${TaxSchemeID}</td>
                        </tr>
                    `;
                } else {
                    html += `<tr><td colspan="2">${translationMap['Error: Tax Information missing'] || 'Error: Tax Information missing'}</td></tr>`;
                }
                break;
            case 'Monetary Total':
                const LegalMonetaryTotal = json["Invoice"]["cac:LegalMonetaryTotal"];
                if (LegalMonetaryTotal && typeof LegalMonetaryTotal === 'object') {
                    const LineExtensionAmount = LegalMonetaryTotal["cbc:LineExtensionAmount"] ? LegalMonetaryTotal["cbc:LineExtensionAmount"][0].value : 'N/A';
                    const TaxExclusiveAmount = LegalMonetaryTotal["cbc:TaxExclusiveAmount"] ? LegalMonetaryTotal["cbc:TaxExclusiveAmount"][0].value : 'N/A';
                    const TaxInclusiveAmount = LegalMonetaryTotal["cbc:TaxInclusiveAmount"] ? LegalMonetaryTotal["cbc:TaxInclusiveAmount"][0].value : 'N/A';
                    const PayableRoundingAmount = LegalMonetaryTotal["cbc:PayableRoundingAmount"] ? LegalMonetaryTotal["cbc:PayableRoundingAmount"][0].value : 'N/A';
                    const PayableAmount = LegalMonetaryTotal["cbc:PayableAmount"] ? LegalMonetaryTotal["cbc:PayableAmount"][0].value : 'N/A';
            
                    html += `
                        <tr>
                            <td><strong>${translationMap['Line Extension Amount'] || 'Line Extension Amount'}:</strong></td>
                            <td>${LineExtensionAmount}</td>
                        </tr>
                        <tr>
                            <td><strong>${translationMap['Tax Exclusive Amount'] || 'Tax Exclusive Amount'}:</strong></td>
                            <td>${TaxExclusiveAmount}</td>
                        </tr>
                        <tr>
                            <td><strong>${translationMap['Tax Inclusive Amount'] || 'Tax Inclusive Amount'}:</strong></td>
                            <td>${TaxInclusiveAmount}</td>
                        </tr>
                        <tr>
                            <td><strong>${translationMap['Payable Rounding Amount'] || 'Payable Rounding Amount'}:</strong></td>
                            <td>${PayableRoundingAmount}</td>
                        </tr>
                        <tr>
                            <td><strong>${translationMap['Payable Amount'] || 'Payable Amount'}:</strong></td>
                            <td>${PayableAmount}</td>
                        </tr>
                    `;
                } else {
                    html += `<tr><td colspan="2">${translationMap['Error: Monetary Total missing'] || 'Error: Monetary Total missing'}</td></tr>`;
                }
                break;
            case 'Invoice Line':
                const InvoiceLine = json["Invoice"]["cac:InvoiceLine"];
                if (InvoiceLine && Array.isArray(InvoiceLine) && InvoiceLine.length > 0) {
                    html += `
                        <table>
                            <thead>
                                <tr>
                                    <th>${translationMap['Invoice Line ID'] || 'Invoice Line ID'}</th>
                                    <th>${translationMap['Invoice Quantity'] || 'Invoice Quantity'}</th>
                                    <th>${translationMap['Line Extension Amount'] || 'Line Extension Amount'}</th>
                                    <th>${translationMap['Item Name'] || 'Item Name'}</th>
                                    <th>${translationMap['Item Tax Percentage'] || 'Item Tax Percentage'}</th>
                                    <th>${translationMap['Item Tax Scheme ID'] || 'Item Tax Scheme ID'}</th>
                                    <th>${translationMap['Price Amount'] || 'Price Amount'}</th>
                                    <th>${translationMap['Base Quantity'] || 'Base Quantity'}</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
            
                    InvoiceLine.forEach((line) => {
                        const LineID = line["cbc:ID"] ? line["cbc:ID"][0] : 'N/A';
                        const InvoicedQuantity = line["cbc:InvoicedQuantity"] ? line["cbc:InvoicedQuantity"][0].value : 'N/A';
                        const LineExtensionAmount = line["cbc:LineExtensionAmount"] ? line["cbc:LineExtensionAmount"][0].value : 'N/A';
                        
                        const Item = line["cac:Item"] ? line["cac:Item"][0] : null;
                        const ItemName = Item && Item["cbc:Name"] ? Item["cbc:Name"][0] : 'N/A';
                        
                        const ClassifiedTaxCategory = Item && Item["cac:ClassifiedTaxCategory"] ? Item["cac:ClassifiedTaxCategory"][0] : null;
                        const TaxPercentage = ClassifiedTaxCategory && ClassifiedTaxCategory["cbc:Percent"] ? ClassifiedTaxCategory["cbc:Percent"][0] : 'N/A';
                        
                        const TaxScheme = ClassifiedTaxCategory && ClassifiedTaxCategory["cac:TaxScheme"] ? ClassifiedTaxCategory["cac:TaxScheme"][0] : null;
                        const TaxSchemeID = TaxScheme && TaxScheme["cbc:ID"] ? TaxScheme["cbc:ID"][0].value : 'N/A';
                        
                        const Price = line["cac:Price"] ? line["cac:Price"][0] : null;
                        const PriceAmount = Price && Price["cbc:PriceAmount"] ? Price["cbc:PriceAmount"][0].value : 'N/A';
                        const BaseQuantity = Price && Price["cbc:BaseQuantity"] ? Price["cbc:BaseQuantity"][0].value : 'N/A';
            
                        html += `
                            <tr>
                                <td>${LineID}</td>
                                <td>${InvoicedQuantity}</td>
                                <td>${LineExtensionAmount}</td>
                                <td>${ItemName}</td>
                                <td>${TaxPercentage}</td>
                                <td>${TaxSchemeID}</td>
                                <td>${PriceAmount}</td>
                                <td>${BaseQuantity}</td>
                            </tr>
                        `;
                    });
            
                    html += `
                            </tbody>
                        </table>
                    `;
                } else {
                    html += `<p>${translationMap['Error: Invoice Line data is missing'] || 'Error: Invoice Line data is missing'}</p>`;
                }
                break;
        }
        html += `</table>`;
        html += `</div>`;
    });

    html += `</div>`; // Close invoice div

    return html;

};

/**
 * Converts XML data to HTML format
* @param {string} xmlData - the XML data to be converted to HTML
* @return {html} - the converted HTML document
**/
export const convertToHTML = async (xmlData: string, translate: boolean): Promise<string> => {
    const parser = new xml2js.Parser();
    const jsonData = await parser.parseStringPromise(xmlData);

    // Convert jsonData to HTML format
    const html = convertJSONToHTML(jsonData, translate);
    return html;
}
   
export const convertToPDF = async (htmlDataForPdf: string) => {
    const options: HTML2PDFOptions = {
        format: 'A4',
        landscape: false,
        resolution: {
            height: 1920,
            width: 1080
        }
    };
    const pdfBuffer = await html2pdf.createPDF(htmlDataForPdf, options);
    return pdfBuffer;
}
