import { GetServerSidePropsContext } from 'next';
import nookies from 'nookies';

export function parseCookies(ctx?: GetServerSidePropsContext | null) {
  return nookies.get(ctx || undefined);
}
