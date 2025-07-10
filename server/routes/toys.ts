import { RequestHandler } from "express";
import { ToyRepository, CreateToyData, UpdateToyData } from "../models/Toy";

/**
 * GET /api/toys - Get all toys
 */
export const getAllToys: RequestHandler = (req, res) => {
  try {
    const { status, category, search } = req.query;

    const filters = {
      status: status as string,
      category: category as string,
      search: search as string,
    };

    const toys = ToyRepository.getAll(filters);

    res.json({
      success: true,
      data: toys,
      total: toys.length,
    });
  } catch (error) {
    console.error("Error fetching toys:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch toys",
    });
  }
};

/**
 * GET /api/toys/:id - Get toy by ID
 */
export const getToyById: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid toy ID",
      });
    }

    const toy = ToyRepository.getById(id);

    if (!toy) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Toy not found",
      });
    }

    res.json({
      success: true,
      data: toy,
    });
  } catch (error) {
    console.error("Error fetching toy:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch toy",
    });
  }
};

/**
 * POST /api/toys - Create new toy
 */
export const createToy: RequestHandler = (req, res) => {
  try {
    const toyData: CreateToyData = req.body;

    // Validation
    if (!toyData.name?.trim()) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Toy name is required",
      });
    }

    if (!toyData.category?.trim()) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Toy category is required",
      });
    }

    if (toyData.daily_rate < 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Daily rate must be positive",
      });
    }

    if (toyData.value <= 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Toy value must be greater than zero",
      });
    }

    if (toyData.total_quantity < 1) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Total quantity must be at least 1",
      });
    }

    if (toyData.available_quantity < 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Available quantity cannot be negative",
      });
    }

    if (toyData.available_quantity > toyData.total_quantity) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Available quantity cannot exceed total quantity",
      });
    }

    if (toyData.purchase_price !== undefined && toyData.purchase_price < 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Purchase price must be positive",
      });
    }

    const newToy = ToyRepository.create(toyData);

    res.status(201).json({
      success: true,
      data: newToy,
      message: "Toy created successfully",
    });
  } catch (error) {
    console.error("Error creating toy:", error);
    res.status(500).json({
      success: false,
      error: "CREATE_ERROR",
      message: "Failed to create toy",
    });
  }
};

/**
 * PUT /api/toys/:id - Update toy
 */
export const updateToy: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid toy ID",
      });
    }

    const updateData: UpdateToyData = req.body;

    // Validation
    if (updateData.daily_rate !== undefined && updateData.daily_rate < 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Daily rate must be positive",
      });
    }

    if (
      updateData.purchase_price !== undefined &&
      updateData.purchase_price < 0
    ) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Purchase price must be positive",
      });
    }

    const updatedToy = ToyRepository.update(id, updateData);

    if (!updatedToy) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Toy not found",
      });
    }

    res.json({
      success: true,
      data: updatedToy,
      message: "Toy updated successfully",
    });
  } catch (error) {
    console.error("Error updating toy:", error);
    res.status(500).json({
      success: false,
      error: "UPDATE_ERROR",
      message: "Failed to update toy",
    });
  }
};

/**
 * DELETE /api/toys/:id - Delete toy
 */
export const deleteToy: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid toy ID",
      });
    }

    const success = ToyRepository.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Toy not found",
      });
    }

    res.json({
      success: true,
      message: "Toy deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting toy:", error);
    res.status(500).json({
      success: false,
      error: "DELETE_ERROR",
      message: "Failed to delete toy",
    });
  }
};

/**
 * GET /api/toys/stats - Get toy statistics
 */
export const getToyStats: RequestHandler = (req, res) => {
  try {
    const stats = ToyRepository.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching toy stats:", error);
    res.status(500).json({
      success: false,
      error: "STATS_ERROR",
      message: "Failed to fetch toy statistics",
    });
  }
};

/**
 * GET /api/toys/maintenance - Get toys needing maintenance
 */
export const getToysNeedingMaintenance: RequestHandler = (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days as string) || 7;
    const toys = ToyRepository.getNeedingMaintenance(daysAhead);

    res.json({
      success: true,
      data: toys,
      total: toys.length,
    });
  } catch (error) {
    console.error("Error fetching toys needing maintenance:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch toys needing maintenance",
    });
  }
};

/**
 * GET /api/toys/available - Get available toys for date range
 */
export const getAvailableToys: RequestHandler = (req, res) => {
  try {
    const { startDate, endDate, date } = req.query;

    // If single date is provided, use it for both start and end
    if (date && !startDate && !endDate) {
      const toys = ToyRepository.getAvailableForDateRange(
        date as string,
        date as string,
      );

      return res.json({
        success: true,
        data: toys,
        total: toys.length,
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message:
          "Start date and end date are required (or single date parameter)",
      });
    }

    const toys = ToyRepository.getAvailableForDateRange(
      startDate as string,
      endDate as string,
    );

    res.json({
      success: true,
      data: toys,
      total: toys.length,
    });
  } catch (error) {
    console.error("Error fetching available toys:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch available toys",
    });
  }
};
