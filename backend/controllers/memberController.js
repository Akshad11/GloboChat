import * as memberService from "../services/memberService.js";

export const addMemberToConversation = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;
        const member = await memberService.addMember(conversationId, userId);
        res.json(member);
    } catch (error) {
        res.status(500).json({ message: "Failed to add member", error });
    }
};

export const removeMemberFromConversation = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;
        await memberService.removeMember(conversationId, userId);
        res.json({ message: "Member removed" });
    } catch (error) {
        res.status(500).json({ message: "Failed to remove member", error });
    }
};
