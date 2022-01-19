const app = require('./app');
const {API_PORT} = process.env

app.listen(API_PORT, () => { console.log(`server running on port 4000....`) });