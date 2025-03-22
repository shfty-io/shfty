'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LicensesHelpPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Understanding Software Licenses</h1>
        <p className="mt-2 text-muted-foreground">
          A guide to help you choose the right license for your product
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Why Software Licenses Matter</CardTitle>
          <CardDescription>
            Software licenses define how others can use, modify, and share your work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            When you create and sell digital products, the license you choose determines what buyers can legally do with your work.
            Selecting the appropriate license is crucial for both protecting your rights as a creator and setting clear expectations for your customers.
          </p>
          
          <p className="mb-4">
            This guide explains the common software licenses available on our marketplace in simple terms, helping you understand:
          </p>
          
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>What rights you&apos;re granting to buyers</li>
            <li>Whether users need to credit you when using your work</li>
            <li>If modifications to your work must be shared under the same license</li>
            <li>Whether your work can be used in commercial projects</li>
            <li>How the license affects the pricing of your product</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>License Types</CardTitle>
          <CardDescription>
            Explore different license options and what they mean for you and your buyers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open-source" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="open-source">Open Source</TabsTrigger>
              <TabsTrigger value="creative-commons">Creative Commons</TabsTrigger>
            </TabsList>
            
            <TabsContent value="open-source" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">MIT License</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;You can use it however you want, just keep the creator&apos;s name on it.&quot;
                  </p>
                </div>
                <p className="mb-2">The MIT License is one of the most permissive and simple licenses. It:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Allows anyone to use, copy, modify, merge, publish, distribute, or sell the software</li>
                  <li>Only requires that the original copyright notice and permission notice be included</li>
                  <li>Does not require sharing modifications under the same license</li>
                  <li>Provides very limited liability protection for the creator</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Projects where you want maximum adoption and don&apos;t mind if others use your code in closed-source projects.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">GNU General Public License (GPL-3.0)</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;If you change it, you must share your changes with everyone.&quot;
                  </p>
                </div>
                <p className="mb-2">The GPL is a &quot;copyleft&quot; license that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Allows users to use, study, share, and modify the software</li>
                  <li>Requires that any modified versions must also be open-source under the GPL</li>
                  <li>Ensures that derivatives of your work remain free and open-source</li>
                  <li>Requires providing source code when distributing the software</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Projects where you want to ensure all derivatives remain open and available to the community.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Apache License 2.0</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;You can use it freely but must say who made it first.&quot;
                  </p>
                </div>
                <p className="mb-2">The Apache License is a permissive license that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Allows users to use, modify, and distribute the code in any way</li>
                  <li>Requires preservation of copyright and license notices</li>
                  <li>Provides an express grant of patent rights from contributors</li>
                  <li>Does not require that modifications be shared under the same license</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Projects where you want to be permissive while protecting contributors from patent litigation.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">BSD Licenses (3-Clause and 2-Clause)</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;You can use it if you keep the creator&apos;s name with it. 2-Clause has fewer rules than 3-Clause.&quot;
                  </p>
                </div>
                <p className="mb-2">The BSD licenses are permissive licenses that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Allow redistribution and use in both source and binary forms</li>
                  <li>Require including the original copyright notice</li>
                  <li>The 3-Clause version prohibits using the name of the creator to endorse derived products</li>
                  <li>The 2-Clause version removes this endorsement clause, making it simpler</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Projects where you want minimal restrictions while still requiring attribution.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">GNU Lesser General Public License (LGPL-3.0)</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;You can use it with your own stuff, but changes to this must be shared.&quot;
                  </p>
                </div>
                <p className="mb-2">The LGPL is a compromise between GPL and permissive licenses that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Allows the software to be linked to by non-GPL applications, even proprietary ones</li>
                  <li>Requires that modifications to the LGPL code itself be shared under LGPL</li>
                  <li>Does not require applications that link to it to be released under the same license</li>
                  <li>Provides a middle ground for library authors</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Libraries and frameworks that you want to be used widely, including in commercial software.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Mozilla Public License 2.0 (MPL-2.0)</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;You can mix it with your own code, but must share any fixes to this part.&quot;
                  </p>
                </div>
                <p className="mb-2">The MPL is a &quot;file-level copyleft&quot; license that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Requires that modifications to MPL-licensed files be shared under MPL</li>
                  <li>Allows these files to be combined with files under other licenses, including proprietary ones</li>
                  <li>Grants patent rights similar to Apache License</li>
                  <li>Offers a middle ground between permissive and strong copyleft licenses</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Projects where you want to ensure modifications to your code are shared, while allowing integration with proprietary software.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">GNU Affero General Public License (AGPL-3.0)</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;You must share all your changes, even when used on websites.&quot;
                  </p>
                </div>
                <p className="mb-2">The AGPL is a stronger version of the GPL that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Closes the &quot;network service&quot; loophole in the GPL</li>
                  <li>Requires making source code available when the software is used over a network (like a web app)</li>
                  <li>Ensures that modifications remain open even when the software is not distributed but used as a service</li>
                  <li>Provides the strongest protections for keeping modifications open</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Web applications and network services where you want to ensure all modifications remain open, even when the software is hosted rather than distributed.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">The Unlicense</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;Anyone can use it for anything, like a gift to everyone.&quot;
                  </p>
                </div>
                <p className="mb-2">The Unlicense is a public domain dedication that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Places the work in the public domain, waiving all copyright rights</li>
                  <li>Allows anyone to use the work for any purpose with no restrictions</li>
                  <li>Does not require attribution or any other conditions</li>
                  <li>Provides a simple alternative to permissive licenses</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Projects where you want to completely renounce all copyright interests and allow unrestricted use.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Proprietary License</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;You can only use it how the owner says you can.&quot;
                  </p>
                </div>
                <p className="mb-2">A proprietary license:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Reserves all rights not explicitly granted to the user</li>
                  <li>Typically restricts copying, modification, and redistribution</li>
                  <li>May limit use to specific purposes or number of users</li>
                  <li>Allows you to set custom terms for how your software can be used</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Commercial software where you want to retain full control over your intellectual property and how it&apos;s used.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="creative-commons" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Creative Commons Zero (CC0-1.0)</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;Free for anyone to use for anything.&quot;
                  </p>
                </div>
                <p className="mb-2">CC0 is a public domain dedication that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Waives all copyright and related rights worldwide</li>
                  <li>Allows anyone to use the work for any purpose without restrictions</li>
                  <li>Does not require attribution</li>
                  <li>Is the Creative Commons equivalent of the Unlicense</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Works where you want to completely waive all rights and place them in the public domain.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Creative Commons Attribution (CC-BY-4.0)</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;You can use it but must say who made it.&quot;
                  </p>
                </div>
                <p className="mb-2">CC-BY is a permissive license that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Allows sharing, adapting, and redistributing the work for any purpose</li>
                  <li>Requires attribution to the original creator</li>
                  <li>Does not restrict commercial use</li>
                  <li>Does not require sharing modifications under the same license</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Creative works where you want maximum distribution while ensuring you receive credit.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Creative Commons Attribution-ShareAlike (CC-BY-SA-4.0)</h3>
                <div className="bg-muted p-4 rounded mb-4">
                  <p className="text-sm italic">
                    &quot;You can use it if you give credit and share your work too.&quot;
                  </p>
                </div>
                <p className="mb-2">CC-BY-SA is a copyleft license that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-1">
                  <li>Allows sharing, adapting, and redistributing the work for any purpose</li>
                  <li>Requires attribution to the original creator</li>
                  <li>Requires adaptations to be distributed under the same license</li>
                  <li>Ensures that derivative works remain open and under the same terms</li>
                </ul>
                <p className="mb-2">
                  <strong>Best for:</strong> Creative works where you want to ensure derivatives remain open while still allowing commercial use.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 p-4 bg-muted rounded">
            <h3 className="font-semibold mb-2">Need more help?</h3>
            <p className="text-sm mb-4">
              If you&apos;re still unsure which license is right for your product, consider consulting with a legal professional who specializes in intellectual property law.
            </p>
            <p className="text-sm">
              This guide provides simplified explanations and does not constitute legal advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 