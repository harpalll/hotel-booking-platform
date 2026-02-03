import express from "express";
import { ApiResponse } from "./utils/ApiResponse";

// * ROUTES
import { authRouter } from "./routes/index";

const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/api/healthCheck", (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(true, { message: "server is up and running" }, null));
});

export default app;
