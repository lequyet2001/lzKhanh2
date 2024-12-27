const User = require('../models/user');
const Course = require('../models/course');
const SC = require('../models/student_course');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({},{user_id:1,full_name:1,role:1});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllUsers22 = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { user_id } = req.body;
        if(user_id === req.user.user_id){
            return res.status(400).json({ message: 'You cannot delete yourself' });
        }
        console.log({user_id});
        const user = await User.find({user_id});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findOneAndDelete({user_id});
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.setRole = async (req, res) => {
    try {
        const { user_id, role, status } = req.body;
        if (!Number.isInteger(role) || !Number.isInteger(status)) {
            return res.status(400).json({ message: 'Role or status must be an integer' });
        }

        if (user_id === req.user.user_id) {
            return res.status(400).json({ message: 'You cannot change your own role' });
        }

        if (!role || !status) {
            return res.status(400).json({ message: 'Role or status is required' });
        }

        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = Number(role);
        user.status =Number(status) ;   
        await user.save();
        res.status(200).json({ message: 'Role updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
exports.detailUser = async (req, res) => {
    try {
        const user = req.user;
        console.log({user});
        res.status(200).json(user);

    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

