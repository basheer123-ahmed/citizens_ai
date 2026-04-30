const mongoose = require('mongoose');
const uri = "mongodb+srv://basheerm2006_db_user:HLIeHeD4nzw6ceU5@cluster0.od15rvc.mongodb.net/hack215?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILURE", err.message);
    process.exit(1);
  });
