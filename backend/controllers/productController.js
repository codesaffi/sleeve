import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModels.js"
import path from 'path'
import PDFDocument from "pdfkit-table"

// funtion for add products
const addProduct = async (req,res) => {
    try {
        
        const { name, description, price, category, subCategory, sizes, bestseller, specifications, stock } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1,image2,image3,image4].filter((item)=> item !== undefined)

        // let imagesUrl = await Promise.all(
        //    images.map(async (item) => {
        //      let result = await cloudinary.uploader.upload(item.path,{resource_type:"image"});
        //      return result.secure_url
        //    })
        // )

        let imagesUrl = await Promise.all(
    images.map(async (item) => {
        const fullPath = path.resolve(item.path);

        try {
            const result = await cloudinary.uploader.upload(fullPath, {
                resource_type: "image"
            });

            return result.secure_url;
        } catch (error) {
            throw error;
        }
    })
);

        // Parse specifications — gracefully default to [] if not provided or invalid
        let parsedSpecifications = [];
        if (specifications) {
            try {
                parsedSpecifications = JSON.parse(specifications);
                // Filter out any rows where both name and value are empty
                parsedSpecifications = parsedSpecifications.filter(
                    (s) => s.name?.trim() || s.value?.trim()
                );
            } catch {
                parsedSpecifications = [];
            }
        }

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            stock: Number(stock) || 0,
            image: imagesUrl,
            date: Date.now(),
            specifications: parsedSpecifications
        }

        const product = new productModel(productData);
        await product.save()
        

        res.json({success:true,message:"Product Added"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }

}

// funtion for list products
const listProducts = async (req,res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

// funtion for remove products
const removeProduct = async (req,res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        res.json({success:false,message:error.message})
    }    
}

// funtion for single product info
const singleProduct = async (req,res) => {
    try {

        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})
        
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const editProductStock = async (req, res) => {
    try {
        const { id, stock } = req.body;
        if (Number(stock) < 0) {
            return res.json({ success: false, message: "Stock cannot be negative" });
        }
        await productModel.findByIdAndUpdate(id, { stock: Number(stock) });
        res.json({ success: true, message: "Stock Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const generateInventoryPDF = async (req, res) => {
    try {
        const products = await productModel.find({});

        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.pdf');
        
        doc.pipe(res);

        doc.fontSize(20).text("GEAR.", { align: 'center' });
        doc.fontSize(16).text("PRODUCT INVENTORY REPORT", { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated Date: ${new Date().toLocaleString()}`);
        doc.moveDown();

        const table = {
            headers: [
                { label: "Product Name", property: 'name', width: 150 },
                { label: "Category", property: 'category', width: 80 },
                { label: "Subcategory", property: 'subcategory', width: 80 },
                { label: "Price", property: 'price', width: 70 },
                { label: "Stock", property: 'stock', width: 50 },
                { label: "Status", property: 'status', width: 80 }
            ],
            datas: products.map(p => ({
                name: p.name,
                category: p.category,
                subcategory: p.subCategory,
                price: `Rs ${p.price}`,
                stock: (p.stock || 0).toString(),
                status: (p.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'
            }))
        };

        await doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: (row, indexColumn, indexRow, rectRow) => {
                doc.font("Helvetica").fontSize(10);
            },
        });

        const totalAvailable = products.reduce((acc, p) => acc + (p.stock || 0), 0);
        const outOfStock = products.filter(p => (p.stock || 0) === 0).length;

        doc.moveDown();
        doc.fontSize(12).font("Helvetica-Bold").text(`Total Products: ${products.length}`);
        doc.text(`Total Available Units: ${totalAvailable}`);
        doc.text(`Out-of-stock products: ${outOfStock}`);

        doc.end();

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export {addProduct,listProducts,removeProduct,singleProduct,editProductStock,generateInventoryPDF}