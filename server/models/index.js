const sequelize = require('../config/database');
const { Sequelize, DataTypes } = require('sequelize');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import Models
db.User = require('./User')(sequelize, DataTypes);
db.Question = require('./Question')(sequelize, DataTypes);
db.ExamResult = require('./ExamResult')(sequelize, DataTypes);
db.News = require('./News')(sequelize, DataTypes);
db.NewsSource = require('./NewsSource')(sequelize, DataTypes);
db.ContactMessage = require('./ContactMessage')(sequelize, DataTypes);
db.Classroom = require('./Classroom')(sequelize, DataTypes);
db.ClassroomMember = require('./ClassroomMember')(sequelize, DataTypes);
db.Thread = require('./Thread')(sequelize, DataTypes);
db.Comment = require('./Comment')(sequelize, DataTypes);
db.PaymentSlip = require('./PaymentSlip')(sequelize, DataTypes);
db.MarqueeMessage = require('./MarqueeMessage')(sequelize, DataTypes);
db.Friendship = require('./Friendship')(sequelize, DataTypes);
db.StudyGroup = require('./StudyGroup')(sequelize, DataTypes);
db.StudyGroupMember = require('./StudyGroupMember')(sequelize, DataTypes);
db.QuestionReport = require('./QuestionReport')(sequelize, DataTypes);
db.RoomAsset = require('./RoomAsset')(sequelize, DataTypes);
db.SupportTicket = require('./SupportTicket')(sequelize, DataTypes);
db.SupportMessage = require('./SupportMessage')(sequelize, DataTypes);
db.AdsConfig = require('./AdsConfig')(sequelize, DataTypes);


db.Plan = require('./Plan')(sequelize, DataTypes);
db.Transaction = require('./Transaction')(sequelize, DataTypes);

// Community Models
db.SearchLog = require('./SearchLog')(sequelize, DataTypes);
db.InterestTag = require('./InterestTag')(sequelize, DataTypes);
db.ThreadTag = require('./ThreadTag')(sequelize, DataTypes);
db.Notification = require('./Notification')(sequelize, DataTypes);
db.ReportedContent = require('./ReportedContent')(sequelize, DataTypes);

db.Poll = require('./Poll')(sequelize, DataTypes);
db.PollOption = require('./PollOption')(sequelize, DataTypes);
db.PollVote = require('./PollVote')(sequelize, DataTypes);

db.UserRankingStats = require('./UserRankingStats')(sequelize, DataTypes);
db.Bookmark = require('./Bookmark')(sequelize, DataTypes);
db.GroupMessage = require('./GroupMessage')(sequelize, DataTypes);
db.PrivateMessage = require('./PrivateMessage')(sequelize, DataTypes);

// Ads System
db.Ad = require('./Ad')(sequelize, DataTypes);
db.AdMetric = require('./AdMetric')(sequelize, DataTypes);
db.SponsorTransaction = require('./SponsorTransaction')(sequelize, DataTypes);

// System Settings
db.SystemSetting = require('./SystemSetting')(sequelize, DataTypes);

// Learning Center (Business/Marketplace)
db.Business = require('./Business')(sequelize, DataTypes);
db.BusinessPost = require('./BusinessPost')(sequelize, DataTypes);
db.BusinessReview = require('./BusinessReview')(sequelize, DataTypes);
db.UserFollow = require('./UserFollow')(sequelize, DataTypes);
db.UserBookmark = require('./UserBookmark')(sequelize, DataTypes);
db.BusinessPostLike = require('./BusinessPostLike')(sequelize, DataTypes);

// Associations


// Polls

// Polls
db.Thread.hasOne(db.Poll, { foreignKey: 'thread_id' });
db.Poll.belongsTo(db.Thread, { foreignKey: 'thread_id' });

db.Poll.hasMany(db.PollOption, { foreignKey: 'poll_id', as: 'Options' });
db.PollOption.belongsTo(db.Poll, { foreignKey: 'poll_id' });

