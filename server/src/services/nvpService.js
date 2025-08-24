const axios = require('axios');
const querystring = require('querystring');

class NVPService {
  constructor() {
    this.baseURL = 'https://rerdo_api1.payad.top';
    this.username = 'H9H35M54ALED75WJ';
    this.password = 'AYI572AYIuWdtKNe7cM-pVZQ-tuHAo5JWh-RoUXMPS79ukhYTojpJ8Fh';
    this.signature = 'AYI572AYIuWdtKNe7cM-pVZQ-tuHAo5JWh-RoUXMPS79ukhYTojpJ8Fh';
  }

  async makeRequest(method, params = {}) {
    try {
      const requestData = {
        USER: this.username,
        PWD: this.password,
        SIGNATURE: this.signature,
        METHOD: method,
        VERSION: '124.0',
        ...params
      };

      const response = await axios.post(this.baseURL, querystring.stringify(requestData), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000
      });

      return {
        success: true,
        data: response.data,
        parsedData: querystring.parse(response.data),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getBalance() {
    return await this.makeRequest('GetBalance');
  }

  async transactionSearch(startDate, endDate, searchParams = {}) {
    const params = {
      STARTDATE: startDate,
      ENDDATE: endDate,
      ...searchParams
    };
    return await this.makeRequest('TransactionSearch', params);
  }

  async getTransactionDetails(transactionId) {
    return await this.makeRequest('GetTransactionDetails', {
      TRANSACTIONID: transactionId
    });
  }

  async refundTransaction(transactionId, amount, note = '') {
    const params = {
      TRANSACTIONID: transactionId,
      REFUNDTYPE: 'Full'
    };

    if (amount) {
      params.REFUNDTYPE = 'Partial';
      params.AMT = amount;
    }

    if (note) {
      params.NOTE = note;
    }

    return await this.makeRequest('RefundTransaction', params);
  }

  async getTransactionHistory(transactionId) {
    return await this.makeRequest('GetTransactionDetails', {
      TRANSACTIONID: transactionId
    });
  }

  async searchTransactionsByDateRange(startDate, endDate) {
    return await this.makeRequest('TransactionSearch', {
      STARTDATE: startDate,
      ENDDATE: endDate
    });
  }

  async getAccountInfo() {
    return await this.makeRequest('GetPalDetails');
  }
}

module.exports = new NVPService();