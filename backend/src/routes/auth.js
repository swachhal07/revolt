import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAdmin, signIn } from '../auth.js'
import { route } from '../errors.js'

const router = Router()

/**
 * Eight wrong answers per quarter hour, per address.
 *
 * `skipSuccessfulRequests` matters more than the number does: without it, an
 * editor saving all afternoon in a shared office eventually locks themselves and
 * everyone beside them out. Only failures count toward the limit, so the control
 * bites on guessing and is invisible to anyone who knows the password.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Wait fifteen minutes and try again.' },
})

router.post(
  '/login',
  loginLimiter,
  route(async (req, res) => {
    res.json(signIn(req.body?.password))
  }),
)

/**
 * Whether the token in hand is still good.
 *
 * The admin calls this on load so a session that expired overnight lands on the
 * sign-in screen rather than on a dashboard whose first save fails.
 */
router.get('/me', requireAdmin, (req, res) => {
  res.json({ role: req.auth.role })
})

export default router
