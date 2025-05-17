import databaseConnection from "./database/databaseConnection.js";
import app from "./app.js";

databaseConnection()
.then(() => {
    app.use('error', (error) => {
        console.error(`App Error: ${error.message}`);
        process.exit(1);
    })

    app.listen(8000, () => {
        console.log(`Server is listening on port 8000`);
    })
})
.catch((error) => {
    console.error(`Connection Error: ${error.message}`);
    process.exit(1);
});