const express = require('express');
const router = express.Router();
const request = require('request');
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');

// @route  GET api/prices
// @desc   GET all prices
// @access Private

router.get("/", auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        const options = {
            uri: "https://www.binance.com/api/v3/ticker/price",
            method: "GET"
        };
        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                res.status(500).send("Server Error");
            }

            let updatedData = JSON.parse(body).reduce((obj, item) => {
                return {
                  ...obj,
                  [item["symbol"]]: {
                      ...item,
                      "liked": false
                    },
                };
            }, {});

            profile.favorites.forEach(fav => {
                if (Object.keys(updatedData).includes(fav)) {
                    updatedData[fav]["liked"] = true;
                }
            });

            res.json(updatedData);
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

module.exports = router;