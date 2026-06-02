import { prisma } from "../../lib/prisma"
import bcrypt from "bcryptjs"
import {generateToken} from "../utils/generateToken"

const register = async (req,res) => {
    const { name, email, password } = req.body;
    const university = req.body.university || null;
    const course = req.body.course || null;
    const semester = req.body.semester || null;
    // res.json({message: "User registered successfully", user: { name, email, university, course, semester }});

    const user = await prisma.user.findUnique({
        where : {email}
    })

    if(user){
        return res.status(400).json({message: "user already exist"})
    }

    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //create user
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            university,
            course,
            semester,
            password: hashedPassword
        }
    })
       const token = await generateToken(newUser.id, res)
    res.status(201).json({message: "User registered successfully", user: newUser, token});
}   

const login = async (req,res) => {
    const {email, password } = req.body;

    const user = await prisma.user.findUnique({
        where : {email}
    })

    if(!user){
        return res.status(400).json({message: "Invalid credentials"})
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        return res.status(400).json({message: "Invalid credentials"})
    }
    
    const token = await generateToken(user.id, res)
    res.json({message: "Login successful", user, token});

}

const logout = async (req,res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    })
    res.status(200).json({message: "Logout successful"});
}
const addUserDocument = async (req, res) => {
  const apiKey = req.headers["x-internal-key"];
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { userId, docId } = req.body;
  if (!userId || !docId) {
    return res.status(400).json({ error: "userId and docId are required" });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { documentIds: { push: docId } },
  });

  res.json({ success: true });
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, university, course, semester } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (university !== undefined) data.university = university;
    if (course !== undefined) data.course = course;
    if (semester !== undefined) data.semester = semester;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { bookmarkNoteIds: true },
    });
    res.json({ bookmarkNoteIds: user?.bookmarkNoteIds ?? [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Document ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { bookmarkNoteIds: true },
    });

    const bookmarks = user?.bookmarkNoteIds ?? [];
    const exists = bookmarks.includes(id);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: exists
        ? { bookmarkNoteIds: { set: bookmarks.filter((b) => b !== id) } }
        : { bookmarkNoteIds: { push: id } },
    });

    res.json({ bookmarked: !exists, bookmarkNoteIds: updatedUser.bookmarkNoteIds });
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
};

export { register, login, logout, addUserDocument, getMe, updateProfile, getBookmarks, toggleBookmark };