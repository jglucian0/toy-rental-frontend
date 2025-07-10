import { RequestHandler } from "express";
import {
  TransactionRepository,
  CreateTransactionData,
  UpdateTransactionData,
} from "../models/Transaction";

/**
 * GET /api/transactions - Get all transactions
 */
export const getAllTransactions: RequestHandler = (req, res) => {
  try {
    const {
      type,
      category,
      status,
      startDate,
      endDate,
      clientId,
      partyId,
      includeRelated,
    } = req.query;

    const filters = {
      type: type as string,
      category: category as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string,
      clientId: clientId ? parseInt(clientId as string) : undefined,
      partyId: partyId ? parseInt(partyId as string) : undefined,
      includeRelated: includeRelated === "true",
    };

    const transactions = TransactionRepository.getAll(filters);

    res.json({
      success: true,
      data: transactions,
      total: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch transactions",
    });
  }
};

/**
 * GET /api/transactions/:id - Get transaction by ID
 */
export const getTransactionById: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid transaction ID",
      });
    }

    const includeRelated = req.query.includeRelated === "true";
    const transaction = TransactionRepository.getById(id, includeRelated);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch transaction",
    });
  }
};

/**
 * POST /api/transactions - Create new transaction
 */
export const createTransaction: RequestHandler = (req, res) => {
  try {
    const transactionData: CreateTransactionData = req.body;

    // Validation
    if (!transactionData.description?.trim()) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Transaction description is required",
      });
    }

    if (
      !transactionData.type ||
      !["income", "expense"].includes(transactionData.type)
    ) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Transaction type must be 'income' or 'expense'",
      });
    }

    if (transactionData.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Transaction amount must be positive",
      });
    }

    if (!transactionData.category?.trim()) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Transaction category is required",
      });
    }

    if (!transactionData.date) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Transaction date is required",
      });
    }

    // Date validation
    if (isNaN(Date.parse(transactionData.date))) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid date format",
      });
    }

    const newTransaction = TransactionRepository.create(transactionData);

    res.status(201).json({
      success: true,
      data: newTransaction,
      message: "Transaction created successfully",
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      success: false,
      error: "CREATE_ERROR",
      message: "Failed to create transaction",
    });
  }
};

/**
 * PUT /api/transactions/:id - Update transaction
 */
export const updateTransaction: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid transaction ID",
      });
    }

    const updateData: UpdateTransactionData = req.body;

    // Validation
    if (updateData.type && !["income", "expense"].includes(updateData.type)) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Transaction type must be 'income' or 'expense'",
      });
    }

    if (updateData.amount !== undefined && updateData.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Transaction amount must be positive",
      });
    }

    if (updateData.date && isNaN(Date.parse(updateData.date))) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid date format",
      });
    }

    const updatedTransaction = TransactionRepository.update(id, updateData);

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: updatedTransaction,
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({
      success: false,
      error: "UPDATE_ERROR",
      message: "Failed to update transaction",
    });
  }
};

/**
 * DELETE /api/transactions/:id - Delete transaction
 */
export const deleteTransaction: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid transaction ID",
      });
    }

    const success = TransactionRepository.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({
      success: false,
      error: "DELETE_ERROR",
      message: "Failed to delete transaction",
    });
  }
};

/**
 * GET /api/transactions/stats - Get financial statistics
 */
export const getTransactionStats: RequestHandler = (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const period = {
      startDate: startDate as string,
      endDate: endDate as string,
    };

    const stats = TransactionRepository.getStats(period);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    res.status(500).json({
      success: false,
      error: "STATS_ERROR",
      message: "Failed to fetch transaction statistics",
    });
  }
};

/**
 * GET /api/transactions/overdue - Get overdue transactions
 */
export const getOverdueTransactions: RequestHandler = (req, res) => {
  try {
    const transactions = TransactionRepository.getOverdue();

    res.json({
      success: true,
      data: transactions,
      total: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching overdue transactions:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch overdue transactions",
    });
  }
};

/**
 * GET /api/transactions/categories - Get all transaction categories
 */
export const getTransactionCategories: RequestHandler = (req, res) => {
  try {
    const categories = TransactionRepository.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching transaction categories:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch transaction categories",
    });
  }
};
