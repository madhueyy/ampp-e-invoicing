
// xml-to-html.test.ts
import fs from 'fs';
import path from 'path';

import { convertToJSON, convertJSONToHTML } from '../src/services/xmlConverter';

// testing translation rendering function
describe('Invoice Translation - Translating into Chinese', () => {
    test("Converts XML to HTML and translates successfully", async () => {
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
        const jsonData = await convertToJSON(xml);
        const html = await convertJSONToHTML(jsonData, true);

        // ensuring the translated section is translated
        expect(html).toContain('发票'); // 'invoice'
        expect(html).toContain('发票信息'); // 'invoice information'
        expect(html).toContain('UBL 版本号'); // 'ubl version id'
        expect(html).toContain('定制 ID'); // 'customisation id'
        expect(html).toContain('配置文件 ID'); // 'profile id'
        expect(html).toContain('发票编号'); // 'invoice id'
        expect(html).toContain('签发日期'); // 'issue date'
        expect(html).toContain('发票类型代码'); // 'invoice type code'
        expect(html).toContain('文件货币代码'); // 'document currency code'
        expect(html).toContain('买家参考'); // 'buyer reference'
        expect(html).toContain('会计供应商方'); // 'accounting supplier party'
        expect(html).toContain('会计客户方'); // 'accoutning customer party'
        expect(html).toContain('错误：缺少会计客户方详细信息'); // error message
        expect(html).toContain('支付信息'); // 'payment information'
        expect(html).toContain('付款条件'); // 'payment terms'
        expect(html).toContain('税务信息'); // 'tax information'
        expect(html).toContain('货币总额'); // 'monetary total'
        expect(html).toContain('发票明细'); // 'invoice line'
    });
});
