const connection = require('./connection');
const { User, Video, Duette, SubscriptionUpdate, Flag } = require('./models/index');

User.hasMany(Video);
Video.belongsTo(User);

Video.hasMany(Duette);
Duette.belongsTo(Video);

User.hasMany(Duette);
Duette.belongsTo(User);

User.hasMany(User, { as: 'blocked' })

module.exports = {
  connection,
  User,
  Video,
  Duette,
  SubscriptionUpdate,
  Flag,
};
