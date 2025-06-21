const Table = require('../models/Table');

// Lấy tất cả các bàn
const getAllTables = async (req, res) => {
    try {
        const tables = await Table.find()
            .populate('currentReservation')
            .sort({ tableNumber: 1 }); // Sắp xếp theo số bàn tăng dần

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách bàn thành công',
            count: tables.length,
            tables: tables
        });
    } catch (err) {
        console.error(`getAllTables error: ${err.message}`);
        res.status(500).json({ 
            success: false, 
            message: `Lỗi máy chủ: ${err.message}` 
        });
    }
};

// Lấy bàn theo ID
const getTableById = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await Table.findById(id).populate('currentReservation');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin bàn thành công',
            table: table
        });
    } catch (err) {
        console.error(`getTableById error: ${err.message}`);
        res.status(500).json({ 
            success: false, 
            message: `Lỗi máy chủ: ${err.message}` 
        });
    }
};

// Tạo bàn mới
const createTable = async (req, res) => {
    try {
        const { tableNumber, capacity, status = true } = req.body;

        // Kiểm tra xem số bàn đã tồn tại chưa
        const existingTable = await Table.findOne({ tableNumber });
        if (existingTable) {
            return res.status(400).json({
                success: false,
                message: 'Số bàn đã tồn tại'
            });
        }

        const newTable = new Table({
            tableNumber,
            capacity,
            status
        });

        const savedTable = await newTable.save();

        res.status(201).json({
            success: true,
            message: 'Tạo bàn mới thành công',
            table: savedTable
        });
    } catch (err) {
        console.error(`createTable error: ${err.message}`);
        res.status(500).json({ 
            success: false, 
            message: `Lỗi máy chủ: ${err.message}` 
        });
    }
};

// Cập nhật thông tin bàn
const updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Nếu cập nhật số bàn, kiểm tra xem số bàn mới có trùng không
        if (updateData.tableNumber) {
            const existingTable = await Table.findOne({ 
                tableNumber: updateData.tableNumber,
                _id: { $ne: id }
            });
            if (existingTable) {
                return res.status(400).json({
                    success: false,
                    message: 'Số bàn đã tồn tại'
                });
            }
        }

        const updatedTable = await Table.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedTable) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật bàn thành công',
            table: updatedTable
        });
    } catch (err) {
        console.error(`updateTable error: ${err.message}`);
        res.status(500).json({ 
            success: false, 
            message: `Lỗi máy chủ: ${err.message}` 
        });
    }
};

// Xóa bàn
const deleteTable = async (req, res) => {
    try {
        const { id } = req.params;

        const table = await Table.findById(id);
        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn'
            });
        }

        // Kiểm tra xem bàn có đang được đặt không
        if (table.currentReservation && table.currentReservation.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa bàn đang có đặt chỗ'
            });
        }

        await Table.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Xóa bàn thành công'
        });
    } catch (err) {
        console.error(`deleteTable error: ${err.message}`);
        res.status(500).json({ 
            success: false, 
            message: `Lỗi máy chủ: ${err.message}` 
        });
    }
};

// Lấy các bàn có sức chứa phù hợp
const getTablesByCapacity = async (req, res) => {
    try {
        const { minCapacity, maxCapacity } = req.query;

        let query = {};
        if (minCapacity) {
            query.capacity = { $gte: parseInt(minCapacity) };
        }
        if (maxCapacity) {
            query.capacity = { ...query.capacity, $lte: parseInt(maxCapacity) };
        }

        const tables = await Table.find(query)
            .sort({ capacity: 1, tableNumber: 1 });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách bàn theo sức chứa thành công',
            count: tables.length,
            tables: tables
        });
    } catch (err) {
        console.error(`getTablesByCapacity error: ${err.message}`);
        res.status(500).json({ 
            success: false, 
            message: `Lỗi máy chủ: ${err.message}` 
        });
    }
};

// Lấy các bàn đang hoạt động (status = true)
const getActiveTables = async (req, res) => {
    try {
        const tables = await Table.find({ status: true })
            .sort({ tableNumber: 1 });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách bàn đang hoạt động thành công',
            count: tables.length,
            tables: tables
        });
    } catch (err) {
        console.error(`getActiveTables error: ${err.message}`);
        res.status(500).json({ 
            success: false, 
            message: `Lỗi máy chủ: ${err.message}` 
        });
    }
};

module.exports = {
    getAllTables,
    
};
