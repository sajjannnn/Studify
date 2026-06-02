import expresss from 'express';
import { register, login, logout, addUserDocument, updateProfile, getBookmarks, toggleBookmark, getMe } from '../controllers/authControllers';
import { authMiddleware } from '../middlewares/authMiddlewares';

const router = expresss.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/user/documents", addUserDocument);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateProfile);
router.get("/bookmarks", authMiddleware, getBookmarks);
router.post("/bookmarks/:id", authMiddleware, toggleBookmark);

export default router;