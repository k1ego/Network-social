const express = require('express');
const router = express.Router();
const multer = require('multer');
const { UserController, PostController, CommentController } = require('../controllers');
const { authenticateToken } = require("../middleware/auth");


const uploadDestination = 'uploads';

// Показываем, где хранить файлы
const storage = multer.diskStorage({
	destination: uploadDestination,
	filename: function(req, file, cb) {
		cb(null, file.originalname)
	}
});

const uploads = multer({ storage: storage });

// Роуты для пользователя
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/current', authenticateToken, UserController.current);
router.get('/users/:id', authenticateToken,  UserController.getUserById);
router.put('/users/:id', authenticateToken,  UserController.updateUser);

// Роуты постов
router.post('/posts', authenticateToken, PostController.createPost);
router.get('/posts', authenticateToken, PostController.getAllPosts);
router.get('/posts/:id', authenticateToken, PostController.getPostById);
router.delete('/posts/:id', authenticateToken, PostController.deletePost);

// Роуты комментариев
router.post('/comments', authenticateToken, CommentController.createComment);
router.delete('/comments/:id', authenticateToken, CommentController.deleteComment);


module.exports = router;