function generateOrderNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

function generateKOTNumber(orderNumber) {
  return `KOT-${orderNumber}`;
}

function generateStaffNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `STF-${timestamp}-${random}`.toUpperCase();
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function calculateTax(subtotal, taxRate = 0.18) {
  return subtotal * taxRate;
}

function paginate(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return { limit, offset };
}

module.exports = {
  generateOrderNumber,
  generateKOTNumber,
  generateStaffNumber,
  calculateDistance,
  formatCurrency,
  calculateTax,
  paginate
};
