import userModel from "../models/userModel.js"
import galleryModel from "../models/galleryModel.js"
import productModel from "../models/productModels.js"
import { randomUUID } from "node:crypto"
import { calculatePosterPrice, isPosterProduct, validatePosterDesignBatch, validateUniqueGalleryDesignAssignments } from "../utils/posterPricing.js"

const normalizePosterBatch = async (batch) => {
    const product = await productModel.findById(batch?.productId)
    if (!product || product.comingSoon || !isPosterProduct(product)) {
        throw new Error("The selected poster product is not currently available.")
    }

    const validationError = validatePosterDesignBatch(product, batch.posterQuantity, batch.designs)
    if (validationError) throw new Error(validationError)
    if (batch.designCount !== undefined && Number(batch.designCount) !== batch.designs.length) {
        throw new Error("The design count does not match the selected designs.")
    }

    const galleryIds = batch.designs
        .filter((design) => design?.type === "gallery")
        .map((design) => design.galleryDesignId)
    const galleryRecords = galleryIds.length
        ? await galleryModel.find({ _id: { $in: galleryIds } }).select("title image").lean()
        : []
    const galleryById = new Map(galleryRecords.map((gallery) => [gallery._id.toString(), gallery]))

    const designs = batch.designs.map((design) => {
        if (design?.type === "gallery") {
            const gallery = galleryById.get(String(design.galleryDesignId))
            if (!gallery) throw new Error("One of the selected gallery designs no longer exists.")
            return {
                type: "gallery",
                galleryDesignId: gallery._id.toString(),
                title: gallery.title,
                imageUrl: gallery.image,
            }
        }
        if (design?.type !== "upload" || typeof design.imageUrl !== "string") {
            throw new Error("Each poster requires a valid uploaded or gallery design.")
        }
        let imageUrl
        try {
            imageUrl = new URL(design.imageUrl)
        } catch {
            throw new Error("Each uploaded design must have a valid image URL.")
        }
        if (imageUrl.protocol !== "https:" || !(imageUrl.hostname === "cloudinary.com" || imageUrl.hostname.endsWith(".cloudinary.com"))) {
            throw new Error("Uploaded designs must use a secure Cloudinary image URL.")
        }
        return { type: "upload", imageUrl: imageUrl.toString() }
    })

    calculatePosterPrice(product, batch.posterQuantity)
    return {
        batchId: typeof batch.batchId === "string" && batch.batchId ? batch.batchId : randomUUID(),
        productId: product._id.toString(),
        size: batch.size || "Default",
        posterQuantity: Number(batch.posterQuantity),
        designCount: designs.length,
        designs,
    }
}


