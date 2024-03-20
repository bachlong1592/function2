const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.createRoom = functions.https.onRequest(async (req, res) => {
    try {
        let newRoomId = generateRandomRoomId();
        let roomAlreadyExists = await roomExists(newRoomId);
        let retryCount = 0;

        // Kiểm tra nếu phòng đã tồn tại và số lần thử lại chưa vượt quá ngưỡng
        while (roomAlreadyExists && retryCount < 5) {
            newRoomId = generateRandomRoomId();
            roomAlreadyExists = await roomExists(newRoomId);
            retryCount++;
        }

        if (roomAlreadyExists) {
            res.status(409).send('Xung đột: ID phòng đã tồn tại');
            return;
        }

        const roomData = {
            name: `${newRoomId}`,
            capacity: 10,
            songQueue: [], // Thêm mảng songQueue vào dữ liệu phòng
            currentSong: null,
            isPlaying: false,
            users: [], // Thêm mảng users vào dữ liệu phòng
            metadata: {
                createdOn: Date.now(),
            }
        };

        // Tạo cả users và songQueue ban đầu
        roomData.users.push("initialUser");
        roomData.songQueue.push("initialSong");

        await admin.database().ref(`/yokaratv/rooms/${newRoomId}`).set(roomData);
        console.log(`Phòng mới được tạo với ID: ${newRoomId}`);

        res.status(201).send(`Phòng mới đã được tạo với ID: ${newRoomId}`);
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }
});

function generateRandomRoomId() {
    return Math.floor(100000 + Math.random() * 900000);
}

async function roomExists(roomId) {
    const snapshot = await admin.database().ref(`/yokaratv/rooms/${roomId}`).once('value');
    return snapshot.exists();
}
