
import { Server as HTTPServer } from "http";
import app from "./app";


const port = 5000;

async function main() {
  const httpServer: HTTPServer = app.listen(port, () => {
    console.log("🚀 Food Delivery Server is running on port", port);
  });
  

}

main();
