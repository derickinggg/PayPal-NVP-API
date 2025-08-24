const express = require('express');
const router = express.Router();
const nvpService = require('../services/nvpService');

// Get account balance
router.get('/balance', async (req, res) => {
  try {
    const result = await nvpService.getBalance();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search transactions
router.post('/transaction-search', async (req, res) => {
  try {
    const { startDate, endDate, searchParams } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Start date and end date are required' 
      });
    }

    const result = await nvpService.transactionSearch(startDate, endDate, searchParams);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction details
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await nvpService.getTransactionDetails(transactionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Refund transaction
router.post('/refund', async (req, res) => {
  try {
    const { transactionId, amount, note } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction ID is required' 
      });
    }

    const result = await nvpService.refundTransaction(transactionId, amount, note);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get account information
router.get('/account-info', async (req, res) => {
  try {
    const result = await nvpService.getAccountInfo();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search transactions by date range
router.post('/search-by-date', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Start date and end date are required' 
      });
    }

    const result = await nvpService.searchTransactionsByDateRange(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;