db.PollOption.hasMany(db.PollVote, { foreignKey: 'option_id' });
db.PollVote.belongsTo(db.PollOption, { foreignKey: 'option_id' });

db.User.hasMany(db.PollVote, { foreignKey: 'user_id' });
db.PollVote.belongsTo(db.User, { foreignKey: 'user_id' });


// User & ExamResult
db.User.hasMany(db.ExamResult, { foreignKey: 'user_id' });
db.ExamResult.belongsTo(db.User, { foreignKey: 'user_id' });

// User & Thread
db.User.hasMany(db.Thread, { foreignKey: 'user_id' });
db.Thread.belongsTo(db.User, { foreignKey: 'user_id' });
db.Thread.belongsTo(db.News, { foreignKey: 'shared_news_id', as: 'SharedNews' });
db.Thread.belongsTo(db.BusinessPost, { foreignKey: 'shared_business_post_id', as: 'SharedBusinessPost' });

// User & Comment
db.User.hasMany(db.Comment, { foreignKey: 'user_id' });
db.Comment.belongsTo(db.User, { foreignKey: 'user_id' });

// Thread & Comment
db.Thread.hasMany(db.Comment, { foreignKey: 'thread_id' });
db.Comment.belongsTo(db.Thread, { foreignKey: 'thread_id' });

// Comment Replies (Nested)
db.Comment.hasMany(db.Comment, { as: 'Replies', foreignKey: 'parent_id' });
db.Comment.belongsTo(db.Comment, { as: 'Parent', foreignKey: 'parent_id' });

// User & SearchLog
db.User.hasMany(db.SearchLog, { foreignKey: 'user_id' });
db.SearchLog.belongsTo(db.User, { foreignKey: 'user_id' });

// Tags (Many-to-Many)
db.Thread.belongsToMany(db.InterestTag, { through: db.ThreadTag, foreignKey: 'thread_id', otherKey: 'tag_id' });
db.InterestTag.belongsToMany(db.Thread, { through: db.ThreadTag, foreignKey: 'tag_id', otherKey: 'thread_id' });

// Notifications
db.User.hasMany(db.Notification, { foreignKey: 'user_id' });
db.Notification.belongsTo(db.User, { foreignKey: 'user_id' });

// Reported Content
db.User.hasMany(db.ReportedContent, { foreignKey: 'reporter_id', as: 'ReportsFiled' });
db.ReportedContent.belongsTo(db.User, { foreignKey: 'reporter_id', as: 'Reporter' });

// User & PaymentSlip
db.User.hasMany(db.PaymentSlip, { foreignKey: 'user_id' });
db.PaymentSlip.belongsTo(db.User, { foreignKey: 'user_id' });

// User & MarqueeMessage
db.User.hasMany(db.MarqueeMessage, { foreignKey: 'user_id' });
db.MarqueeMessage.belongsTo(db.User, { foreignKey: 'user_id' });

// Classroom (Teacher)
db.User.hasMany(db.Classroom, { foreignKey: 'teacher_id', as: 'TeachingClassrooms' });
db.Classroom.belongsTo(db.User, { foreignKey: 'teacher_id', as: 'Teacher' });

// Classroom Members
db.Classroom.belongsToMany(db.User, { through: db.ClassroomMember, foreignKey: 'classroom_id', otherKey: 'user_id', as: 'Students' });
db.User.belongsToMany(db.Classroom, { through: db.ClassroomMember, foreignKey: 'user_id', otherKey: 'classroom_id', as: 'EnrolledClassrooms' });

// Study Group (Owner)
db.User.hasMany(db.StudyGroup, { foreignKey: 'owner_id', as: 'OwnedGroups' });
db.StudyGroup.belongsTo(db.User, { foreignKey: 'owner_id', as: 'Owner' });

