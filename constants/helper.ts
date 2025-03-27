// constants/helper.ts
import * as z from "zod";

// Sightengine Models List
const SIGHTENGINE_MODELS_LIST = [
  "nudity.sexual_activity",
  "nudity.sexual_display",
  "nudity.erotica",
  "nudity.art",
  "nudity.sextoy",
  "nudity.bikini",
  "nudity.swimwear_one_piece",
  "nudity.schematic",
  "nudity.other",
  "firearm.real.threat",
  "firearm.real.aiming_at_camera",
  "firearm.real.aiming_safe",
  "firearm.real.in_hand_not_aiming",
  "firearm.real.worn_not_in_hand",
  "firearm.real.not_worn",
  "knife",
  "gore.very_bloody",
  "gore.slightly_bloody",
  "gore.serious_injury",
  "gore.superficial_injury",
  "gore.corpse",
  "gore.body_organ",
  "gore.unconscious",
  "gore.body_waste",
  "violence.physical",
  "violence.firearm_threat",
  "violence.combat_sport",
  "selfharm.real",
  "selfharm.fake",
  "selfharm.animated",
  "hate.nazi",
  "hate.asian_swastika",
  "hate.terrorist",
  "hate.supremacist",
  "hate.confederate",
  "hate.middle_finger",
  "recreational_drug.hard",
  "recreational_drug.cannabis_drug",
  "recreational_drug.cannabis_plant",
  "recreational_drug.cannabis_logo",
  "alcohol",
  "tobacco.regular",
  "tobacco.ambiguous",
  "gambling",
  "destruction.building_major_damage",
  "destruction.building_minor_damage",
  "destruction.building_on_fire",
  "destruction.building_burned",
  "destruction.vehicle_major_damage",
  "destruction.vehicle_minor_damage",
  "destruction.vehicle_on_fire",
  "destruction.vehicle_burned",
  "destruction.wildfire",
  "destruction.unsafe_fire",
  "destruction.violent_protest",
  "military.profile_photo",
  "text.profanity",
  "text.extremism",
  "text.drug",
  "text.weapon",
  "text.email",
  "text.phone",
  "text.link",
  "text.link.adult",
  "text.link.unsafe",
  "text.link.gambling",
  "text.embedded",
  "qr.adult",
  "qr.unsafe",
  "qr.gambling",
  "face.child",
];
// Export the list as an array and as a joined string
export const sightengineModelsArray = SIGHTENGINE_MODELS_LIST;
export const sightengineModelsString = SIGHTENGINE_MODELS_LIST.join(",");


export const reportReasons = [
  "Nudity",
  "Pornography",
  "Violence",
  "Hate Speech",
  "Harassment",
  "Spam",
  "Other",
];

// Reaction mapping
export const reactionMap: { [key: string]: string } = {
  Like: "💖",
  "100": "💯",
  Laugh: "😂",
  Sad: "😢",
  Fire: "🔥",
};

export const faqData = [
  {
    question: "What Is Challenz?",
    answer:
      "Challenz is a social media app designed around fun and creative challenges. Users can participate in dance, singing, joke-telling, pick-up line, and other exciting challenges, engage with the community, and showcase their talents.",
  },
  {
    question: "How Does Challenz Work?",
    answer:
      "Users can join or create challenges, submit videos, and interact with other participants by liking, commenting, and voting. ",
    // Views, likes, and comments automatically translate into votes, contributing to the participant's overall score and determining the challenge's virality.
  },
  {
    question: "How Do I Create an Account?",
    answer:
      "You can sign up using your email. Simply download the app, follow the registration process, and set up your profile.",
  },
  // {
  //   question: "What Are Uwaci Coins?",
  //   answer:
  //     "Uwaci Coins are the in-app virtual currency that users earn by winning challenges, engaging with content, and referring friends. They can be used to purchase virtual gifts, unlock premium features, and get discounts at partner shops.",
  // },
];

