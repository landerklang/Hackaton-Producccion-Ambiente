require('dotenv').config();

const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');
const { generateProductFromText, getAllProducts } = require('./controllers/productController');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/products/ai-generate', generateProductFromText);
app.get('/api/products', getAllProducts);

app.get('/api/health', (req, res) => {
	res.status(200).json({ status: 'ok' });
});

const startServer = async () => {
	try {
		await connectDB();
		app.listen(port, () => {
			console.log(`Server listening on port ${port}`);
		});
	} catch (error) {
		console.error('Server startup failed:', error.message);
		process.exit(1);
	}
};

startServer();
