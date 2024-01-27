const jwt=require('jsonwebtoken');
const User=require('../models/userModel');

const signToken=(id)=>{
    return jwt.sign({id},process.env.JWT,{
        expiresIn: process.env.JWR_EXP,
    });
};

const createSendToken=(user,statusCode,req,res)=>{
    const token = signToken(user.id);
    const cookieOptions={
        expires: new Date(
            Date.now()+ process.env.COOKIE_EXPRES*24*60*60*1000),
            httpOnly:true
    };
    if(process.env.NODE_ENV=="production") cookieOptions.secure=true;

    res.cookie("jwt",token,cookieOptions);

    user.password=undefined;

    res.status(statusCode).json({
        status:"Success",
        token,
        data:{
            user,
        }
    });
};
export default {signToken,createSendToken};