export const termsOfServiceText = `
Last updated: November 25, 2024

Welcome to Challenz. Please read these Terms of Service ("Terms") carefully before using the Challenz platform (the “Platform”) operated by MegaBliss LTD, with its registered address at 30A Sunnymead Road, Glen Innes, Auckland 1072, New Zealand (“Challenz,” “we,” “us,” or “our”). These Terms govern your access to and use of the Platform, including any content, functionality, and services offered on or through the Platform.

1. Acceptance of Terms
By accessing or using the Platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree with these Terms, you must not use the Platform.

2. Eligibility
You must be at least 13 years old (or the minimum age required in your jurisdiction) to use the Platform. By agreeing to these Terms, you represent and warrant that you meet the eligibility requirements.

3. Account Registration
Account Creation:
To access certain features of the Platform, you may need to create an account by providing accurate and complete information, including a valid email address, username, and password.
Responsibility:
You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.

4. User Conduct
You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:
Violate any applicable laws or regulations.
Infringe upon the intellectual property rights of others.
Transmit any content that is unlawful, harmful, defamatory, obscene, or otherwise objectionable.
Engage in any form of harassment or bullying.
Attempt to disrupt or interfere with the security or functionality of the Platform.
Use automated means to access the Platform for any purpose without our express written permission.

5. Content Ownership and Licensing
User Content: You retain ownership of any content you create and upload to the Platform ("User Content"). By uploading User Content, you grant Challenz a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content in connection with the Platform and Challenz's business operations.

Challenz Content: All content provided by Challenz on the Platform, including text, graphics, logos, images, and software, is the property of Challenz or its licensors and is protected by intellectual property laws. You may not use, reproduce, or distribute any Challenz content without prior written permission from Challenz.

6. Termination
We reserve the right to terminate or suspend your access to the Platform immediately, without prior notice or liability, for any reason, including if you breach these Terms.
Upon termination, your right to use the Platform will cease immediately. If you wish to terminate your account, you may do so through your account settings.

7. Disclaimers
The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. Challenz disclaims all warranties, whether express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
Challenz does not warrant that the Platform will be uninterrupted, secure, or free from errors.
Challenz is not responsible for any content posted by users or third parties and does not endorse any user-generated content.

8. Limitation of Liability
In no event shall Challenz, its directors, employees, partners, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
Your access to or use of or inability to access or use the Platform;
Any conduct or content of any third party on the Platform;
Any content obtained from the Platform;
Unauthorized access, use, or alteration of your transmissions or content.
In no event shall Challenz's total liability to you for all claims exceed the amount you have paid to Challenz, if any, in the last twelve (12) months.

9. Indemnification
You agree to defend, indemnify, and hold harmless Challenz and its affiliates, licensors, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising out of or relating to your violation of these Terms or your use of the Platform, including any User Content submitted by you.

10. Governing Law
These Terms shall be governed and construed in accordance with the laws of New Zealand, without regard to its conflict of law provisions.

11. Dispute Resolution
Any disputes arising out of or related to these Terms or the Platform shall be resolved through binding arbitration in Auckland, New Zealand, under the rules of the New Zealand Arbitration Association. The decision of the arbitrator shall be final and binding.

12. Changes to Terms
We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least thirty (30) days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
By continuing to access or use the Platform after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Platform.

13. Severability
If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. The invalid or unenforceable provision will be replaced by a valid and enforceable provision that most closely matches the intent of the original provision.

14. Entire Agreement
These Terms constitute the entire agreement between you and Challenz regarding your use of the Platform and supersede all prior agreements, understandings, and representations regarding the same.

15. Contact Us
If you have any questions about these Terms, please contact us at challenzsocial@gmail.com or visit our Contact Page.

© 2025. All rights reserved.

`;

