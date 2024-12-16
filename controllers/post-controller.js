const { prisma } = require('../prisma/prisma-client');

const PostController = {
    createPost: async (req, res) => {
        const { content } = req.body;
        const authorId = req.user.userId;

        if (!content) {
            return res.status(400).json({
                error: 'Все поля обязательны',
            });
        }

        try {
            // Данные файла из multer
            const file = req.file;

            const postData = {
                content,
                authorId,
                fileData: file ? file.buffer : null, // байты файла
                fileName: file ? file.originalname : null, // имя файла
                fileType: file ? file.mimetype : null, // тип файла
            };

            const post = await prisma.post.create({
                data: postData,
            });

            res.json(post);
        } catch (error) {
            console.error('Create Post Error', error);

            res.status(500).json({
                error: 'Internal Server Error',
            });
        }
    },

    getAllPosts: async (req, res) => {
        const userId = req.user.userId;

        try {
            const posts = await prisma.post.findMany({
                include: {
                    likes: true,
                    author: true,
                    comments: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            const postsWithLikeInfo = posts.map(post => ({
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId),
            }));

            res.json(postsWithLikeInfo);
        } catch (err) {
            res.status(500).json({ error: 'Произошла ошибка при получении постов' });
        }
    },

    getPostById: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        try {
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    comments: {
                        include: {
                            user: true,
                        },
                    },
                    likes: true,
                    author: true,
                },
            });

            if (!post) {
                return res.status(404).json({ error: 'Пост не найден' });
            }

            const postWithLikeInfo = {
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId),
            };

            res.json(postWithLikeInfo);
        } catch (error) {
            res.status(500).json({ error: 'Произошла ошибка при получении поста' });
        }
    },

    downloadPostFile: async (req, res) => {
        const { id } = req.params;

        try {
            const post = await prisma.post.findUnique({
                where: { id },
                select: { fileData: true, fileName: true, fileType: true },
            });

            if (!post || !post.fileData) {
                return res.status(404).json({ error: 'Файл не найден' });
            }

            res.set({
                'Content-Type': post.fileType,
                'Content-Disposition': `attachment; filename="${post.fileName}"`,
            });

            res.send(post.fileData);
        } catch (error) {
            console.error('Download File Error', error);
            res.status(500).json({ error: 'Ошибка при скачивании файла' });
        }
    },

    deletePost: async (req, res) => {
        const { id } = req.params;
        const post = await prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            return res.status(404).json({ error: 'Пост не найден' });
        }

        if (post.authorId !== req.user.userId) {
            return res.status(403).json({ error: 'Нет доступа' });
        }

        try {
            const transaction = await prisma.$transaction([
                prisma.comment.deleteMany({
                    where: { postId: id },
                }),
                prisma.like.deleteMany({
                    where: { postId: id },
                }),
                prisma.post.delete({
                    where: { id },
                }),
            ]);
            res.json(transaction);
        } catch (error) {
            console.error('Delete Post Error', error);

            res.status(500).json({
                error: 'Internal Server Error',
            });
        }
    },
};

module.exports = PostController;
