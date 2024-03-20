//const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.ktv1_createRoom = require('./ktv1_createRoom');
exports.ktv1_users = require('./ktv1_users.js');
exports.ktv1_addSong = require('./ktv1_addSong.js');
exports.ktv1_removeSong = require('./ktv1_removeSong.js');
exports.ktv1_joinRoom = require('./ktv1_joinRoom.js');
exports.ktv1_roomQueueListener = require('./ktv1_roomQueueListener.js');