export const privacyPolicyText = `
Last updated: November 25, 2024

Welcome to Challenz. This Privacy Policy applies to Challenz services (the “Platform”), which include Challenz apps, websites, software, and related services accessed via any platform or device that links to this Privacy Policy. The Platform is provided and controlled by MegaBliss LTD, with its registered address at 30A Sunnymead Road, Glen Innes, Auckland 1072, New Zealand (“Challenz,” “we,” or “us”).

We are committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, share, and otherwise process the personal information of users and other individuals in connection with our Platform. If you do not agree with this policy, you should not use the Platform.

What Information We Collect
  
Information You Provide

Profile Information:
When you register on the Platform, you provide information such as your username, password, date of birth (if applicable), email address and/or phone number, and other details in your profile, including your photograph or profile video.
    
User Content:
We process the content you create on the Platform, including photographs, audio, videos, comments, hashtags, feedback, reviews, livestreams, and associated metadata (e.g., time, location, creator details). Even if you are not a user, your information may appear in User Content published on the Platform. We collect User Content during its creation, import, or upload—even if you don’t save or upload it—to provide recommendations or effects.
    
Messages:
We collect information from messages sent or received via the Platform's messaging features. This includes messages between users, communications with merchants, and interactions with virtual assistants. Information includes the message content, timestamps, and participant details. Messages sent to other users are accessible to them, and we are not responsible for how they are used or shared.
    
Clipboard Access:
With your permission, we access content in your device’s clipboard (e.g., text, images, video) for features like sharing with third-party platforms or pasting content into the Platform.
    
Purchase Information:
When you make purchases or payments on the Platform, such as buying items within the Platform or using Challenz Coins (Uwaci Coins) to get discounts at partner shops, we collect transaction details including your payment method, billing and delivery information, and purchase details.
    
Contacts:
If you sync your phone or social media contacts, we collect details such as names, phone numbers, and email addresses to match existing users on the Platform. Public profile information from social networks may also be collected.
    
Identity or Age Proof:
Verification of identity or age may be required for certain features (e.g., livestreams, Business Accounts) or to ensure compliance with Platform rules.
    
Correspondence:
Information you send to us, such as support requests or feedback.
    
Participation Data:
Information collected during surveys, contests, marketing campaigns, or events conducted by us.

Automatically Collected Information
Usage Information:
Details about how you use the Platform, such as interactions with content, advertisements, search history, and engagement metrics (e.g., likes, follows, problems encountered).
   
Inferred Information:
We infer attributes like interests, gender, and age range to personalize content.
   
Technical Information:
Device details such as IP address, user agent, carrier, device model, operating system, network type, screen resolution, app/file details, and keystroke patterns.
   
Location Information:
Approximate or precise location data (e.g., GPS, IP address, or SIM card information), including points of interest added to your content.
   
Image and Audio Data:
Information about video, image, and audio content, such as objects, scenery, or spoken words for enabling effects, content moderation, and recommendations.
   
Cookies:
Cookies and similar technologies collect data on your interaction with the Platform, preferences, and ad performance. Cookies enable functionalities like analytics and advertising.

Information From Other Sources
Third-Party Accounts:
If you register or log in via a third-party social network (e.g., Facebook, Google), we may receive your username, profile, and associated data.
    
Advertisers and Partners:
Advertisers or measurement partners may share information about your actions on other platforms (e.g., purchases or website visits) and hashed identifiers for advertising.
    
Affiliated Entities:
Data from related entities within our corporate group about your activities on their platforms.
    
Public and Third-Party Data:
Information from public sources or third parties, such as mentions in User Content, complaints, or feedback.
    
Merchants and Payment Providers:
Details about transactions and deliveries from merchants on the Platform.

How We Use Your Information
As outlined below, we utilize your information to enhance, manage, and provide support for the Challenz Platform, to enable its functionalities, and to fulfill and enforce our Terms of Service. Additionally, we may use your data to personalize content, promote the Platform, and tailor your ad experience. Specifically, we use the information we collect in the following ways:

   
Service Fulfillment:
To fulfill requests for products, services, Platform functionalities, support, and information, and to carry out internal operations such as troubleshooting, data analysis, testing, research, statistical analysis, and surveys. This also includes gathering your feedback.
   
Shopping Features:
To provide shopping functionalities, including facilitating purchases and deliveries. We share your data with merchants, payment processors, transaction fulfillment providers, and other service providers to process your orders.
   
Content Personalization:
To tailor the content you view based on your preferences and activities, such as content similar to what you’ve liked or interacted with, and according to country settings.
   
Promotional Communications:
To send you promotional materials via instant messaging or email, either directly from us or on behalf of affiliates and trusted third parties.
   
Platform Development:
To improve and develop the Platform and conduct product research and development.
   
Advertisement Effectiveness:
To measure and analyze the effectiveness of advertisements and other content displayed to you, and to deliver targeted advertising.
   
Social Features:
To enable social functionalities, such as connecting you with others through "Find Friends," showing your activity status to friends, messaging services, account suggestions, and interaction with User Content.
   
Virtual Items Program:
To allow you to participate in the Platform’s virtual items program.
   
Interactive Features:
To enable interactive features, such as allowing your content to be used in other users' videos.
   
Advertising and Marketing:
To incorporate User Content into our advertising and marketing campaigns to promote the Platform, as well as to invite participation in events or promote trending topics and hashtags.
   
Usage Understanding:
To analyze how you use the Platform, including across different devices.
   
Inferred Information:
To infer additional details about you, such as your age range, gender, and interests.
   
Safety and Security:
To identify and address abusive, harmful, or illegal activity, as well as spam and fraud on the Platform.
   
Content Display:
To ensure content is presented effectively for you and your device.
   
Content Moderation:
To maintain safety and security by scanning, analyzing, and reviewing User Content, messages, and associated metadata for compliance with our Terms of Service, Community Guidelines, and other policies.
   
Research Facilitation:
To enable independent research that meets specific criteria.
   
Identity Verification:
To verify your identity or age when necessary.
   
Communication:
To notify you about updates to services or policies and to engage with you about contests or promotions, including delivering applicable prizes if permitted by promotion rules.
   
Legal Compliance:
To enforce our Terms of Service, Community Guidelines, and other policies.
   
Location Services:
Consistent with your permissions, to provide location-based services, such as personalized content and advertising.
   
Technology Training:
To train and improve our technology, including machine learning models and algorithms.
   
Transaction Facilitation:
To enable purchases, promotions, and services on the Platform and provide user support.

How We Share Your Information
We may share your information with the following entities:
Business Partners
If you register or use the Platform through a social network (e.g., Facebook, Instagram, Google), you will share account details such as your username, public profile, and other associated information. We may also share certain information with the social network (e.g., app ID, access token).
Content shared on social media or instant messaging platforms (e.g., WhatsApp) will include your video, username, and accompanying text or a link to the content.

Service Providers
Operational Support:
Service providers help us manage content moderation, cloud services, and marketing efforts to ensure the Platform remains safe and user-friendly.
Payment Processors:
For Coin transactions or other payments, we share transaction details with payment providers to process the transaction and credit your account.
Analytics Providers:
We use analytics services to optimize and improve the Platform and assist in delivering targeted ads.

Advertisers and Measurement Partners
We share data with advertisers and measurement companies to analyze ad performance. Information is also shared with advertising networks to display personalized ads.

Independent Researchers
Information is shared with researchers to facilitate studies that meet certain criteria.

Corporate Group
We share information with our corporate affiliates and subsidiaries for Platform improvement, optimization, and user support.

Legal Reasons
Information may be shared with law enforcement or public authorities to:
Comply with legal obligations or requests.
Enforce our Terms of Service and investigate potential violations.
Detect and address security, fraud, or technical issues.
Protect the rights, property, or safety of users or the public.

Public Profiles
If your profile is public, your content can be accessed or shared by friends, followers, third parties, search engines, and aggregators. You can change your profile to private in the settings.

Business Transactions
In the event of a sale, merger, acquisition, or business restructuring, user information may be transferred as part of the transaction.

Merchants and Service Providers
For purchases, transaction details (e.g., order items, contact details, and delivery information) are shared with merchants and service providers for processing and delivery.

Where We Store Your Information
Your data may be stored on servers located outside your country, such as in New Zealand, France, or the United States, to ensure global availability of our services.
Your Rights and Choices

You have certain rights and choices regarding your information. Under applicable laws, these rights may include the ability to access, delete, update, or rectify your data, to be informed about how your data is processed, to file complaints with authorities, and possibly other rights. You can submit a request to exercise your rights under applicable laws at Challenz Privacy Report Page or by emailing us through challenzsocial@gmail.com. You may appeal any decision regarding your request by following the instructions provided in the communication notifying you of our decision. Please refer to the Supplemental Terms for information on whether a local representative or contact is available for your country.

You can access and edit most of your profile information by logging into Challenz. You can delete User Content that you have uploaded. Additionally, we provide tools in Settings that allow you to control who can view your videos, send you messages, or post comments on your videos. If you wish, you may delete your entire account in Settings.

You may have the option to refuse or disable Cookies by adjusting your browser settings. Each browser is different, so consult the specific instructions provided by your browser. Additional steps may be necessary to refuse or disable certain types of Cookies, especially in mobile applications. For example, disabling Cookies for targeted advertising in a browser may differ from disabling them in a mobile application, which can be managed through device settings or app permissions. Opt-out preferences are specific to the browser or device you are using at the time, so you may need to configure settings separately for each browser or device. Note that refusing, disabling, or deleting Cookies may affect certain functionalities of the Platform.
The Security of Your Information

We take steps to ensure your information is treated securely and in accordance with this policy. While we employ reasonable measures, such as encryption, to protect your personal data, transmission of information over the internet is not entirely secure. We cannot guarantee the security of your information transmitted via the Platform, and any such transmission is at your own risk.

We have implemented appropriate technical and organizational measures to mitigate risks to the security of your data. These measures are designed to account for the varying likelihood and severity of potential risks to your rights and freedoms. We periodically review and update these measures to enhance the overall security of our systems.

The Platform may include links to websites of our partners, advertisers, or affiliates. These external websites have their own privacy policies, and we do not assume responsibility for their practices. Review their policies before submitting any personal information.

How Long We Keep Your Information
We retain information for as long as necessary to provide the Platform and fulfill the purposes outlined in this Privacy Policy. Retention may also occur to meet contractual and legal obligations, legitimate business interests (such as improving Platform functionality, safety, and stability), or for the exercise or defense of legal claims.

Retention periods depend on factors such as the type of information and its intended use. For instance:
Profile Information:
Retained as long as your account is active.
Violation of Policies:
If you breach our Terms of Service, Community Guidelines, or other conditions, your profile and User Content may be removed from public view immediately. However, we may retain other information to address the violation.

Information Relating to Children and Teens
Challenz is not intended for use by children under the age of 13. In certain jurisdictions, this age threshold may be higher due to local regulatory requirements. For specific details, refer to the Supplemental Terms for your region. If you believe a user is under this minimum age, please contact us at Challenz Privacy Report Page or email us through challenzsocial@gmail.com.

For parents or guardians, our Guardian’s Guide provides resources to help you understand the Platform and manage tools and controls.
Privacy Policy Updates

We may update this Privacy Policy periodically. Updates will be communicated by revising the "Last Updated" date at the top of this policy and, where required, by providing additional notices. Continued access to or use of the Platform after the updated policy takes effect constitutes your acceptance of the changes. If you do not agree with the updated policy, you must stop using the Platform.
Contact

If you have questions, comments, complaints, or requests regarding this Privacy Policy, please reach out to us at Challenz Privacy Report Page or email us through challenzsocial@gmail.com.

We will strive to address your inquiries as quickly as possible. Additionally, you retain the right to file a complaint with the appropriate data protection authority, where applicable.

Please refer to the Supplemental Terms for information about local representatives or contacts specific to your region.
Supplemental Terms – Jurisdiction-Specific

In the event of a conflict between the provisions of these Supplemental Terms – Jurisdiction-Specific that apply to your jurisdiction and the general Privacy Policy, the relevant jurisdiction-specific terms will supersede and control.
Children's Privacy Policy
Last updated: November 25, 2024
For Children

Challenz values your privacy. Children under the age of 13 in certain jurisdictions can use Challenz in a restricted experience (“Children Mode”). When you use Children Mode, we collect limited information about you. This policy explains what information we collect and how we use it.
What Information Do We Collect From You?

When you use Challenz, we collect certain information:
During Account Creation:
We collect your username, birthday, and password when you set up a Challenz account.
From Your Device:
We collect information about your device (e.g., device type), and details about the videos you watch while using the Platform.
When You Contact Us:
If you send us feedback or questions, we may collect your email address to respond to your inquiry.

How Do We Use Your Information?
We use your information to provide and enhance your experience with Challenz:
To authenticate your access using your username and password.
To recommend additional videos based on what you watch.
To ensure smooth operation by using device-related information.

How Do We Share Your Information?
We may share your information in the following ways:

With Support Companies:
To help Challenz operate efficiently.
For Safety and Compliance:
To protect you, others, and Challenz; ensure legal compliance; or respond to lawful requests.
No Ads or Sales of Information:
We do not sell your information or share it for cross-context behavioral advertising.

Data Security and Retention
We use security measures to protect your information. However, online transmission carries risks. Information is retained only as long as necessary for its purpose, subject to legal and operational requirements. Data may be stored on servers located outside the user’s country.

Your Rights
Parents or guardians may:
Submit a request to access or delete their Child’s information.
Appeal decisions about such requests by contacting us through the provided webform or address (challenzsocial@gmail.com).

These requests will be processed in compliance with applicable laws and subject to validation.
Privacy Policy Updates

This Privacy Policy may be updated periodically. Please check back for updates.

Contact Us
For questions or requests about this Privacy Policy, please reach out to us:
Email Address: challenzsocial@gmail.com
`;

