export function generateInviteCode(username) {
    const clean = username
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")   // remove symbols
        .substring(0, 12);           // keep short

    const random = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `${clean}-${random}`;
}
