import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for our marketplace',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
        <p className="text-sm text-muted-foreground mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our marketplace services, you agree to be bound by these Terms of Service 
            (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our services.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use our services. By using our services, you represent and 
            warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information. You are 
            responsible for safeguarding your account credentials and for all activities that occur under your account.
          </p>
          <p className="mt-2">
            We reserve the right to disable any user account if we believe you have violated these Terms.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Marketplace Rules</h2>
          <p>
            As a user of our marketplace, you agree to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Provide accurate information about products or services you list</li>
            <li>Honor transactions made through our platform</li>
            <li>Not engage in fraudulent, deceptive, or manipulative behavior</li>
            <li>Not list prohibited items or services</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Items and Activities</h2>
          <p>
            The following items and activities are prohibited on our marketplace:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Illegal goods or services</li>
            <li>Harmful or dangerous items</li>
            <li>Counterfeit goods</li>
            <li>Adult content or services</li>
            <li>Weapons, firearms, ammunition, and related items</li>
            <li>Drugs, controlled substances, and drug paraphernalia</li>
            <li>Items that promote hate, violence, or discrimination</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Fees and Payments</h2>
          <p>
            We may charge fees for certain services provided through our marketplace. All fees are non-refundable 
            unless otherwise specified. We reserve the right to change our fees at any time with prior notice.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
          <p>
            Our marketplace content, including but not limited to text, graphics, logos, and software, is protected 
            by copyright, trademark, and other intellectual property laws. You may not use, reproduce, or distribute 
            our content without our permission.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. User Content</h2>
          <p>
            By submitting content to our marketplace, you grant us a worldwide, non-exclusive, royalty-free license 
            to use, reproduce, modify, adapt, publish, and display such content for the purpose of providing our services.
          </p>
          <p className="mt-2">
            You represent and warrant that you own or have the necessary rights to the content you submit, and that 
            your content does not infringe upon any third-party rights.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WE, OUR AFFILIATES, EMPLOYEES, AGENTS, PARTNERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES (EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), RESULTING FROM: (I) YOUR USE OR INABILITY TO USE THE SERVICE; (II) ANY CHANGES TO THE SERVICE; (III) ANY PRODUCTS, SERVICES, INFORMATION OR MATERIAL PURCHASED OR OBTAINED FROM OTHER USERS OR THIRD PARTIES THROUGH THE SERVICE; (IV) UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA; (V) STATEMENTS OR CONDUCT OF ANY THIRD PARTY ON THE SERVICE; OR (VI) ANY OTHER MATTER RELATING TO THE SERVICE.
          </p>
          <p className="mt-2">
            THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
          <p>
            YOU EXPRESSLY UNDERSTAND AND AGREE THAT YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. WE DO NOT WARRANT THAT THE SERVICE WILL MEET YOUR REQUIREMENTS OR THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE. WE MAKE NO WARRANTY REGARDING THE QUALITY, ACCURACY, TIMELINESS, TRUTHFULNESS, COMPLETENESS OR RELIABILITY OF ANY CONTENT AVAILABLE THROUGH THE SERVICE.
          </p>
          <p className="mt-2">
            YOU ARE SOLELY RESPONSIBLE FOR ALL OF YOUR COMMUNICATIONS AND INTERACTIONS WITH OTHER USERS OF THE SERVICE AND WITH OTHER PERSONS WITH WHOM YOU COMMUNICATE OR INTERACT AS A RESULT OF YOUR USE OF THE SERVICE. YOU UNDERSTAND THAT WE DO NOT SCREEN OR INQUIRE INTO THE BACKGROUND OF ANY USERS OF THE SERVICE, NOR DO WE MAKE ANY ATTEMPT TO VERIFY THE STATEMENTS OF USERS OF THE SERVICE. WE MAKE NO REPRESENTATIONS OR WARRANTIES AS TO THE CONDUCT OF USERS OF THE SERVICE OR THEIR COMPATIBILITY WITH ANY CURRENT OR FUTURE USERS OF THE SERVICE.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless our company, its affiliates, officers, directors, 
            employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising 
            out of or in any way connected with your access to or use of our services or your violation of these Terms.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
            our company is registered, without regard to its conflict of law provisions.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of significant changes by 
            posting the updated Terms on our website. Your continued use of our services after such changes constitutes 
            your acceptance of the new Terms.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@shfty.io.
          </p>
        </section>
      </div>
    </div>
  );
} 