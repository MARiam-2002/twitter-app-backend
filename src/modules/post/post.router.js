import { Router } from "express";
import * as Validators from "./post.validation.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as postController from "./postController/post.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post('/',postController.addPost)




export default router;
