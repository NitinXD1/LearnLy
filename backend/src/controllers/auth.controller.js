import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.model.js";
import jwt from 'jsonwebtoken'

export const signup = async (req,res) => {
    const {fullName,email,password} = req.body;

    try {
        
        if(!fullName || !email || !password){
            return res.status(400).json({message : 'All fields are necessary'})
        }

        if(password.length < 6){
            return res.status(400).json({message : 'Password too short'})
        }

        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.status(400).json({message:"Email already exists"})
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create(
            {
                email,
                fullName,
                password,
                profilePic: randomAvatar,
            }
        )

        try {
            await upsertStreamUser(
                {
                    id: newUser._id.toString(),
                    name: newUser.fullName,
                    image: newUser.profilePic || "",
                }
            );
            console.log(`Successfully completed Stream User creation for ${newUser.fullName}`);
        } catch (error) {
            console.error("Error encountered in calling code during Stream User creation:", error); 
        }

        const token = jwt.sign(
            {
                userId:newUser._id
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn : "7d"
            }
        )

        res.cookie("jwt",token,{
            maxAge : 7 * 24 * 60 * 60 * 1000,
            httpOnly : true,
            sameSite : "strict",
            secure : process.env.NODE_ENV === "production"
        })

        res.status(201).json(
            {
                success : true,
                user : newUser
            }
        )
    } catch (error) {
        return res.status(500).json({message:"Internal error"})
    }
}

export const login = async (req,res) => {
    
    try {
        
        const {email,password} = req.body

        if(!email || !password){
            return res.status(404).json({message : "Both fields are required"});
        }
        
        const user = await User.findOne({email});

        if(!user){
            return res.status(401).json({message : "Invalid Email or Password"});
        }

        const isPasswordCorrect = await user.matchPassword(password);

        if(!isPasswordCorrect){
            return res.status(401).json({message : "Wrong Password"});
        }

        const token = jwt.sign(
            {
                userId : user._id
            }
            ,process.env.JWT_SECRET_KEY
            ,{
                expiresIn : "7d"
            }
        )

        res.cookie("jwt",token,{
            maxAge : 7 * 24 * 60 * 60 * 1000,
            httpOnly : true,
            sameSite : "strict",
            secure : process.env.NODE_ENV === "production"
        })

        res.status(200).json(
            {
                success : true,
                message : "Successfully logged in",
                user
            }
        )

    } catch (error) {
        console.log("Login controller error",error.message)
        res.status(500).json({message : "Internal Server Error"})       
    }
}

export const logout = async (req,res) => {
    res.clearCookie("jwt");
    res.status(200).json({message : "Logged out successfully"})
}

export const onboard = async(req,res) => {
    try {
        const userId = req.user._id;

        const {fullName, bio , location ,learningLanguage , nativeLanguage} = req.body;

        if(!fullName || !bio || !location || !learningLanguage || !nativeLanguage){
            return res.status(400).json(
                {
                    message : "All fields are required",
                    missingFields : 
                    [
                        !fullName && "fullName",
                        !bio && "bio",
                        !location && "location",
                        !learningLanguage && "learningLanguage",
                        !nativeLanguage && "nativeLanguage"    
                    ].filter(Boolean),
                }
            );
        }

        const updateUser = await User.findByIdAndUpdate(userId,{...req.body,isOnBoarded : true},{new : true});

        if(!updateUser){
            return res.status(404).json({message : "User not found"});
        }
        
        try {
            await upsertStreamUser({
                id: updateUser._id.toString(),
                name: updateUser.fullName,
                image: updateUser.profilePic || "",
            })
            console.log(`Successfully completed Stream User update for ${updateUser.fullName}`);
        } catch (error) {
            console.error("Error encountered in calling code during Stream User update:", error);
        }

        res.status(200).json(
            {
                success : true,
                message : "User onboarded successfully",
                user : updateUser
            }
        );
    } catch (error) {
        console.error("Error in onboard controller:", error);
        return res.status(500).json({message : "Internal Server Error", error : error.message});
    }
}