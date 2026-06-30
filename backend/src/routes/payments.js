import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createCheckoutSession, handleWebhook } from '../controllers/paymentController.js';

const router = Router();

// Webhook — raw body already parsed by express.raw() in app.js, no auth
router.post('/webhook', handleWebhook);

// Create Stripe Checkout Session — requires authenticated learner
router.post('/create-checkout-session', authenticate, createCheckoutSession);

export default router;
