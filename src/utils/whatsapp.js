/**
 * Generates a WhatsApp URL for contacting BlueShipment
 * @param {string} message - Optional custom message (default: standard message)
 * @returns {string} WhatsApp URL
 */
export function getWhatsAppUrl(message = null) {
  // WhatsApp nummer: +31 6 17818246 (formaat zonder + en spaties: 31617818246)
  const whatsappNumber = '31617818246';
  const defaultMessage = 'Hallo! Ik heb een vraag over BlueShipment.';
  const whatsappMessage = encodeURIComponent(message || defaultMessage);
  return `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
}

/**
 * Opens WhatsApp in a new tab/window
 * @param {string} message - Optional custom message
 */
export function openWhatsApp(message = null) {
  const url = getWhatsAppUrl(message);
  window.open(url, '_blank', 'noopener,noreferrer');
}

