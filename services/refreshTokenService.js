import RefreshToken from "../models/RefreshToken.js";

export const createToken = async (data) => {
    return await RefreshToken.create(data);
};

export const findToken = async (tokenId) => {
    return await RefreshToken.findOne({ tokenId });
};

export const revokeToken = async (tokenId) => {
    return await RefreshToken.findOneAndUpdate(
        { tokenId },
        { revoked: true },
        { new: true }
    );
};
