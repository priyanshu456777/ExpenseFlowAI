const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const sanitizeRequest = require('./middleware/sanitize');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const insightRoutes = require('./routes/insightRoutes');
const adminRoutes = require('./routes/adminRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const activityRoutes = require('./routes/activityRoutes');

const { globalErrorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Trust the first proxy (needed for correct client IPs / secure cookies behind Render/Railway/Nginx).
app.set('trust proxy', 1);

// ---------- Security middleware ----------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

const globalLimiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});
app.use('/api', globalLimiter);

// ---------- Body & cookie parsing ----------
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ---------- Data sanitization ----------
app.use(mongoSanitize()); // Prevents NoSQL injection (strips $ and . from req data)
app.use(sanitizeRequest); // Cleans user input from malicious HTML/JS

// ---------- Logging ----------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ---------- Static uploads ----------
app.use('/uploads', express.static('uploads'));

// ---------- Health check ----------
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ExpenseFlow AI API is healthy.', timestamp: new Date() });
});

// ---------- API routes ----------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/settlements', settlementRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/insights', insightRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/activity', activityRoutes);

// ---------- 404 + Global error handler ----------
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;