import userModel from "../models/userModel.js"
import galleryModel from "../models/galleryModel.js"
import productModel from "../models/productModels.js"


// add products to user cart
const addToCart = async (req,res) => {
    try {

        const { userId, itemId, size, galleryDesignId } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        if (galleryDesignId) {
            const gallery = await galleryModel.findById(galleryDesignId);
            if (!gallery) return res.json({ success: false, message: "Gallery design not found" });
            const galleryItems = Array.isArray(cartData.__galleryItems) ? cartData.__galleryItems : [];
            const existing = galleryItems.find((item) => item.galleryDesignId === galleryDesignId);
            if (existing) existing.quantity += 1;
            else galleryItems.push({ galleryDesignId, productId: null, quantity: 1 });
            cartData.__galleryItems = galleryItems;
            await userModel.findByIdAndUpdate(userId, {cartData})
            return res.json({ success: true, message: "Design added to cart" });
        }

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            } else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] ={}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, {cartData})

        res.json({ success: true, message: "Added To Cart"})
        
    } catch (error) {
        res.json({ success: false, message: error.message})
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {

        const { userId ,itemId, size, quantity, galleryDesignId, productId } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        if (galleryDesignId) {
            const galleryItems = Array.isArray(cartData.__galleryItems) ? cartData.__galleryItems : [];
            const item = galleryItems.find((entry) => entry.galleryDesignId === galleryDesignId);
            if (!item) return res.json({ success: false, message: "Gallery design is not in the cart" });
            if (productId) {
                const product = await productModel.findById(productId);
                if (!product || product.comingSoon) {
                    return res.json({ success: false, message: "That product is not currently available" });
                }
            }
            item.productId = productId || null;
            item.quantity = Number(quantity);
            cartData.__galleryItems = galleryItems.filter((entry) => entry.quantity > 0);
            await userModel.findByIdAndUpdate(userId, {cartData})
            return res.json({ success: true, message: "Gallery cart item updated" });
        }

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Cart Updated" })
        
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// get user cart data
const getUserCart = async (req,res) => {
    try {
        
         const { userId } = req.body

         const userData = await userModel.findById(userId)
         let cartData = await userData.cartData;

         res.json({ success: true, cartData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
    
}

export { addToCart, updateCart, getUserCart }