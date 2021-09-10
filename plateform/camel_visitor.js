// require('dotenv').config({ path: `../.env` });
require('events').EventEmitter.defaultMaxListeners = 15;
const puppeteer = require("puppeteer");
const Service = require('../server/service/service');
const axios = require('axios');
const path = require('path');
const logger = require('../logger/logger');
const { doc } = require('prettier');

const login = async(page)=>{
    await page.evaluate(()=>{
        return new Promise((res,rej)=>{
            document.getElementById('login').setAttribute('value','softappetite@gmail.com')
            document.getElementById('password').setAttribute('value','Spring@123')
            document.querySelector('input[type="submit"]').click()
            res()
        })
    })
    await page.waitForTimeout(4000)
}
const search_product = async(page,url)=>{
    await page.evaluate((url)=>{
        return new Promise((res,rej)=>{
            document.querySelector('input[placeholder="Find Amazon Products"]').setAttribute('value',url)
            document.getElementById('sqbtn').click()
        })
    },url)
    await page.waitForTimeout(4000)
    await page.evaluate(()=>{
        return new Promise((res,rej)=>{
            document.getElementById('create_watch_field').setAttribute('value','price_amazon')
            document.getElementById('dp_create').setAttribute('value','5000')
            document.querySelector('input[value="track"]').click()
        })
    })
    await page.waitForTimeout(4000)
}
const trackProduct = async (data) => {
    const browser = await puppeteer.launch({
        headless: true,
        timeout: 0,
        ignoreHTTPSErrors: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-web-security',  
            //`--proxy-server=${result['proxy_ip']}`,
            //'--proxy-server='+result['proxy_ip'],
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-dev-shm-usage'
        ]
    });
    
    let pages = await browser.pages()
    let camel_page = pages[0];
    try {
        camel_page.setDefaultNavigationTimeout(0);
        await camel_page.setViewport({ width: 1366, height: 700 });
        let platefromUrl = 'https://camelcamelcamel.com/'
        let loginUrl = "https://camelcamelcamel.com/login"
        await camel_page.goto(loginUrl.trim(), {
            waitUntil: 'load', timeout: 0
        });
        // if(Service.check_status()){
        //     login(camel_page)
        //     await camel_page.waitForNavigation()
        //     Promise.resolve().then(async()=>{await search_product(camel_page,data[0].url)}).then(()=>{
        //         // let pages = await browser.pages();
        //         // await Promise.all(pages.map(page =>page.close()));
        //         // await browser.close();
        //         return;
        //     })
        // }
        await camel_page.evaluate(()=>{
            return new Promise((res,rej)=>{
                document.getElementById('login').setAttribute('value','softappetite@gmail.com')
                document.getElementById('password').setAttribute('value','Spring@123')
                //document.querySelector('input[type="submit"]').click()
                res()
            })
        })
        await camel_page.click('input[value="Log in"]')
        await camel_page.waitForTimeout(8000)
        await camel_page.evaluate((url)=>{
            return new Promise((res,rej)=>{
                document.querySelector('input[placeholder="Find Amazon Products"]').setAttribute('value',url)
                document.getElementById('sqbtn').click()
                res()
            })
        },data.url)
        await camel_page.waitForTimeout(4000)
        await camel_page.evaluate(()=>{
            return new Promise((res,rej)=>{
                document.getElementById('create_watch_field').setAttribute('value','price_amazon')
                document.querySelector('option[value="price_amazon"]').setAttribute('selected','selected')
                document.getElementById('dp_create').setAttribute('value','5000')
                document.querySelector('input[value="Track!"]').click()
                res()
            })
        })
        await camel_page.waitForTimeout(10000)
        let pages = await browser.pages();
        await Promise.all(pages.map(page =>page.close()));
        await browser.close();
        return;
    } catch (error) {
        console.log('error 287------', error);
        console.log('url ---- ',camel_page.url())
    }finally{
        //await browser.close();
        console.log('finally browser close-------------');
    }
}


const camel = async () => {
    logger.info({message:'process start------'})
    console.log('calling API ----- ')
    //const api_data = await Service.sendPostRequest();
    axios.post('https://app.wealthorre.com/api/v1/getAmazonUrl', {"token":"eyJhbd25sdfdrgiJkhsR5cCI6IkpXVCJ9eyJzz0ZY6LskdkfjksDkjdf"}).then(async(resp)=>{
        console.log('response ----- ',resp.data.data.data);
        const api_data=resp.data.data.data
        console.log('totaldata.........', api_data.length);
        console.log('.........');
        if(api_data.length > 0){
            for(let index = 0; index < api_data.length ; index++){
                console.log("product --- ",api_data[index].asin)
            }
            console.log('.........');
            try {
                console.log('tracking product ASIN ------ '+api_data[0].asin);
                await trackProduct(api_data[0])
                
            } catch (error) {
                console.log('364..error..........', error);
            }
        }
    });
}
// amazon();
module.exports = camel;
