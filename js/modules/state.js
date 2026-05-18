export const state = {
  currency: 'INR'
};

export function fmtINR(n) { return '₹' + n.toLocaleString('en-IN'); }
export function fmtUSD(n) { return '$' + n.toLocaleString('en-US'); }

export function fmtPrice(service, currency) {
  return currency === 'USD' ? fmtUSD(service.usd.price) : fmtINR(service.inr.price);
}
export function priceMeta(service, currency) {
  return currency === 'USD' ? service.usd.meta : service.inr.meta;
}
export function priceLbl(service, currency) {
  return currency === 'USD' ? service.usd.lbl : service.inr.lbl;
}
export function gateway(currency) {
  return currency === 'USD' ? 'PayPal' : 'Razorpay';
}
