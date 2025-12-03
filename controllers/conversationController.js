import * as convoService from "../services/conversationService.js";

export const createDirect = async (req, res) => {
    try {
        const { partnerId } = req.body;
        const conversation = await convoService.createDirectConversation(
            req.user.id,
            partnerId
        );
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: "Direct conversation error", error });
    }
};

export const createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const conversation = await convoService.createGroupConversation(
            req.user.id,
            name,
            members
        );
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: "Group creation failed", error });
    }
};

export const getMyConversations = async (req, res) => {
    try {
        const convos = await convoService.getUserConversations(req.user.id);
        res.json(convos);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch conversations", error });
    }
};
