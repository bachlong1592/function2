const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.removeFromSongQueue = functions.https.onRequest(async (req, res) => {
    try {
        const { roomId, songId } = req.body; // Assumed that roomId and songId are sent in the request body
        const roomRef = admin.database().ref(`/yokaratv/rooms/${roomId}`);

        // Lấy danh sách hàng đợi bài hát của phòng
        const roomSnapshot = await roomRef.once('value');
        const room = roomSnapshot.val();

        if (!room) {
            res.status(404).send('Room not found');
            return;
        }

        // Loại bỏ ID bài hát khỏi hàng đợi
        room.songQueue = room.songQueue.filter(id => id !== songId);

        // Cập nhật dữ liệu phòng
        await roomRef.update({ songQueue: room.songQueue });

        res.status(200).send('Song removed from queue successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});
