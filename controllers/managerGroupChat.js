



exports.createGroupChat = async (req, res) => {
    try {
        const { course_id, manager_id, owner_id } = req.body;
        const newGroupChat = new GroupChat({ course_id, manager_id, owner_id });
        await newGroupChat.save();
        return res.status(200).json(newGroupChat);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}