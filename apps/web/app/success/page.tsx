export default function SuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams?.orderId;
  return (
    <div className="py-10 max-w-lg mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Thank you for your order!</h1>
      {orderId && <p className="mb-2 text-sm">Your order ID is <strong>{orderId}</strong>.</p>}
      <p className="text-sm text-neutral-600 mb-4">A confirmation email will be sent shortly.</p>
      <a href="/account/orders" className="text-sm text-blue-600 hover:underline">
        View your orders
      </a>
    </div>
  );
}