// add products to user cart
const addToCart = async (req,res) => {
    try {

        const { userId, itemId, size, galleryDesignId, posterQuantity, posterBatch, posterBatches: requestedPosterBatches } = req.body

        const userData = await userModel.findById(userId).select("cartData")
        if (!userData) return res.status(404).json({ success: false, message: "User not found." })
        let cartData = await userData.cartData;

        if (requestedPosterBatches) {
            if (!Array.isArray(requestedPosterBatches) || requestedPosterBatches.length < 2) {
                return res.json({ success: false, message: "A poster split must include at least two poster batches." })
            }
            const normalizedBatches = []
            for (const batch of requestedPosterBatches) {
                normalizedBatches.push(await normalizePosterBatch(batch))
            }
            if (new Set(normalizedBatches.map((batch) => batch.productId)).size !== normalizedBatches.length) {
                return res.json({ success: false, message: "A split must use a different poster product for each group." })
            }
            const assignmentError = validateUniqueGalleryDesignAssignments(normalizedBatches)
            if (assignmentError) return res.json({ success: false, message: assignmentError })
            const posterBatchCart = Array.isArray(cartData.__posterBatches) ? cartData.__posterBatches : []
            const cartAssignmentError = validateUniqueGalleryDesignAssignments([...posterBatchCart, ...normalizedBatches])
            if (cartAssignmentError) return res.json({ success: false, message: cartAssignmentError })
            cartData.__posterBatches = [...posterBatchCart, ...normalizedBatches]
            await userModel.findByIdAndUpdate(userId, { cartData })
            return res.json({ success: true, message: "Poster batches added to cart.", posterBatches: normalizedBatches })
        }

        if (posterBatch) {
            const normalizedBatch = await normalizePosterBatch(posterBatch)
            const posterBatches = Array.isArray(cartData.__posterBatches) ? cartData.__posterBatches : []
            const assignmentError = validateUniqueGalleryDesignAssignments([...posterBatches, normalizedBatch])
            if (assignmentError) return res.json({ success: false, message: assignmentError })
            posterBatches.push(normalizedBatch)
            cartData.__posterBatches = posterBatches
            await userModel.findByIdAndUpdate(userId, { cartData })
            return res.json({ success: true, message: "Poster batch added to cart.", posterBatch: normalizedBatch })
        }

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

        const product = await productModel.findById(itemId)
        if (!product || product.comingSoon) return res.json({ success: false, message: "Product is not currently available." })
        let optionKey = size || "Default"
        if (isPosterProduct(product)) {
            const selectedQuantity = Number(posterQuantity)
            calculatePosterPrice(product, selectedQuantity)
            optionKey = optionKey.includes("|poster::")
                ? optionKey.replace(/\|poster::\d+/, `|poster::${selectedQuantity}`)
                : `${optionKey}|poster::${selectedQuantity}`
        }

        if (cartData[itemId]) {
            if (cartData[itemId][optionKey]) {
                cartData[itemId][optionKey] += 1
            } else {
                cartData[itemId][optionKey] = 1
            }
        } else {
            cartData[itemId] ={}
            cartData[itemId][optionKey] = 1
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

        const { userId ,itemId, size, quantity, galleryDesignId, productId, posterBatchId } = req.body

        const userData = await userModel.findById(userId).select("cartData")
        if (!userData) return res.status(404).json({ success: false, message: "User not found." })
        let cartData = await userData.cartData;

        if (posterBatchId) {
            const posterBatches = Array.isArray(cartData.__posterBatches) ? cartData.__posterBatches : []
            const remainingBatches = posterBatches.filter((batch) => batch.batchId !== posterBatchId)
            if (remainingBatches.length === posterBatches.length) {
                return res.json({ success: false, message: "Poster batch is not in the cart." })
            }
            cartData.__posterBatches = remainingBatches
            await userModel.findByIdAndUpdate(userId, { cartData })
            return res.json({ success: true, message: "Poster batch removed from cart." })
        }

        if (galleryDesignId) {
            const galleryItems = Array.isArray(cartData.__galleryItems) ? cartData.__galleryItems : [];
            const item = galleryItems.find((entry) => entry.galleryDesignId === galleryDesignId);
            if (!item) return res.json({ success: false, message: "Gallery design is not in the cart" });
            if (productId) {
                const product = await productModel.findById(productId);
                if (!product || product.comingSoon) {
                    return res.json({ success: false, message: "That product is not currently available" });
                }
                const selectedQuantity = Number(quantity)
                if (!Number.isInteger(selectedQuantity) || selectedQuantity < 0) {
                    return res.json({ success: false, message: "Invalid quantity." })
                }
                if (isPosterProduct(product) && selectedQuantity > 0) calculatePosterPrice(product, selectedQuantity)
            } else if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
                return res.json({ success: false, message: "Invalid quantity." })
            }
            item.productId = productId || null;
            item.quantity = Number(quantity);
            cartData.__galleryItems = galleryItems.filter((entry) => entry.quantity > 0);
            await userModel.findByIdAndUpdate(userId, {cartData})
            return res.json({ success: true, message: "Gallery cart item updated" });
        }

        if (!cartData[itemId]) return res.json({ success: false, message: "Cart item not found." })
        const product = await productModel.findById(itemId)
        if (!product) return res.json({ success: false, message: "Product not found." })
        const posterMarker = typeof size === "string" ? size.match(/\|poster::(\d+)/) : null
        if (posterMarker && isPosterProduct(product) && Number(quantity) > 0) {
            const newPosterQuantity = Number(req.body.posterQuantity)
            calculatePosterPrice(product, newPosterQuantity)
            const existingCount = cartData[itemId][size]
            if (!existingCount) return res.json({ success: false, message: "Cart item not found." })
            delete cartData[itemId][size]
            const updatedSize = size.replace(/\|poster::\d+/, `|poster::${newPosterQuantity}`)
            cartData[itemId][updatedSize] = (cartData[itemId][updatedSize] || 0) + existingCount
        } else {
            if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
                return res.json({ success: false, message: "Invalid quantity." })
            }
            cartData[itemId][size] = Number(quantity)
            if (Number(quantity) === 0) delete cartData[itemId][size]
        }
        if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId]

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

         const userData = await userModel.findById(userId).select("cartData").lean()
         if (!userData) return res.status(404).json({ success: false, message: "User not found." })
         let cartData = await userData.cartData;

         res.json({ success: true, cartData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
    
}

export { addToCart, updateCart, getUserCart }