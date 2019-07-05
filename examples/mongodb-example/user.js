const { mongoose } = require('../../build');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    email: String
  },
  {
    timestamps: {}
  }
);

module.exports = mongoose.model('User', userSchema);
