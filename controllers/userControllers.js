const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User=require("../models/userModel");
const AppErr=require("../utils/appError");

//Đăng kí người dùng 
const signUp =catchAsync(async(req,res,next)=>{
    const {
        fullName,
        gender,
        dateOfBirth,
        email,
        phoneNumber,
        username,
        password,
        passwordConfirm
    }=req.body;

    const newUser= await User.create({
        fullName,
        gender,
        dateOfBirth,
        email,
        phoneNumber,
        username,
        password,
        passwordConfirm 
    });

    createSendToke(newUser,201,req,res);
});

//Đăng nhập
const signIn = catchAsync( async (req, res, next) =>{
    const {username,password}=req.body;

    //Check username và password
    if(!username || !password){
        return next(AppErr("Incorrect email or password",401));
    }

    const user=await User.findOne({
        $or:[{username:username},{email:username}],
    }).select("+password");

    if(!user ||!(await user.correctPassword(password,user.password))){
        return next(AppErr("Incorrect email or password",401));
    }

    createSendToken(user,200,req,res);
});

//Đăng xuất
const logout=(req,res)=>{
    res.cookie("jwt","LoggedOut",{
        exprires:new Date(Date.now()+10 *1000),
        httpOnly:true,
    });
    res.status(200).json({status:"Sucess"});
}

//Đặt lại mật khẩu
const resetPassword=catchAsync(async(req,res,next)=>{
    const hashedPassword= crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
    
    const user=User.findOne({
        passwordResetToken:hashedPassword,
        passwordResetExpires:{$gt:Date.now()},
    });

    if(!user){
        return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password= req.body.password;
    user.passwordConfirm= req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save();

    createSendToken(user,200,req,res);
})

//Quên mật khẩu bằng email 
const forgotPasswordByEmail=catchAsync(async (req,res,next) => {
    //Tìm email trong hệ thống
    const user= await User.findOne({email:req.body.email});
    
    if(!user){
        return next(new AppError("There is no user with email address",404));
    }
    
    //Tạo token ngẫu nhiên
    const resetToken=user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});

    const url=`${req.protocol}://${req.get(
        "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message=`Quên mật khẩu? Gửi yêu cầu PATCH với mật khẩu và mật khẩu mới của bạn Xác nhận với: ${resetURL}.\nNếu bạn không quên mật khẩu của mình, vui lòng bỏ qua email này!`;

    try {
        sendEmail({
            email:user.email,
            subject:'Mã thông báo đặt lại mật khẩu của bạn (có giá trị trong 10 phút)',
            message,
            resetToken,
        });

        res.statusCode(200).json({
            sucess:"success",
            data:{
                resetToken,
            }
        });
    } catch(e){
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save({validateBeforeSave:false});

        return next(
            new AppError("There was an error sending the email. Try again later!",500)
        );
    }

});

export default {signUp,signIn,logout,resetPassword,forgotPasswordByEmail};