const crypto = require('crypto');

async function testDigiflazz() {
    const username = 'tuwumiWXAdqg';
    const apikey = 'dev-b8bd5f40-d97c-11ef-8d09-333896381645';
    const customer_no = '087800001232';
    const buyer_sku_code = 'xld10';
    const ref_id = 'test-trx-' + Date.now();

    // MD5(username + apikey + ref_id)
    const signString = username + apikey + ref_id;
    const sign = crypto.createHash('md5').update(signString).digest('hex');

    const payload = {
        username: username,
        buyer_sku_code: buyer_sku_code,
        customer_no: customer_no,
        ref_id: ref_id,
        sign: sign,
        testing: true // explicitly telling Digiflazz this is a test
    };

    console.log("Sending Payload:", payload);

    try {
        const response = await fetch('https://api.digiflazz.com/v1/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Body:\n", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Request Failed:", e);
    }
}

testDigiflazz();
