import * as messageService from "../services/messageService.js";

export const sendMessage = async (req, res) => {
    try {
        const { conversationId, content, type, attachments } = req.body;

        const message = await messageService.createMessage({
            conversationId,
            senderId: req.user.id,
            content,
            type,
            attachments,
        });

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: "Failed to send message", error });
    }
};

export const getConversationMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const { before, limit } = req.query;

        const messages = await messageService.getMessages(id, limit, before);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages", error });
    }
};
