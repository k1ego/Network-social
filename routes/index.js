const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
	UserController,
	PostController,
	CommentController,
	LikeController,
	FollowController,
} = require('../controllers');
const { authenticateToken } = require('../middleware/auth');

const uploadDestination = 'uploads';

// Хранение файлов в памяти (buffer)
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// Роуты для пользователя
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/current', authenticateToken, UserController.current);
router.get('/users/:id', authenticateToken, UserController.getUserById);
router.put('/users/:id', authenticateToken, upload.single('avatar'), UserController.updateUser);

// Роуты постов
router.post('/posts', authenticateToken, upload.single('file'), PostController.createPost);
router.get('/posts', authenticateToken, PostController.getAllPosts);
router.get('/posts/:id', authenticateToken, PostController.getPostById);
router.delete('/posts/:id', authenticateToken, PostController.deletePost);
router.get('/posts/:id/file', authenticateToken, PostController.downloadPostFile);

// Роуты комментариев
router.post('/comments', authenticateToken, CommentController.createComment);
router.delete(
	'/comments/:id',
	authenticateToken,
	CommentController.deleteComment
);

// Роуты лайков
router.post('/likes', authenticateToken, LikeController.likePost);
router.delete('/likes/:id', authenticateToken, LikeController.unlikePost);

// Роуты подписок
router.post('/follow', authenticateToken, FollowController.followUser);
router.delete('/unfollow/:id', authenticateToken, FollowController.unfollowUser);

module.exports = router;
