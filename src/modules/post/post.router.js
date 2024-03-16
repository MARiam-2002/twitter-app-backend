import { Router } from "express";
import * as Validators from "./post.validation.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as postController from "./postController/post.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post('/',isAuthenticated, fileUpload(filterObject.image).fields([
    { name: "subImages", maxCount: 3 },
    { name: "defaultImage", maxCount: 1 },

]), postController.addPost)
router.post('/likedHandler', postController.likeHandler)




export default router;
