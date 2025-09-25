import express from "express";

import salesRepRoute from './salesRepRoute'
import salesRepActivityRoute from './salesRepActivityRoute'
import salesRepComplaintRoute from './salesRepComplaintRoute'
import salesRepHomeRoute from './salesRepHomeRoute'
import salesRepProductRoute from './salesRepProductRoute'
import salesRepProfileRoute from './salesRepProfileRoute'
import salesRepShopOwnerRoute from './salesRepShopOwnerRoute'





require('dotenv').config();
const router = express.Router();



router.use("/salesRep", salesRepRoute);
router.use("/salesRep", salesRepActivityRoute);
router.use("/salesRep", salesRepComplaintRoute);
router.use("/salesRep", salesRepHomeRoute);
router.use("/salesRep", salesRepProductRoute);
router.use("/salesRep", salesRepProfileRoute);
router.use("/salesRep", salesRepShopOwnerRoute);




export default router;

