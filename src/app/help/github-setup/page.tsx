'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function GithubSetupPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">GitHub Setup Guide</h1>
        <p className="mt-2 text-muted-foreground">
          Learn how to properly set up your GitHub repository and token for marketplace integration
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Repository Requirements</CardTitle>
          <CardDescription>
            Make sure your repository meets these requirements before listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            To successfully list and sell your code on our marketplace, your GitHub repository needs to be properly configured.
            This involves ensuring your repository is properly structured and granting the appropriate access permissions.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Repository Selection</h3>
          <p className="mb-4">
            When selecting a repository to list on the marketplace, make sure it meets the following criteria:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Contains all necessary files for the product to work</li>
            <li>Has a clear README.md with setup and usage instructions</li>
            <li>Is well-organized with a logical directory structure</li>
            <li>Contains appropriate license information</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Setting Up GitHub Personal Access Token</CardTitle>
          <CardDescription>
            You need a personal access token with the &apos;repo&apos; scope for full repository access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Your GitHub Personal Access Token must have the &apos;repo&apos; scope to work properly with our marketplace.
            </AlertDescription>
          </Alert>
          
          <h3 className="text-lg font-semibold mb-3">Steps to Create a Personal Access Token</h3>
          
          <ol className="list-decimal pl-6 mb-6 space-y-4">
            <li>
              <p><strong>Go to GitHub Settings:</strong> Click on your profile picture in the top right, then select &quot;Settings&quot;</p>
            </li>
            <li>
              <p><strong>Developer Settings:</strong> Scroll down and select &quot;Developer settings&quot; from the left sidebar</p>
            </li>
            <li>
              <p><strong>Personal Access Tokens:</strong> Select &quot;Personal access tokens&quot; then &quot;Tokens (classic)&quot;</p>
            </li>
            <li>
              <p><strong>Generate New Token:</strong> Click &quot;Generate new token&quot; and select &quot;Generate new token (classic)&quot;</p>
            </li>
            <li>
              <p><strong>Name Your Token:</strong> Give your token a descriptive name (e.g., &quot;Marketplace Access&quot;)</p>
            </li>
            <li>
              <p><strong>Select Scopes:</strong> Check the &quot;repo&quot; checkbox to grant full access to repositories</p>
              
              <div className="my-6 border rounded-lg overflow-hidden">
                <Image 
                  src="/github/github_token.png" 
                  alt="GitHub Token Scopes" 
                  width={800} 
                  height={400} 
                  className="w-full object-contain"
                />
                <p className="p-3 text-sm bg-muted text-center">Step 1: Confirm all repo-related permissions are selected</p>
              </div>
              
              <div className="my-6 border rounded-lg overflow-hidden">
                <Image 
                  src="/github/github_repo.png" 
                  alt="Required repo scope selection" 
                  width={800} 
                  height={400} 
                  className="w-full object-contain"
                />
                <p className="p-3 text-sm bg-muted text-center">Step 2: Select the &quot;repo&quot; scope checkbox as shown here</p>
              </div>
            </li>
            <li>
              <p><strong>Set Expiration:</strong> We <em>strongly recommend</em> selecting <strong>&quot;No expiration&quot;</strong> for your token to ensure uninterrupted repository access for your buyers</p>
              
              <div className="my-6 border rounded-lg overflow-hidden">
                <Image 
                  src="/github/github_token_expiration.png" 
                  alt="GitHub Token Expiration Setting" 
                  width={800} 
                  height={400} 
                  className="w-full object-contain"
                />
                <p className="p-3 text-sm bg-muted text-center">Set &quot;No expiration&quot; to prevent token expiration issues</p>
              </div>
              
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  If you set an expiration date, your token will expire after that date, and buyers will lose access to your repositories. 
                  Our system will notify you when your token expires, but it&apos;s best to use a token with no expiration to avoid interruptions.
                </AlertDescription>
              </Alert>
            </li>
            <li>
              <p><strong>Generate Token:</strong> Scroll down and click the &quot;Generate token&quot; button</p>
            </li>
            <li>
              <p><strong>Copy Your Token:</strong> Copy the generated token immediately (you won&apos;t be able to see it again)</p>
            </li>
          </ol>
          
          <p className="mb-4">
            Once you&apos;ve generated your token, paste it in the GitHub Token field in your seller settings. This token allows
            our marketplace to manage repository access for users who purchase your product.
          </p>
          
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> We recommend setting an expiration date for your token. If your token expires, 
            you&apos;ll need to generate a new one and update it in your settings.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>
            Common issues and their solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-3">Common Problems</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Invalid Token Error</h4>
              <p className="text-muted-foreground">
                If you receive an &quot;Invalid GitHub token&quot; error, ensure your token hasn&apos;t expired and has the correct &apos;repo&apos; scope.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Repository Not Found</h4>
              <p className="text-muted-foreground">
                Make sure you&apos;ve entered the correct repository URL and that the repository exists in your GitHub account.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Permission Issues</h4>
              <p className="text-muted-foreground">
                If buyers report they cannot access your repository, check that your token hasn&apos;t expired and still has the necessary permissions.
              </p>
            </div>
          </div>
          
          <p className="mt-6">
            For additional help, please contact our support team via the <Link href="/" className="text-primary hover:underline">contact form</Link> or open a support ticket.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 