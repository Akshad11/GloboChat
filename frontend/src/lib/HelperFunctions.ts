import api from "./axios";

export async function revokeRequest(code: String, id: String) {
    await api.post("/invites/revoke", {
        code: code,
        id: id
    });
}

export async function acceptRequest(code: String, id: String) {
    await api.post("/invites/accept", {
        code: code,
        id: id
    });
}


export async function rejectRequest(code: String, id: String) {
    await api.post("/invites/reject", {
        code: code,
        id: id
    });
}

