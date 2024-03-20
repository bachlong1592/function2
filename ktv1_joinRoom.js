const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.joinRoom = functions.https.onRequest(async (req, res) => {
    try {
        const roomId = req.body.roomId;
        if (!roomId) {
            throw new functions.https.HttpsError('invalid-argument', 'Thiếu thông tin ID phòng.');
        }

        console.log('roomId:', roomId);

        const userRecord = await admin.auth().createUser({});
        const userId = userRecord.uid;

        console.log('userRecord:', userRecord);
        console.log('userId:', userId);

        const roomRef = admin.database().ref(`/yokaratv/rooms/${roomId}`);
        const usersRef = roomRef.child('users');

        console.log('roomRef:', roomRef.toString());

        // Thêm UID của người dùng vào phòng
        await usersRef.child(userId).set(true);

        console.log('User added to room.');

        // Cài đặt trạng thái trực tuyến của người dùng
        const userStatusRef = admin.database().ref(`/status/${userId}`);
        userStatusRef.onDisconnect().remove();

        console.log('User status set up.');

        // Trả về dữ liệu phòng cho người dùng
        const roomSnapshot = await roomRef.once('value');
        const roomData = roomSnapshot.val();
        res.status(200).json(roomData);
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(400).send(error.message); // Sử dụng mã trạng thái 400 cho lỗi "invalid-argument"
    }
});
