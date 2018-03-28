import express = require("express");

export const router = express.Router();

router.get("/", (_REQ, res) => {
    const date = new Date();
    res.render("index.html", {date});
});
