import express from 'express';
import puppeteer from 'puppeteer';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import cors from "cors"

const app = express();
app.use(cors("*"));
const PORT = 5000;
connectDB();

app.use(express.json());
async function fetchReducedHTML(url, timeout = 30000) {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: `/usr/bin/google-chrome`,
        args: [`--no-sandbox`, `--headless`, `--disable-gpu`, `--disable-dev-shm-usage`],
      });

    const page = await browser.newPage();

    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    ];
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout });

        const html = await page.content();
        return html;

    } catch (err) {
        console.error('Error fetching HTML with Puppeteer:', err);
        return null;
    } finally {
        await browser.close();
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

app.use('/selector',productRoutes)

app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});