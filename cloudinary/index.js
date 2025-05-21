const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//この辺の実行の詳細はドキュメントを読みながらでいいから流れとコンセプトを理解していれば大丈夫！
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'YelpCamp',
        allowed_formats:['jpeg', 'jpg', 'png']
    },
});

module.exports = {
    cloudinary,
    storage
}