import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
  console.log(`Swagger docs available at http://localhost:${env.port}/api/docs`);
});

