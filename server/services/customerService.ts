import Customer from '../models/Customer';

export const trackCustomerOrder = async (
  buyerName: string,
  buyerWa: string,
  buyerEmail: string | undefined,
  orderId: any,
  refCode: string,
  amount: number
) => {
  try {
    let customer = await Customer.findOne({ phone: buyerWa });
    if (!customer) {
      customer = new Customer({
        name: buyerName,
        phone: buyerWa,
        email: buyerEmail,
        totalOrders: 1,
        totalSpent: 0, // Not accumulated yet
        lastOrderDate: new Date(),
        orderHistory: [{ orderId, refCode, amount, date: new Date() }]
      });
    } else {
      customer.name = buyerName;
      if (buyerEmail) customer.email = buyerEmail;
      customer.totalOrders += 1;
      customer.lastOrderDate = new Date();
      customer.orderHistory.push({ orderId, refCode, amount, date: new Date() });
    }
    await customer.save();
  } catch (error) {
    console.error('Error tracking customer:', error);
  }
};

export const accumulateCustomerSpent = async (buyerWa: string, amount: number) => {
  try {
    await Customer.updateOne(
      { phone: buyerWa },
      { $inc: { totalSpent: amount } }
    );
  } catch (error) {
    console.error('Error accumulating customer spent:', error);
  }
};
