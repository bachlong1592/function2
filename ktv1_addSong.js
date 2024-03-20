const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.addSong = functions.https.onRequest(async (req, res) => {
    try {
        // Kiểm tra xem bài hát đã có trong danh sách phát hay chưa
        const roomId = req.query.roomId;
        const songData = req.body; // Giả sử dữ liệu bài hát được gửi dưới dạng JSON trong body của yêu cầu

        // Kiểm tra xem dữ liệu bài hát hợp lệ hay không
        if (!isValidSongData(songData)) {
            res.status(400).send('Lỗi: Dữ liệu bài hát không hợp lệ.');
            return;
        }

        const roomRef = admin.database().ref(`/yokaratv/rooms/${roomId}`);
        const snapshot = await roomRef.child('songQueue').once('value');
        const existingSongs = snapshot.val();
        const isSongExist = existingSongs && existingSongs.some(song => song.id === songData.id);

        if (isSongExist) {
            res.status(409).send('Lỗi: Bài hát đã có trong danh sách phát.');
            return;
        }

        // Thêm bài hát vào danh sách phát của phòng hát
        await roomRef.child('songQueue').push(songData);

        // Cập nhật trạng thái phòng hát
        await roomRef.child('isPlaying').set(false);

        // Ghi log
        console.log(`Bài hát mới đã được thêm vào danh sách phát của phòng ${roomId}:`, songData);

        // Trả về dữ liệu bài hát đã thêm
        res.status(200).json(songData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

function isValidSongData(songData) {
    // Kiểm tra xem dữ liệu bài hát có đầy đủ các trường cần thiết hay không
    // Ví dụ: Kiểm tra songData.id, songData.title, songData.artist, vv.
    // Trả về true nếu hợp lệ, ngược lại trả về false
    return songData && songData.videoId && songData.songName && songData.songUrl;
}
