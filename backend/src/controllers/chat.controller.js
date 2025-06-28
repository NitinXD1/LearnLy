import { generateStreamToken } from '../lib/stream.js';

export const getStreamToken = async (req, res) => {
    try {
        const userId = req.user._id;
        const token = await generateStreamToken(userId);
        
        return res.status(200).json({ token });
    } catch (error) {
        console.error("Error in getStreamToken controller:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}