// Study Group Members
db.StudyGroup.belongsToMany(db.User, { through: db.StudyGroupMember, foreignKey: 'group_id', otherKey: 'user_id', as: 'Members' });
db.User.belongsToMany(db.StudyGroup, { through: db.StudyGroupMember, foreignKey: 'user_id', otherKey: 'group_id', as: 'JoinedGroups' });

// Explicit associations for StudyGroupMember (required for eager loading)
db.StudyGroupMember.belongsTo(db.StudyGroup, { foreignKey: 'group_id' });
db.StudyGroupMember.belongsTo(db.User, { foreignKey: 'user_id' });
db.StudyGroup.hasMany(db.StudyGroupMember, { foreignKey: 'group_id' });
db.User.hasMany(db.StudyGroupMember, { foreignKey: 'user_id' });

// Friendships
db.User.hasMany(db.Friendship, { foreignKey: 'user_id', as: 'SentRequests' });
db.User.hasMany(db.Friendship, { foreignKey: 'friend_id', as: 'ReceivedRequests' });
db.Friendship.belongsTo(db.User, { foreignKey: 'user_id', as: 'Requester' });
db.Friendship.belongsTo(db.User, { foreignKey: 'friend_id', as: 'Recipient' });

// Question Reports
db.Question.hasMany(db.QuestionReport, { foreignKey: 'question_id' });
db.QuestionReport.belongsTo(db.Question, { foreignKey: 'question_id' });
db.User.hasMany(db.QuestionReport, { foreignKey: 'user_id' });
db.QuestionReport.belongsTo(db.User, { foreignKey: 'user_id' });

// Rooms (Multiplayer)
db.Room = require('./Room')(sequelize, DataTypes);
db.RoomParticipant = require('./RoomParticipant')(sequelize, DataTypes);

db.User.hasMany(db.Room, { foreignKey: 'host_user_id' });
db.Room.belongsTo(db.User, { as: 'Host', foreignKey: 'host_user_id' });

db.Room.hasMany(db.RoomParticipant, { foreignKey: 'room_id' });
db.RoomParticipant.belongsTo(db.Room, { foreignKey: 'room_id' });

db.User.hasMany(db.RoomParticipant, { foreignKey: 'user_id' });
db.RoomParticipant.belongsTo(db.User, { foreignKey: 'user_id' });

// Thread Likes (Prevent Spam)
db.ThreadLike = require('./ThreadLike')(sequelize, DataTypes);
db.User.hasMany(db.ThreadLike, { foreignKey: 'user_id' });
db.ThreadLike.belongsTo(db.User, { foreignKey: 'user_id' });
db.Thread.hasMany(db.ThreadLike, { foreignKey: 'thread_id' });

// User Ranking Stats
db.User.hasMany(db.UserRankingStats, { foreignKey: 'user_id' });
db.UserRankingStats.belongsTo(db.User, { foreignKey: 'user_id' });

// Bookmarks
db.User.hasMany(db.Bookmark, { foreignKey: 'user_id' });
db.Bookmark.belongsTo(db.User, { foreignKey: 'user_id' });

// Group Messages
db.StudyGroup.hasMany(db.GroupMessage, { foreignKey: 'group_id' });
db.GroupMessage.belongsTo(db.StudyGroup, { foreignKey: 'group_id' });
db.User.hasMany(db.GroupMessage, { foreignKey: 'user_id', as: 'SentGroupMessages' });
db.GroupMessage.belongsTo(db.User, { foreignKey: 'user_id', as: 'Sender' });
db.ThreadLike.belongsTo(db.Thread, { foreignKey: 'thread_id' });

