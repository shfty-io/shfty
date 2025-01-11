import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { AddPaymentDialog } from "@/components/payment/AddPaymentDialog";

export default async function PaymentPage() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect('/auth/login');
  }

  // Fetch saved payment methods
  const { data: paymentMethods } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', user.id);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment Methods</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Payment Methods</h2>
            <AddPaymentDialog />
          </div>

          <div className="space-y-4">
            {paymentMethods?.length ? (
              paymentMethods.map((method) => (
                <div key={method.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-600">💳</span>
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• {method.last4}</p>
                      <p className="text-sm text-gray-500">Expires {method.exp_month}/{method.exp_year}</p>
                    </div>
                  </div>
                  <form action="/api/payment/remove" method="POST">
                    <input type="hidden" name="methodId" value={method.id} />
                    <button type="submit" className="text-red-600 hover:text-red-700">
                      Remove
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="border rounded-lg p-4">
                <p className="text-gray-500">No payment methods added yet</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Payment History</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">No recent transactions</p>
                  <p className="text-sm text-gray-500">Your payment history will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 