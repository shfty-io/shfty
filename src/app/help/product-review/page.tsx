'use client';

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function ProductReviewPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const requirements = [
    'Repository includes a README with setup instructions',
    'Repository includes database migration files (if applicable)',
    'Code follows best practices and is well-organized',
    'Product is fully functional and working as described',
    'All dependencies are properly documented',
    'No malicious or harmful code',
    'Product meets our quality standards',
    'Proper licensing information is included',
    'Sample data or demo is available (if applicable)',
    'Documentation is clear and comprehensive',
    'Product demo includes a backlink to your product page on our marketplace',
  ]

  const handleCheckChange = (index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Product Review Guidelines</h1>
        <p className="mt-2 text-muted-foreground">
          Everything you need to know about our product review process
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Manual Review Process</CardTitle>
          <CardDescription>
            Every listing on our marketplace goes through a thorough manual review process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            To ensure that all products listed on our marketplace meet our quality standards, every submission
            goes through a manual review process conducted by our team. This helps us maintain the integrity and 
            reliability of our platform for all users.
          </p>
          <p className="mb-4">
            The review process typically takes 2-3 business days from the time of submission. You&apos;ll receive 
            a notification once your product has been reviewed, whether it&apos;s been approved or needs adjustments.
          </p>
          <p>
            If your product does not meet our requirements, we&apos;ll provide specific feedback on what needs to be 
            improved before it can be listed on the marketplace.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements Checklist</CardTitle>
          <CardDescription>
            Check off each requirement as you complete it to track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {requirements.map((requirement, index) => (
              <li key={index} className="flex items-start gap-3">
                <Checkbox 
                  id={`requirement-${index}`} 
                  checked={checkedItems[index] || false}
                  onCheckedChange={() => handleCheckChange(index)}
                  className="mt-0.5"
                />
                <Label 
                  htmlFor={`requirement-${index}`}
                  className={`cursor-pointer ${checkedItems[index] ? 'line-through text-muted-foreground' : ''}`}
                >
                  {requirement}
                </Label>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-medium">Note:</p>
            <p>
              Meeting all requirements doesn&apos;t guarantee approval. Products must also align with our marketplace&apos;s
              values and quality standards. We reserve the right to reject any product that doesn&apos;t meet our criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 