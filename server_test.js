const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

var swaggerDoc = require('./swagger.json');
const swaggerUi = require('swagger-ui-express');
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
