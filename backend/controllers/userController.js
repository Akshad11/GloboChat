import * as userService from "../services/userService.js";

export const getMe = async (req, res) => {
    try {
        const user = await userService.findUserById(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile", error });
    }
};

export const updateMe = async (req, res) => {
    try {
        const user = await userService.updateUser(req.user.id, req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile", error });
    }
};
