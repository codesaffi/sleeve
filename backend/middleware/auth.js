import jwt from 'jsonwebtoken'

// const authUser = async (req, res, next) => {

//     const {token} = req.header;

//     if (!token) {
//         return res.json({ success: false, message: "Not Authorized Login Again"})
//     }

//     try {

//         const token_decode = jwt.verify(token, process.env.JWT_SECRET)
//         req.body.userId = token_decode.id
//         next()

//     } catch (error) {
//         res.json({ success: false, message: error.message })
//     }
// }


const authUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({ success: false, message: "Not Authorized, please log in again" });
    }

    const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer'
    
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id; // Attach userId to the request body
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export default authUser