# NVP API Dashboard

A comprehensive, real-time dashboard for monitoring and interacting with PayPal NVP (Name-Value Pair) API endpoints. This dashboard provides real-time monitoring, logging, and management of key NVP API operations.

## Features

### 🔑 Key API Operations
- **GetBalance** - View account balance and financial information
- **TransactionSearch** - Search transactions by date range and filters
- **GetTransactionDetails** - Get detailed information about specific transactions
- **RefundTransaction** - Process full or partial refunds

### 📊 Real-Time Dashboard
- **Live Statistics** - Real-time API usage metrics and performance indicators
- **WebSocket Integration** - Instant updates for all API operations
- **Comprehensive Logging** - Track all API requests, responses, and errors
- **Performance Monitoring** - Response time tracking and success rate analysis

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Tabbed Interface** - Organized sections for different operations
- **Real-time Updates** - Live status indicators and connection monitoring
- **Export Functionality** - Download transaction data and logs as CSV

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nvp-api-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Configure API credentials**
   
   The dashboard is pre-configured with your NVP API credentials:
   - **API Endpoint**: `https://rerdo_api1.payad.top`
   - **Username**: `H9H35M54ALED75WJ`
   - **Password**: `AYI572AYIuWdtKNe7cM-pVZQ-tuHAo5JWh-RoUXMPS79ukhYTojpJ8Fh`
   - **Signature**: `AYI572AYIuWdtKNe7cM-pVZQ-tuHAo5JWh-RoUXMPS79ukhYTojpJ8Fh`

4. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   
   # Or start them separately:
   npm run server    # Backend server
   npm run client    # Frontend dashboard
   ```

5. **Access the dashboard**
   
   Open your browser and navigate to:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000

## Dashboard Sections

### 📈 Overview Tab
- **Statistics Overview** - Real-time API usage metrics
- **Quick Actions** - Direct access to common operations
- **System Status** - Connection health and performance indicators

### 💰 Balance Tab
- **Account Balance** - Current available balance
- **Balance Details** - Pending, hold, and total balances
- **API Status** - Response status and correlation IDs
- **Auto-refresh** - Manual and automatic balance updates

### 🔍 Search Tab
- **Date Range Selection** - Flexible start and end date pickers
- **Advanced Filters** - Transaction ID, email, status, and amount
- **Search Results** - Paginated transaction listings
- **Export Functionality** - Download results as CSV

### 📋 Transactions Tab
- **Transaction Listings** - Search results with key details
- **Quick Actions** - View details, process refunds
- **Status Indicators** - Visual status representation
- **Responsive Grid** - Optimized for all screen sizes

### 📄 Details Tab
- **Transaction Information** - Complete transaction details
- **Payer Information** - Customer details and contact info
- **Payment Breakdown** - Subtotal, tax, shipping, and totals
- **Raw API Response** - Complete NVP response data

### 💸 Refund Tab
- **Refund Processing** - Full and partial refund options
- **Amount Validation** - Automatic amount verification
- **Note Support** - Add refund reason and notes
- **Status Tracking** - Real-time refund processing status

### 📊 Logs Tab
- **Real-time Logging** - Live API request/response monitoring
- **Advanced Filtering** - By type, status, and search terms
- **Performance Metrics** - Response time and duration tracking
- **Export Capabilities** - Download logs for analysis

## API Endpoints

### Backend Routes
- `GET /api/nvp/balance` - Get account balance
- `POST /api/nvp/transaction-search` - Search transactions
- `GET /api/nvp/transaction/:id` - Get transaction details
- `POST /api/nvp/refund` - Process refunds
- `GET /api/nvp/account-info` - Get account information

### WebSocket Events
- `CONNECTION_ESTABLISHED` - Connection status updates
- `STATS_UPDATE` - Real-time statistics
- `LOGS_UPDATE` - Live log updates
- `NEW_LOG` - Individual log entries

## Configuration

### Environment Variables
```bash
# Server configuration
NODE_ENV=development
PORT=3000

# NVP API credentials (pre-configured)
NVP_BASE_URL=https://rerdo_api1.payad.top
NVP_USERNAME=H9H35M54ALED75WJ
NVP_PASSWORD=AYI572AYIuWdtKNe7cM-pVZQ-tuHAo5JWh-RoUXMPS79ukhYTojpJ8Fh
NVP_SIGNATURE=AYI572AYIuWdtKNe7cM-pVZQ-tuHAo5JWh-RoUXMPS79ukhYTojpJ8Fh
```

### Customization
- **API Endpoints**: Modify `server/src/services/nvpService.js`
- **UI Components**: Customize React components in `client/src/components/`
- **Styling**: Update Tailwind configuration in `client/tailwind.config.js`
- **Logging**: Configure log retention in `server/src/services/loggingService.js`

## Development

### Project Structure
```
├── server/                 # Backend server
│   ├── src/
│   │   ├── services/      # NVP API service
│   │   ├── routes/        # API endpoints
│   │   └── index.js       # Server entry point
│   └── package.json
├── client/                 # Frontend dashboard
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.jsx        # Main application
│   └── package.json
└── package.json            # Root configuration
```

### Available Scripts
```bash
# Development
npm run dev          # Start both servers
npm run server       # Start backend only
npm run client       # Start frontend only

# Production
npm run build        # Build frontend
npm start           # Start production server
```

### Adding New Features
1. **New API Endpoints**: Add routes in `server/src/routes/`
2. **New Components**: Create React components in `client/src/components/`
3. **New Services**: Extend services in `server/src/services/`
4. **Styling**: Use Tailwind CSS classes or extend the configuration

## Troubleshooting

### Common Issues

**WebSocket Connection Failed**
- Check if the server is running on the correct port
- Verify firewall settings
- Check browser console for connection errors

**API Calls Failing**
- Verify NVP API credentials are correct
- Check network connectivity to the API endpoint
- Review server logs for detailed error information

**Dashboard Not Loading**
- Ensure both client and server are running
- Check browser console for JavaScript errors
- Verify all dependencies are installed

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
DEBUG=nvp:*
```

## Security Considerations

- **API Credentials**: Stored securely in environment variables
- **HTTPS**: Use HTTPS in production for secure communication
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Input Validation**: Comprehensive input sanitization and validation
- **Session Management**: Secure session handling with iron-session

## Performance

- **Real-time Updates**: WebSocket-based live updates
- **Efficient Logging**: Configurable log retention and filtering
- **Response Caching**: Built-in caching for API responses
- **Optimized Queries**: Efficient database queries and data processing

## Support

For technical support or feature requests:
- Check the logs tab for detailed error information
- Review the browser console for client-side errors
- Check server logs for backend issues
- Verify API endpoint connectivity and credentials

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This dashboard is pre-configured with your NVP API credentials. Ensure these credentials are kept secure and not shared publicly.