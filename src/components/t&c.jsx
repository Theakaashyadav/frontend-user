// File: TermsAndConditions.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function TermsAndConditions() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 max-w-5xl mx-auto text-gray-800 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
      <h1 className="text-3xl md:text-4xl font-bold mb-5 text-center text-blue-700">
        Terms and Conditions
      </h1>
      <p className="mb-8 text-center text-xs text-gray-500">
        Last Updated: November 2025
      </p>

      <div className="space-y-5 text-justify leading-relaxed text-sm md:text-base">
        {/* 1 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">1. Introduction</h2>
          <p>
            Welcome to our Property Listing Platform (“we,” “our,” “us”). By
            accessing, browsing, or using any part of this platform, you agree
            to be legally bound by these Terms and Conditions (“Terms”) and all
            applicable laws. If you disagree with any part, you must immediately
            discontinue use of the Service.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use this platform. By creating
            an account, you represent that you have the full legal capacity to
            enter into binding agreements. Any false representation may result
            in suspension or permanent removal from our Service.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">3. Account Responsibilities</h2>
          <p>
            You are solely responsible for maintaining the confidentiality of
            your credentials and all activities under your account. We shall not
            be held liable for losses resulting from unauthorized access. You
            must immediately notify us of any suspected breach or unauthorized
            usage.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">4. Property Listings</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>All information provided must be accurate, current, and lawful.</li>
            <li>
              You agree not to post fraudulent, misleading, or defamatory
              listings.
            </li>
            <li>
              We reserve the right to review, modify, or remove listings that
              violate these Terms or applicable law.
            </li>
            <li>
              Listings may be monitored for quality assurance, moderation, or
              compliance purposes without prior notice.
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">5. Payments and Fees</h2>
          <p>
            Certain services may require payment. All payments are final unless
            explicitly stated otherwise. You acknowledge that we act solely as a
            service provider and are not responsible for disputes between users.
            Chargebacks, failed transactions, or payment fraud may result in
            account suspension and potential legal action.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">6. Prohibited Activities</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Uploading unlawful, threatening, or obscene content.</li>
            <li>Engaging in data scraping, hacking, or reverse engineering.</li>
            <li>Misusing system vulnerabilities to gain unauthorized access.</li>
            <li>Posting spam, duplications, or misleading advertisements.</li>
            <li>Attempting to manipulate or bypass our payment system.</li>
          </ul>
          <p className="mt-2">
            Violation of any of the above may result in permanent account
            termination and reporting to relevant authorities.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">7. Intellectual Property</h2>
          <p>
            All text, design, logos, graphics, and other materials are protected
            by copyright and trademark laws. Unauthorized use, modification, or
            redistribution without our written consent is strictly prohibited
            and may lead to legal consequences.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">8. Disclaimer and Limitation of Liability</h2>
          <p>
            The Service is provided “as is” and “as available” without warranty
            of any kind, express or implied. We do not guarantee uninterrupted
            access, accuracy of listings, or error-free functionality. Under no
            circumstance shall we be liable for any indirect, incidental, or
            consequential damages resulting from your use or inability to use
            the platform.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">9. Data Protection and Privacy</h2>
          <p>
            Your personal data will be handled in accordance with our{" "}
            <Link to="/privacy-policy" className="text-blue-500 underline hover:text-blue-700">
              Privacy Policy
            </Link>
            . We implement reasonable security measures, but you acknowledge
            that no system is fully secure. You agree that we are not liable for
            any unauthorized access or loss of data caused by external attacks,
            system errors, or third-party breaches.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">10. Third-Party Services</h2>
          <p>
            The platform may contain links to third-party websites or services
            not owned or controlled by us. We do not endorse or assume any
            responsibility for their content, policies, or actions. Any
            interactions with third parties are at your sole risk.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless our company, affiliates,
            employees, and partners from any claims, damages, or losses arising
            from your breach of these Terms, misuse of the platform, or
            violation of any law or third-party rights.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">12. Suspension and Termination</h2>
          <p>
            We reserve the right to restrict, suspend, or permanently terminate
            accounts that violate these Terms, misuse features, or engage in
            harmful, abusive, or fraudulent activities. We may do so without
            prior notice at our sole discretion.
          </p>
        </section>

        {/* 13 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">13. Force Majeure</h2>
          <p>
            We shall not be held liable for any delay or failure to perform due
            to events beyond our reasonable control, including but not limited
            to natural disasters, system failures, war, cyberattacks, or
            government restrictions.
          </p>
        </section>

        {/* 14 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">14. Governing Law and Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of India. All disputes shall be subject exclusively to the
            jurisdiction of courts located in your registered city or our
            principal place of operation, whichever we deem appropriate.
          </p>
        </section>

        {/* 15 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">15. Amendments</h2>
          <p>
            We may modify these Terms at any time without prior notice. You are
            responsible for reviewing the latest version. Continued use of the
            Service after updates constitutes your acceptance of the revised
            Terms.
          </p>
        </section>

        {/* 16 */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-blue-600">16. Contact Information</h2>
          <p>
            For queries, legal notices, or complaints, contact us at{" "}
            <a
              href="mailto:support@propertylistings.com"
              className="text-blue-500 underline hover:text-blue-700"
            >
              support@propertylistings.com
            </a>
            . We will make reasonable efforts to respond promptly.
          </p>
        </section>
      </div>

      <div className="mt-10">
        <Link
          to="/auth"
          className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm md:text-base hover:bg-blue-700 transition-all shadow-md"
        >
          Back to Sign Up
        </Link>
      </div>
    </div>
  );
}
