import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret) throw new Error('Missing JWT_SECRET');
  if (!expiresIn || isNaN(+expiresIn)) throw new Error('Invalid JWT_EXPIRES_IN');

  return {
    secret,
    signOptions: { expiresIn: +expiresIn },
  };
});
