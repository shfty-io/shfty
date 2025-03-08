import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for our marketplace',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
        <p className="text-sm text-muted-foreground mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
            marketplace service. We respect your privacy and are committed to protecting your personal information.
          </p>
          <p className="mt-2">
            By accessing or using our marketplace, you consent to the collection, use, and disclosure of your information 
            as described in this Privacy Policy.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-medium mb-2">2.1 Personal Information</h3>
          <p>
            We may collect personally identifiable information, such as:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Billing and shipping address</li>
            <li>Payment information</li>
            <li>User profile information</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2 mt-4">2.2 Non-Personal Information</h3>
          <p>
            We may also collect non-personal information, such as:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Browser type</li>
            <li>IP address</li>
            <li>Device information</li>
            <li>Operating system</li>
            <li>Usage data and browsing patterns</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Collect Information</h2>
          <p>
            We collect information in the following ways:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>When you register an account</li>
            <li>When you complete forms on our marketplace</li>
            <li>When you make a purchase or sell an item</li>
            <li>When you communicate with us or other users</li>
            <li>When you visit our website, through cookies and similar technologies</li>
            <li>From third-party service providers</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Information</h2>
          <p>
            We may use your information for the following purposes:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>To provide and maintain our marketplace services</li>
            <li>To process and facilitate transactions</li>
            <li>To verify your identity and prevent fraud</li>
            <li>To communicate with you about your account, purchases, and listings</li>
            <li>To personalize your experience and deliver content and product offerings relevant to your interests</li>
            <li>To improve our website, products, and services</li>
            <li>To send marketing communications if you have opted in</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Information Sharing and Disclosure</h2>
          <p>
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Other users as necessary to facilitate transactions</li>
            <li>Service providers who perform services on our behalf</li>
            <li>Business partners with your consent</li>
            <li>Law enforcement or other governmental authorities in response to a legal request</li>
            <li>Third parties in connection with a merger, acquisition, or sale of our business</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal information to third parties.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies and Similar Technologies</h2>
          <p>
            We use cookies and similar technologies to collect information about your browsing activities and to
            improve your experience on our marketplace. You can manage your cookie preferences through your browser settings.
          </p>
          <p className="mt-2">
            We use the following types of cookies:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Essential cookies: necessary for the basic functions of our website</li>
            <li>Analytical cookies: help us understand how you use our website</li>
            <li>Functional cookies: remember your preferences</li>
            <li>Targeting cookies: record your visits to our website, the pages you visit, and the links you follow</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
            over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this
            Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer require
            your personal information, we will securely delete or anonymize it.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Your Rights</h2>
          <p>
            Depending on your location, you may have the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Right to access: request access to your personal information</li>
            <li>Right to rectification: request correction of inaccurate personal information</li>
            <li>Right to erasure: request deletion of your personal information</li>
            <li>Right to restrict processing: request restriction of processing of your personal information</li>
            <li>Right to data portability: receive your personal information in a structured, commonly used format</li>
            <li>Right to object: object to processing of your personal information</li>
            <li>Right to withdraw consent: withdraw consent at any time</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us using the information provided in Section 13.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Children&apos;s Privacy</h2>
          <p>
            Our marketplace is not intended for children under the age of 18. We do not knowingly collect personal
            information from children under 18. If you believe we have collected personal information from a child
            under 18, please contact us, and we will take steps to remove such information.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Third-Party Links</h2>
          <p>
            Our marketplace may contain links to third-party websites. We are not responsible for the privacy practices
            or content of these websites. We encourage you to read the privacy policies of these third-party sites before
            providing any information to them.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy
            Policy periodically for any changes.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p className="mt-2">
            Email: privacy@yourmarketplace.com<br />
            Address: [Your Company Address]
          </p>
        </section>
      </div>
    </div>
  );
} 