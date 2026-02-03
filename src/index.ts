import express from "express";
import app from "./app";

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  if (server) {
    console.log(`server is running on ${server?.address()?.port}`);
  }
});
