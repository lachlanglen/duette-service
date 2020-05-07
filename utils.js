const bcrypt = require('bcrypt');

const hasher = (itemToHash) => {
  console.log('itemToHash: ', itemToHash)
  const saltRounds = 10;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      console.log('error generating salt: ', err)
    } else {
      console.log('no error! salt: ', salt)
      bcrypt.hash(itemToHash, salt, (error, hash) => {
        if (error) {
          console.log('error generating hash: ', error)
        } else {
          console.log('no error! hash: ', hash)
          return hash;
        }
      });
    }
  });
}

const compare = (item, hash) => {
  bcrypt.compare(item, hash, (err, result) => {
    if (err) {
      console.log('error comparing: ', err)
    } else {
      // result === true
      return result;
    }
  });
};

module.exports = {
  hasher,
  compare,
};
