const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Chức năng trigger Realtime Database khi có thay đổi trong dữ liệu phòng
exports.roomQueueListener = functions.database.ref('/yokaratv/rooms/{roomId}')
    .onUpdate(async (change, context) => {
        try {
            const roomId = context.params.roomId;
            const roomData = change.after.val();

            // Kiểm tra xem phòng có người dùng không
            if (roomData.users && Object.keys(roomData.users).length === 0) {
                // Xóa phòng sau một khoảng thời gian chờ
                setTimeout(async () => {
                    await admin.database().ref(`/yokaratv/rooms/${roomId}`).remove();
                    console.log(`Phòng với ID ${roomId} đã được xóa do không có người dùng nào ở trong hàng chờ`);
                }, 60000); // 6 phút, có thể điều chỉnh thời gian chờ tùy ý
            }
        } catch (error) {
            console.error('Lỗi:', error);
        }
    });
