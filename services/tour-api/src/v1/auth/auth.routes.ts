import { Router, type Request, type Response } from 'express';
import { handle, ok } from '../../lib/http';
import { clearRefreshCookie, REFRESH_COOKIE, setRefreshCookie } from '../../lib/tokens';
import { googleLimit, loginLimit, otpSendLimit, otpVerifyLimit, passwordResetLimit, refreshLimit, registerLimit, resetSubmitLimit } from '../../middleware/limits';
import { accountService } from './account.service';
import { requireAuth } from '../../middleware/requireAuth';
import { input, validate } from '../../middleware/validate';
import { forgotSchema, googleSchema, loginSchema, otpSendSchema, otpVerifySchema, refreshSchema, registerSchema, resetSchema, type LoginInput, type RegisterInput } from './auth.schemas';
import type { z } from 'zod';
import { authService, type Session } from './auth.service';

const router = Router();

const isNative = (req: Request) => req.get('X-Client') === 'native';

/** Web gets the refresh token as an httpOnly cookie; native apps get it in the body for secure storage. */
export function sendSession(req: Request, res: Response, s: Session, status = 200) {
  setRefreshCookie(res, s.refreshToken, s.refreshExpires);
  return ok(
    res,
    {
      user: s.user,
      accessToken: s.accessToken,
      isNewUser: s.isNewUser,
      ...(isNative(req) ? { refreshToken: s.refreshToken } : {}),
    },
    undefined,
    status
  );
}

const presentedRefresh = (req: Request) => (req.cookies?.[REFRESH_COOKIE] as string | undefined) ?? req.body?.refreshToken;

router.post(
  '/register',
  registerLimit,
  validate({ body: registerSchema }),
  handle(async (req, res) => sendSession(req, res, await authService.register(input<RegisterInput>(res).body), 201))
);

router.post(
  '/login',
  loginLimit,
  validate({ body: loginSchema }),
  handle(async (req, res) => sendSession(req, res, await authService.login(input<LoginInput>(res).body)))
);

// ── Mobile number (OTP) ─────────────────────────────────────────
router.post(
  '/otp/send',
  otpSendLimit,
  validate({ body: otpSendSchema }),
  handle(async (_req, res) => {
    const { phone, channel } = input<z.infer<typeof otpSendSchema>>(res).body;
    return ok(res, await accountService.sendOtp(phone, channel));
  })
);

router.post(
  '/otp/verify',
  otpVerifyLimit,
  validate({ body: otpVerifySchema }),
  handle(async (req, res) => {
    const { phone, code } = input<z.infer<typeof otpVerifySchema>>(res).body;
    return sendSession(req, res, await accountService.verifyOtp(phone, code));
  })
);

// ── Google ──────────────────────────────────────────────────────
router.post(
  '/google',
  googleLimit,
  validate({ body: googleSchema }),
  handle(async (req, res) => sendSession(req, res, await accountService.google(input<z.infer<typeof googleSchema>>(res).body.idToken)))
);

// ── Password reset ──────────────────────────────────────────────
router.post(
  '/password/forgot',
  passwordResetLimit,
  validate({ body: forgotSchema }),
  handle(async (_req, res) => ok(res, await accountService.forgotPassword(input<z.infer<typeof forgotSchema>>(res).body.email)))
);

router.post(
  '/password/reset',
  resetSubmitLimit,
  validate({ body: resetSchema }),
  handle(async (_req, res) => {
    const { token, password } = input<z.infer<typeof resetSchema>>(res).body;
    return ok(res, await accountService.resetPassword(token, password));
  })
);

router.post(
  '/refresh',
  refreshLimit,
  validate({ body: refreshSchema }),
  handle(async (req, res) => {
    try {
      return sendSession(req, res, await authService.refresh(presentedRefresh(req)));
    } catch (err) {
      clearRefreshCookie(res);
      throw err;
    }
  })
);

router.post(
  '/logout',
  requireAuth,
  handle(async (req, res) => {
    await authService.logout(presentedRefresh(req));
    clearRefreshCookie(res);
    return ok(res, { loggedOut: true });
  })
);

export default router;
