const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.joinRoom = functions.https.onRequest(async (req, res) => {
    try {
        // Kiểm tra xem ID phòng đã được cung cấp hay không
        const roomId = req.query.roomId;
        if (!roomId) {
            throw new functions.https.HttpsError('invalid-argument', 'Thiếu thông tin ID phòng.');
        }

        const userRecord = await admin.auth().createUser({});
        const userId = userRecord.uid;

        const roomRef = admin.database().ref(`/yokaratv/rooms/${roomId}`);

        // Kiểm tra xem phòng có tồn tại hay không
        const roomSnapshot = await roomRef.once('value');
        if (!roomSnapshot.exists()) {
            throw new functions.https.HttpsError('not-found', 'Phòng không tồn tại.');
        }

        // Lấy dữ liệu phòng
        const roomData = roomSnapshot.val();

        // Kiểm tra xem phòng đã đầy hay không
        if (roomData.users && roomData.users.length >= roomData.capacity) {
            throw new functions.https.HttpsError('resource-exhausted', 'Phòng đã đầy.');
        }

        // Thêm UID của người dùng vào phòng
        const usersRef = roomRef.child('users');
        await usersRef.child(userId).set(true);

        // Trả về dữ liệu phòng cho người dùng
        res.status(200).json(roomData);
    } catch (error) {
        console.error('Lỗi:', error);
        if (error.code && error.message) {
            res.status(error.code).send(error.message);
        } else {
            res.status(500).send('Lỗi máy chủ nội bộ');
        }
    }
});
