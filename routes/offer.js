const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const fileUpload = require("express-fileupload");
const Offer = require("../models/Offer");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middleware/isAuthenticated");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),

  async (req, res) => {
    try {
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { MARQUE: req.body.brand },
          { TAILLE: req.body.size },
          { ÉTAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],
      });
      const pictureToUpload = req.files.picture;
      // On envoie une à Cloudinary un buffer converti en base64
      const result = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload)
      );

      console.log(newOffer);
      //console.log(req.files);
      await newOffer.save();
      res.json({
        newOffer,
        product_image: result.url,
        account: newOffer.account,
        owner: req.user,
      });
    } catch (error) {
      console.log(error.message);
    }
  }
);
router.get("/offers", async (req, res) => {
  try {
    // const offersTab = await Offer.find()
    //   // .sort({ product_name: 1 })
    //   // .limit(5)
    //   // .skip(5)
    //   // .select("product_name product_price -_id");
    const { title, priceMin, priceMax, sort, page = 1 } = req.query;
    const filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      if (!filters.product_price) {
        filters.product_price = {};
      } else {
        filters.product_price.$gte = priceMin;
      }
    }
    if (priceMax) {
      if (!filters.product_price) {
        filters.product_price = {};
      }
      priceMax = filters.product_price.$lte;
    }

    let sortFilter = {};

    res.json();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
