require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes');
const { swaggerUi, specs } = require('./config/swagger');

app.use(express.json());
app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
