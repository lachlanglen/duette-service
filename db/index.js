const connection = require('./connection');
const { User, Video, Duette } = require('./models/index');

User.hasMany(Video);
Video.belongsTo(User);

Video.hasMany(Duette);
Duette.belongsTo(Video);

User.hasMany(Duette);
Duette.belongsTo(User);

module.exports = {
  connection,
  User,
  Video,
  Duette,
};
