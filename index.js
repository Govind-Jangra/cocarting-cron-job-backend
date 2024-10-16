import express from 'express';
import { Builder, By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import cors from 'cors';

const app = express();
app.use(cors("*"));
const PORT = process.env.PORT || 5000;
connectDB();

app.use(express.json());

async function fetchReducedHTML(url, timeout = 90000) {
    const options = new chrome.Options();
    options.addArguments('--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu');

    options.setBinary(process.env.CHROME_BIN);

    const driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        await driver.get(url);

        await driver.sleep(5000); 
        const html = await driver.getPageSource();
        return html;
    } catch (err) {
        console.error('Error fetching HTML with Selenium:', err);
        return null;
    } finally {
        await driver.quit();
    }
}

app.post('/html', async (req, res) => {
    console.log(req.body);

    const url = req.body.url;

    if (!url) {
        return res.status(400).json({ error: 'Please provide a URL in the request body.' });
    }

    try {
        const cleanedHTML = await fetchReducedHTML(url);
        if (cleanedHTML) {
            return res.send(cleanedHTML);
        } else {
            return res.status(500).json({ error: 'Failed to fetch and clean the HTML.' });
        }
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/selector', productRoutes);

app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
