import User from '../models/User.model.js'
import FriendRequest from '../models/FriendRequest.model.js'

export const getRecommendedUsers = async (req, res) => {
    try {
        
        const currentUserId = req.user._id;
        const currentUser = req.user

        const recommendedUsers = await User.find(
            {
                $and: [
                    { _id: { $ne: currentUserId } },
                    { _id: { $nin: currentUser.friends } },
                    {isOnBoarded : true}
                ]
            }
        )
        
        res.status(200).json(recommendedUsers);

    } catch (error) {
        console.error("Error in getRecommendedUsers controller:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error});
    }
}

export const getMyFriends = async (req, res) => {
   try {
        const user = await User.findById(req.user._id)
        .select("friends")
        .populate("friends", "-password");

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    } 
}

export const sendFriendRequest = async (req, res) => {
    try {
        const myId = req.user._id;
        const {id:recipientId} = req.params.id;

        if(myId === recipientId) {
            return res.status(400).json({message: "You cannot send a friend request to yourself"});
        }

        const recipient = await User.findById(recipientId);
        if(!recipient) {
            return res.status(404).json({message: "Recipient not found"});
        }

        if(recipient.friends.includes(myId)) {
            return res.status(400).json({message: "You are already friends with this user"});
        }

        const existingRequest = await FriendRequest.findOne(
            {
                $or: [
                    {
                        sender: myId,
                        recipient: recipientId
                    },
                    {
                        sender: recipientId,
                        recipient: myId
                    }
                ]
            }
        )

        if(existingRequest) {
            return res.status(400).json({message: "Friend request already exists"});
        }

        const newFriendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        })

        return res.status(201).json(newFriendRequest);

    } catch (error) {
        console.error("Error in sendFriendRequest controller:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const {id:requestId} = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest) {
            return res.status(404).json({message: "Friend request not found"});
        }

        if(friendRequest.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "You are not authorized to accept this friend request"});
        }

        friendRequest.status = "accepted";
        await friendRequest.save();
        
        await User.findByIdAndUpdate(
            friendRequest.sender,
            { $addToSet: { friends: friendRequest.recipient } },
        );

        await  User.findByIdAndUpdate(
            friendRequest.recipient,
            { $addToSet: { friends: friendRequest.sender } },
        );

        return res.status(200).json({
            message: "Friend request accepted successfully",
            friendRequest: {
                sender: sender._id,
                recipient: recipient._id,
                status: friendRequest.status
            }
        });
        
    } catch (error) {
        console.error("Error in acceptFriendRequest controller:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const incomingReqs = await FriendRequest.find({
            recipient: userId,
            status: "pending"
        })
        .populate("sender", "-password");

        const acceptedReqs = await FriendRequest.find({
            sender: userId,
            status: "accepted"
        })
        .populate("recipient", "-password");

        return res.status(200).json({incomingReqs, acceptedReqs});
        
    } catch (error) {
        console.error("Error in getFriendRequests controller:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export const getOutgoingFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const outgoingRequests = await FriendRequest.find({
            sender: userId,
            status: "pending"
        })
        .populate("recipient", "-password");

        return res.status(200).json(outgoingRequests);
        
    } catch (error) {
        console.error("Error in getOutgoingFriendRequests controller:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}