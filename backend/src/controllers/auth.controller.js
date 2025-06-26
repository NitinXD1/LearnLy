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
        const randomAvatar = `https://robohash.org/${idx}.png`

        const newUser = await User.create(
            {
                email,
                fullName,
                password,
                profilePic: randomAvatar,
            }
        )

        //creating user in stream

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