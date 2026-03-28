const express = require('express');
const { getDepartments, createDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getDepartments)
  .post(protect, admin, createDepartment);

router.route('/:id')
  .delete(protect, admin, deleteDepartment);

module.exports = router;
