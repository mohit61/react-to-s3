const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var aws = require("aws-sdk");
require("dotenv").config(); // Configure dotenv to load in the .env file

app.listen("3001", () => {
  console.log("app is listening");
});

app.post("/s3", (req, res) => {
  console.log(req.body);
  // Configure aws with your accessKeyId and your secretAccessKey
  aws.config.update({
    region: "ap-south-1", // Put your aws region here
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
  });

  const S3_BUCKET = process.env.bucket;
  // console.log("process", process.env);
  console.log("bucket 1", S3_BUCKET);
  // Now lets export this function so we can call it from somewhere else

  console.log("inside s3 func");
  const s3 = new aws.S3(); // Create a new instance of S3
  const fileName = req.body.fileName;
  const fileType = req.body.fileType;
  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 500,
    ContentType: fileType,
    ACL: "public-read"
  };

  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) {
      console.log(err);
      res.json({ success: false, error: err });
    }
    console.log("inside");
    // Data payload of what we are sending back, the url of the signedRequest and a URL where we can access the content after its saved.

    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    // Send it all back

    res.json({ success: true, data: { returnData } });
  });
});