export const eulaText = `

Last Revised: February 20, 2025

This End User License Agreement (“Agreement”) is between you (“Licensee” or “you”) and Challenz (“Licensor” or “we”), a digital platform and mobile application. By downloading, installing, accessing, or using the Challenz app (the “Software”), you agree to the terms and conditions set forth in this Agreement. If you do not agree to these terms, you may not use the Software.

1. License Grant
Subject to the terms and conditions of this Agreement, we grant you a non-exclusive, non-transferable, revocable license to use the Software solely for personal, non-commercial purposes, on a compatible device that you own or control. This license is granted for the duration of your access to the Software and may be terminated according to the provisions of this Agreement.

2. Restrictions
You may not:
•	Modify, alter, reverse engineer, decompile, or disassemble the Software.
•	Resell, lease, sublicense, or distribute the Software to third parties.
•	Use the Software in any manner that could damage, disable, overburden, or impair the Software or interfere with any other party’s use of the Software.
•	Use the Software to create or distribute malicious software or for any unlawful or harmful purpose.

3. Ownership & Copyright
The Software and all related content, including but not limited to, graphics, text, logos, trademarks, and the underlying technology, are the property of Challenz and are protected by copyright, trademark, and other intellectual property laws. This Agreement does not transfer any ownership rights to you. All rights not expressly granted to you are reserved by Challenz.

4. Liability Limitation
To the fullest extent permitted by law, Challenz shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your use or inability to use the Software. This includes, without limitation, loss of data, loss of profits, or interruption of business, even if Challenz has been advised of the possibility of such damages.

5. Termination
This Agreement will remain in effect until terminated. You may terminate it by uninstalling the Software. Challenz may terminate or suspend your license if you violate any terms of this Agreement, or if Challenz deems your use of the Software to be harmful or inappropriate. Upon termination, you must cease all use of the Software and delete any copies in your possession.

6. Updates & Support
Challenz may, at its sole discretion, provide updates, bug fixes, patches, or other modifications to the Software. However, there is no obligation to provide such updates, and Challenz is not required to offer technical support or maintenance for the Software.

7. Objectionable Content/Material Policy
You agree that you will not upload, post, or transmit any content that is:
•	Illegal, harmful, offensive, or violates the rights of others.
•	Abusive, defamatory, threatening, or harassing.
•	Pornographic, explicit, or sexually inappropriate.
•	Infringing on any intellectual property rights or violating the privacy rights of others.
•	Promoting violence, hatred, or discrimination.
Consequences for Violations: Failure to comply with this policy may result in immediate termination of your license, removal of objectionable content, or other actions as deemed appropriate by Challenz. If the violation involves illegal activity, we may report it to the appropriate authorities.

8. Miscellaneous
•	Entire Agreement: This Agreement constitutes the entire agreement between you and Challenz regarding the Software and supersedes any prior agreements or understandings.
•	Governing Law: This Agreement is governed by the laws of New Zealand.
•	Severability: If any provision of this Agreement is deemed invalid or unenforceable, the remainder of the Agreement will remain in effect.
•	Amendments: Challenz may update this Agreement from time to time. Any changes will be communicated via the Software or other means.

By using the Software, you acknowledge that you have read and understood this Agreement and agree to be bound by its terms and conditions.
Contact Information: For questions or concerns regarding this Agreement, please contact us at challenzsocial@gmail.com

`;

