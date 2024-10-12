import Product from '../models/product.js';

export const getProductByWebsiteName = async (req, res) => {
    try {
        const { website_name } = req.body;

        const product = await Product.findOne({ website_name: website_name });

        if (product) {
            return res.status(200).json(product);
        } else {
            return res.status(404).json({ message: 'Product not found for the given website.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};
