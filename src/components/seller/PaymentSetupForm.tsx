"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentSetupFormProps {
  onSubmit: (data: PaymentSetupData) => void;
}

export interface PaymentSetupData {
  accountType: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  country: string;
  currency: string;
}

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  // Add more countries as needed
];

const currencies = [
  "USD",
  "CAD",
  "GBP",
  "AUD",
  "EUR",
  // Add more currencies as needed
];

export function PaymentSetupForm({ onSubmit }: PaymentSetupFormProps) {
  const [formData, setFormData] = useState<PaymentSetupData>({
    accountType: "",
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    country: "",
    currency: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="accountType">Account Type</Label>
          <Select
            value={formData.accountType}
            onValueChange={(value) => setFormData({ ...formData, accountType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="accountHolderName">Account Holder Name</Label>
          <Input
            id="accountHolderName"
            required
            value={formData.accountHolderName}
            onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
            placeholder="Enter account holder name"
          />
        </div>

        <div>
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            required
            type="password"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="Enter account number"
          />
        </div>

        <div>
          <Label htmlFor="routingNumber">Routing Number</Label>
          <Input
            id="routingNumber"
            required
            value={formData.routingNumber}
            onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
            placeholder="Enter routing number"
          />
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Select
            value={formData.country}
            onValueChange={(value) => setFormData({ ...formData, country: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country.toLowerCase()}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency.toLowerCase()}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full mt-6">
        Save Payment Information
      </Button>
    </form>
  );
} 