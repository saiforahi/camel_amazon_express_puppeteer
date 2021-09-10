const puppeteer = require("puppeteer");
const path = require('path');
var userAgent = require('user-agents');
const logger = require('./logger/logger');
const moment = require('moment');
var FormData = require('form-data');
const axios = require('axios');
const saveErrorImg = async (page) => {
    try {
        let date = new Date();
        date = moment(date, "YYYY-MM-DD,hh:mm A").format('YYYY-MM-DD,hh:mm A');
        let imageName = date + ".jpg";
        let imagePath = path.join(__dirname, ".", "/assets", `/${imageName}`);
        await page.screenshot({ path: imagePath });
    } catch (error) {
        console.log('error-----', error);
        logger.error({ message: error })
    }
}
const captchaSolver = async (page) => {
    try {
        await page.setUserAgent(userAgent.toString());
        await page.waitForTimeout(2000);
        if (await page.$('.a-box-inner .a-row.a-text-center')) {
            console.log('resolving captcha ----- ')
            console.log('captch calling.......');
            const captchaData = await page.evaluate(() => {
                const captchaImgEl = document.querySelectorAll('.a-box-inner .a-row.a-text-center');
                if (captchaImgEl && captchaImgEl.length > 0) {
                    let captchaImgUrl = captchaImgEl[0].children[0].src;
                    return new Promise(res => {
                        fetch(captchaImgUrl).then(res => res.blob()).then(blob => {
                            var reader = new FileReader();
                            reader.readAsDataURL(blob);
                            reader.onloadend = function () {
                                var base64data = reader.result;
                                res(base64data);
                            }
                        })
                    })
                }
            })
            console.log(captchaData.substring(1, 30), "....captchaData")
            var bodyFormData = new FormData();
            console.log('captcha API key ----- ','9cec06c00001a6be33fc8867f838e392')
            bodyFormData.append('key', '9cec06c00001a6be33fc8867f838e392');
            bodyFormData.append('method', 'base64');
            bodyFormData.append('body', captchaData);
            bodyFormData.append('json', 1);
            const { data: capRequestData } = await axios({
                method: "post",
                url: "http://2captcha.com/in.php",
                data: bodyFormData,
                headers: {
                    ...bodyFormData.getHeaders()
                }
            })
            await page.waitForTimeout(15000);
            console.log('capRequestData--------', capRequestData);
            //const orders=Service.sendPostRequest()
            let captchaResponse
            while (1) {
                await page.waitForTimeout(5000);
                captchaResponse = await axios({
                    url: "http://2captcha.com/res.php",
                    params: {
                        key:'9cec06c00001a6be33fc8867f838e392',
                        action: "get",
                        id: capRequestData.request,
                        json: 1
                    }
                })
                captchaResponse = captchaResponse.data
                console.log(captchaResponse, "captchaResponse")
                if (captchaResponse && captchaResponse.request === "CAPCHA_NOT_READY") {
                    continue;
                } else {
                    break;
                }
            }
            //await page.waitForTimeout(5000);
            await page.evaluate((captchaResponse) => {
                let inputSlector = document.querySelectorAll('#captchacharacters');
                inputSlector[0].value = captchaResponse.request;
                let button = document.querySelectorAll('.a-button-text');
                console.log(button.length);
                button[0].click()
            }, captchaResponse);
        } else {
            return;
        }
    } catch (error) {
        console.log('error.captch---', error);
    }
}
const test = async () => {
    
    const browser = await puppeteer.launch({
        headless: true,
        timeout: 0,
        ignoreHTTPSErrors: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-web-security',  
            `--proxy-server=108.62.204.12:47564`,
            //'--proxy-server='+result['proxy_ip'],
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-dev-shm-usage'
        ]
    });
    // let productViewPage = 'page_' + pageIndex;
    let pages = await browser.pages()
    let productViewPage = pages[0];
    await productViewPage.authenticate({ username:"freeyourlifee", password:"KGEXiXSi" });
    try {
        productViewPage.setDefaultNavigationTimeout(0);
        await productViewPage.setViewport({ width: 1366, height: 700 });
        //let platefromUrl = 'https://www.amazon.com/dp/' + asin;
        let platefromUrl = 'https://www.amazon.com/';
        console.log('url to visit ----- ',platefromUrl)
        await productViewPage.goto(platefromUrl, {
            waitUntil: 'load', timeout: 0
        });
        // if(Service.check_status()){
        //     await captchaSolver(productViewPage);
        // }
        await captchaSolver(productViewPage);
        await productViewPage.waitForTimeout(4000);
        let imagePath1 = path.join(__dirname, ".", "/assets", `/img01.png`);
        await productViewPage.screenshot({ path: imagePath1 });
        
        await productViewPage.waitForTimeout(3000);
        
        let pages = await browser.pages();
        await Promise.all(pages.map(page =>page.close()));
        await browser.close();
        return;
    } catch (error) {
        console.log('error 287------', error);
        console.log('url ---- ',productViewPage.url())
        logger.error({ message: error })
        await saveErrorImg(productViewPage);
    }finally{
        //await browser.close();
        console.log('finally browser close-------------');
    }
}

module.exports = test;