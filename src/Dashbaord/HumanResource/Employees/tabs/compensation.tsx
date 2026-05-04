import React from "react";
import { useState } from "react";

const CompensationTab: React.FC = () => {

    const [formData, setFormData] = useState({
    
    // Step 3: Compensation & Benefits
    baseSalary: '',
    paymentFrequency: 'Monthly',
    bankName: '',
    bankAccountNumber: '',
    taxIdNumber: '',
    benefits: [] as string[],
    
  });

      const handleBenefitToggle = (benefit: string) => {
        setFormData((prev) => ({
          ...prev,
          benefits: prev.benefits.includes(benefit)
            ? prev.benefits.filter((b) => b !== benefit)
            : [...prev.benefits, benefit],
        }));
    };
      const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold mb-6">Compensation & Benefits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Base Salary (XAF)<span className="text-red-500"> *</span>
          </label>
          <input
            type="number"
            value={formData.baseSalary}
            onChange={(e) => handleInputChange("baseSalary", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Payment Frequency<span className="text-red-500">*</span>
          </label>
          <select
            value={formData.paymentFrequency}
            onChange={(e) =>
              handleInputChange("paymentFrequency", e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Monthly">Monthly</option>
            <option value="Biweekly">Biweekly</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Bank Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.bankName}
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Bank Account Number<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.bankAccountNumber}
            onChange={(e) =>
              handleInputChange("bankAccountNumber", e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Tax ID Number
          </label>
          <input
            type="text"
            value={formData.taxIdNumber}
            onChange={(e) => handleInputChange("taxIdNumber", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Benefits Entrolled<span className="text-red-500"> *</span>
        </label>
        <div className="space-y-3">
          {[
            "Health Insurance",
            "Pension",
            "Transport Allowance",
            "Housing Allowance",
          ].map((benefit) => (
            <label
              key={benefit}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.benefits.includes(benefit)}
                onChange={() => handleBenefitToggle(benefit)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{benefit}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompensationTab;
