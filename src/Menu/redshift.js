export default async function depositUsingRedShift(invoice) {
  window.redshift.setOptions({
    brandColor: "#3B3B98",
    brandImageUrl: "https://lightning-roulette.com/logo192.png"
  });
  window.redshift.open(invoice);
}