// Private Messages
db.User.hasMany(db.PrivateMessage, { foreignKey: 'sender_id', as: 'SentMessages' });
db.User.hasMany(db.PrivateMessage, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
db.PrivateMessage.belongsTo(db.User, { foreignKey: 'sender_id', as: 'Sender' });
db.PrivateMessage.belongsTo(db.User, { foreignKey: 'receiver_id', as: 'Receiver' });

// Transactions & Plans
db.User.hasMany(db.Transaction, { foreignKey: 'user_id' });
db.Transaction.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.Plan.hasMany(db.Transaction, { foreignKey: 'plan_id' });
db.Transaction.belongsTo(db.Plan, { foreignKey: 'plan_id', as: 'plan' });

// Ads Associations
db.User.hasMany(db.Ad, { foreignKey: 'sponsor_id', as: 'ads' });
db.Ad.belongsTo(db.User, { foreignKey: 'sponsor_id', as: 'sponsor' });

db.Ad.hasMany(db.AdMetric, { foreignKey: 'ad_id' });
db.AdMetric.belongsTo(db.Ad, { foreignKey: 'ad_id' });

db.User.hasMany(db.SponsorTransaction, { foreignKey: 'sponsor_id' });
db.SponsorTransaction.belongsTo(db.User, { foreignKey: 'sponsor_id' });

// --- Learning Center Associations ---

// User & Business (1:1 for now)
db.User.hasOne(db.Business, { foreignKey: 'owner_uid', as: 'MyBusiness' });
db.Business.belongsTo(db.User, { foreignKey: 'owner_uid', as: 'Owner' });

// Business & Posts
db.Business.hasMany(db.BusinessPost, { foreignKey: 'business_id', as: 'Posts' });
db.BusinessPost.belongsTo(db.Business, { foreignKey: 'business_id', as: 'Business' });

// Business & Reviews
db.Business.hasMany(db.BusinessReview, { foreignKey: 'business_id', as: 'Reviews' });
db.BusinessReview.belongsTo(db.Business, { foreignKey: 'business_id', as: 'Business' });

// User & Reviews (Reviewer)
db.User.hasMany(db.BusinessReview, { foreignKey: 'user_uid' });
db.BusinessReview.belongsTo(db.User, { foreignKey: 'user_uid', as: 'Reviewer' });

// User Follows Business
db.User.belongsToMany(db.Business, { through: db.UserFollow, foreignKey: 'user_uid', as: 'FollowingBusinesses' });
db.Business.belongsToMany(db.User, { through: db.UserFollow, foreignKey: 'business_id', as: 'Followers' });

// User Bookmarks Posts
db.User.belongsToMany(db.BusinessPost, { through: db.UserBookmark, foreignKey: 'user_uid', as: 'BookmarkedPosts' });
db.BusinessPost.belongsToMany(db.User, { through: db.UserBookmark, foreignKey: 'post_id', as: 'BookmarkedBy' });

// User Likes Posts
db.User.belongsToMany(db.BusinessPost, { through: db.BusinessPostLike, foreignKey: 'user_uid', as: 'LikedBusinessPosts' });
db.BusinessPost.belongsToMany(db.User, { through: db.BusinessPostLike, foreignKey: 'post_id', as: 'LikedBy' });


// Business Messages
db.BusinessMessage = require('./BusinessMessage')(sequelize, DataTypes);
db.Business.hasMany(db.BusinessMessage, { foreignKey: 'business_id', as: 'Messages' });
db.BusinessMessage.belongsTo(db.Business, { foreignKey: 'business_id', as: 'Business' });

db.User.hasMany(db.BusinessMessage, { foreignKey: 'user_id', as: 'BusinessMessages' });
db.BusinessMessage.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' });


// --- Support System Associations ---

// User & SupportTicket
db.User.hasMany(db.SupportTicket, { foreignKey: 'user_id', as: 'Tickets' });
db.SupportTicket.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// SupportTicket & SupportMessage
db.SupportTicket.hasMany(db.SupportMessage, { foreignKey: 'ticket_id', as: 'messages' });
db.SupportMessage.belongsTo(db.SupportTicket, { foreignKey: 'ticket_id', as: 'ticket' });

// SupportMessage & Sender (User)
db.SupportMessage.belongsTo(db.User, { foreignKey: 'sender_id', as: 'sender' });
db.User.hasMany(db.SupportMessage, { foreignKey: 'sender_id', as: 'SupportMessages' });



module.exports = db;
