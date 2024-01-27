const catchAsync = require("./catchAsync");

const protect =catchAsync(async (req,res,next) => {

    // Nhận token và kiểm tra nó 
    let token;
    if (req.headers.authorization && req.req.headers.authorization.startswith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt){
        token = req.cookies.jwt;
    }

    if(!token){
        return next(new AppError("You are not logged in! Please login in to get access.",401));
    }

    // Xác nhận token
    const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT
    );

    // Kiểm tra nguời dùng đã thoát chưa
    const checkUser=await User.findById(decoded.id);
    if(!checkUser) {
        return next(
            new AppError("User is logged out",401)
        );
    }
    //Kiểm tra xem người dùng có thay đổi mật khẩu sau khi mã thông báo được tạo hay không?
    if (checkUser.changedPasswordAfter(decoded.id)) {
        return next(AppError("User recently changed password! Please log in again.",401)
    );
    }

    // Cấp quyền truy cập
    req.user=checkUser;
    res.locals.user=checkUser;
    next();
});

//Cấp quyền dựa vào vào role
const restrictTo=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(
                new AppError("You do not have permission to perform this action", 403)
            );
        }

        next();
    }
}