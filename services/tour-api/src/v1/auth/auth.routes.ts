import { Router, type Request, type Response } from 'express';
import { handle, ok } from '../../lib/http';
import { clearRefreshCookie, REFRESH_COOKIE, setRefreshCookie } from '../../lib/tokens';
import { loginLimit, refreshLimit, registerLimit } from '../../middleware/limits';
import { requireAuth } from '../../middleware/requireAuth';
import { input, validate } from '../../middleware/validate';
import { loginSchema, refreshSchema, registerSchema, type LoginInput, type RegisterInput } from './auth.schemas';
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
