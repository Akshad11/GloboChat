import User from "../models/User.js";

export const createUser = async (data) => {
    return await User.create(data);
};

export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

export const findUserByUsername = async (username) => {
    return await User.findOne({ username });
};

export const findUserById = async (id) => {
    return await User.findById(id);
};

export const updateUser = async (userId, update) => {
    return await User.findByIdAndUpdate(userId, update, { new: true });
};
