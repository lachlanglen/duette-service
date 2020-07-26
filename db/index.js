const connection = require('./connection');
const { User, Video, Duette, SubscriptionUpdate, Flag } = require('./models/index');

User.hasMany(Video);
Video.belongsTo(User);

Video.hasMany(Duette);
Duette.belongsTo(Video);

User.hasMany(Duette);
Duette.belongsTo(User);

User.belongsToMany(User, { as: 'blocked', through: 'connection' })

module.exports = {
  connection,
  User,
  Video,
  Duette,
  SubscriptionUpdate,
  Flag,
};