export const languages = [
  { code: "ar", label: "Arabic" },
  { code: "bn", label: "Bengali" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "cs", label: "Czech" },
  { code: "da", label: "Danish" },
  { code: "nl", label: "Dutch" },
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ha", label: "Hausa" },
  { code: "hi", label: "Hindi" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "pl", label: "Polish" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "es", label: "Spanish" },
  { code: "sw", label: "Swahili" },
  { code: "sv", label: "Swedish" },
  { code: "tr", label: "Turkish" },
  { code: "uk", label: "Ukrainian" },
  { code: "vi", label: "Vietnamese" },
  { code: "ln", label: "Lingala" },
  { code: "kg", label: "Kikongo" },
  { code: "lu", label: "Tshiluba" },
  { code: "yo", label: "Yoruba" },
  { code: "ig", label: "Igbo" },
  // Add more languages as needed
];

export const themes = [
  "light",
  "dark",
  "green",
  "blue",
  "ocean",
  "solarized",
  "teal",
  // "midnight",
  // "sunset-teal", // New Theme
  // "pastel-breeze", // New Theme
];

// Helper function to format theme codes to display names
export const formatThemeName = (themeCode: string): string => {
  return themeCode
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Password strength regex patterns
export const containsUppercase = /[A-Z]/;
export const containsLowercase = /[a-z]/;
export const containsNumber = /[0-9]/;
export const containsSpecial = /[^A-Za-z0-9]/;

export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (containsUppercase.test(password)) strength += 25;
  if (containsLowercase.test(password)) strength += 25;
  if (containsNumber.test(password) || containsSpecial.test(password)) {
    strength += 25;
  }
  return strength;
};

export const calculateAge = (birthday: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthday.getDate())
  ) {
    age--;
  }

  return age;
};

// Updated Form Schema
export const formSchema = z
  .object({
    firstname: z.string().min(3, "First name must be at least 3 characters."),
    lastname: z.string().min(3, "Last name must be at least 3 characters."),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    email: z.string().email("Please enter a valid email address."),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
      .optional(),
    birthday: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthday must be in the format YYYY-MM-DD")
      .refine((dateStr) => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      }, "Invalid date")
      .transform((dateStr) => new Date(dateStr)),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must be less than 64 characters")
      .regex(
        containsUppercase,
        "Password must contain at least one uppercase letter",
      )
      .regex(
        containsLowercase,
        "Password must contain at least one lowercase letter",
      )
      .regex(
        /[0-9]|[^A-Za-z0-9]/,
        "Password must contain at least one number or special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      const age = calculateAge(data.birthday);
      return age >= 18;
    },
    {
      message: "You must be 18 or older to create an account",
      path: ["birthday"],
    },
  );
